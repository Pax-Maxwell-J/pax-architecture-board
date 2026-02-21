// ════════════════════════════════════════════════════════════
// APP — Layout, Rendering, Interactions, Minimap
// ════════════════════════════════════════════════════════════

// Build node lookup
const nodeById = {};
nodes.forEach(n => { nodeById[n.id] = n; });

// ── ELK Layout ──
function buildElkGraph() {
  const forwardEdges = edges.filter(e => e.type !== 'loop');
  return {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.edgeRouting': 'SPLINES',
      'elk.partitioning.activate': 'true',
      'elk.layered.spacing.nodeNodeBetweenLayers': '110',
      'elk.spacing.nodeNode': '40',
      'elk.layered.spacing.edgeNodeBetweenLayers': '30',
      'elk.layered.spacing.edgeEdgeBetweenLayers': '18',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
    },
    children: nodes.map(n => ({
      id: n.id,
      width: NODE_W,
      height: estimateNodeHeight(n),
      layoutOptions: {
        'elk.partitioning.partition': String(getPartition(n.tier, n.row)),
      }
    })),
    edges: forwardEdges.map((e, i) => ({
      id: 'e' + i,
      sources: [e.from],
      targets: [e.to],
    })),
  };
}

async function computeLayout() {
  const elk = new ELK();
  const graph = buildElkGraph();
  return await elk.layout(graph);
}


// ── State ──
const canvas = document.getElementById('canvas');
const wrapper = document.getElementById('canvas-wrapper');
const svgEdges = document.getElementById('svg-edges');
let tierBounds = {};
let posMap = {};
let scale = 0.4, panX = 20, panY = 10;
let isPanning = false, startX, startY;
let dataConnectionsVisible = false;


// ── Transform ──
function applyTransform() {
  canvas.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
  document.getElementById('zoom-level').textContent = Math.round(scale * 100) + '%';
  updateMinimap();
}


// ── Main Render ──
function render(layout) {
  layout.children.forEach(c => {
    posMap[c.id] = { x: c.x, y: c.y, w: c.width, h: c.height };
  });

  tiers.forEach(t => {
    const tierNodes = nodes.filter(n => n.tier === t.id);
    if (tierNodes.length === 0) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    tierNodes.forEach(n => {
      const p = posMap[n.id];
      if (!p) return;
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x + p.w);
      maxY = Math.max(maxY, p.y + p.h);
    });
    tierBounds[t.id] = {
      x: minX - TIER_PAD_X,
      y: minY - TIER_PAD_Y - 15,
      width: maxX - minX + 2 * TIER_PAD_X,
      height: maxY - minY + 2 * TIER_PAD_Y + 15,
    };
  });

  const graphW = (layout.width || 2000) + 200;
  const graphH = (layout.height || 3000) + 200;
  canvas.style.width = graphW + 'px';
  canvas.style.minHeight = graphH + 'px';

  const NS = 'http://www.w3.org/2000/svg';
  svgEdges.setAttribute('width', graphW);
  svgEdges.setAttribute('height', graphH);
  svgEdges.style.width = graphW + 'px';
  svgEdges.style.height = graphH + 'px';
  svgEdges.innerHTML = '';

  // Arrowhead defs
  const defs = document.createElementNS(NS, 'defs');
  const arrowColors = {
    blue: '#2b7de9', orange: '#e07020', green: '#1a9e50',
    purple: '#7c3aed', gray: '#6b7080', muted: '#a0a5b5', amber: '#d4a843'
  };
  Object.entries(arrowColors).forEach(([name, color]) => {
    const marker = document.createElementNS(NS, 'marker');
    marker.setAttribute('id', 'arrow-' + name);
    marker.setAttribute('markerWidth', '8');
    marker.setAttribute('markerHeight', '6');
    marker.setAttribute('refX', '7');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');
    marker.setAttribute('markerUnits', 'userSpaceOnUse');
    const poly = document.createElementNS(NS, 'polygon');
    poly.setAttribute('points', '0 0.5, 7 3, 0 5.5');
    poly.setAttribute('fill', color);
    poly.setAttribute('opacity', '0.7');
    marker.appendChild(poly);
    defs.appendChild(marker);

    const marker2 = document.createElementNS(NS, 'marker');
    marker2.setAttribute('id', 'arrow-' + name + '-rev');
    marker2.setAttribute('markerWidth', '8');
    marker2.setAttribute('markerHeight', '6');
    marker2.setAttribute('refX', '1');
    marker2.setAttribute('refY', '3');
    marker2.setAttribute('orient', 'auto-start-reverse');
    marker2.setAttribute('markerUnits', 'userSpaceOnUse');
    const poly2 = document.createElementNS(NS, 'polygon');
    poly2.setAttribute('points', '0 0.5, 7 3, 0 5.5');
    poly2.setAttribute('fill', color);
    poly2.setAttribute('opacity', '0.7');
    marker2.appendChild(poly2);
    defs.appendChild(marker2);
  });
  svgEdges.appendChild(defs);

  renderTierBackgrounds();
  renderEdges(layout);
  renderDataConnections();
  renderNodes();
  renderMinimap();

  requestAnimationFrame(() => fitAll());
}

function getAccentColorName(accent) {
  const map = { '#2b7de9': 'blue', '#e07020': 'orange', '#1a9e50': 'green', '#7c3aed': 'purple', '#6b7080': 'gray' };
  return map[accent] || 'blue';
}


// ── Tier Backgrounds ──
function renderTierBackgrounds() {
  tiers.forEach(t => {
    const b = tierBounds[t.id];
    if (!b) return;

    const div = document.createElement('div');
    div.className = 'tier-bg';
    div.id = 'tier-' + t.id;
    div.style.left = b.x + 'px';
    div.style.top = b.y + 'px';
    div.style.width = b.width + 'px';
    div.style.height = b.height + 'px';
    div.style.background = COLORS[getAccentColorName(t.accent)]?.fill || 'rgba(43,125,233,0.04)';
    div.style.border = '1px solid ' + t.accent + '12';

    div.innerHTML = `
      <div class="tier-label" style="color:${t.accent}">
        <div class="tier-num" style="background:${t.accent}15; color:${t.accent}">${t.id}</div>
        ${t.label}
      </div>
      <div class="tier-subtitle" style="color:${t.accent}">${t.subtitle}</div>
    `;
    canvas.insertBefore(div, svgEdges);
  });
}


// ── Edges ──
function renderEdges(layout) {
  const NS = 'http://www.w3.org/2000/svg';
  const forwardEdges = edges.filter(e => e.type !== 'loop');

  if (layout.edges) {
    layout.edges.forEach((elkEdge, i) => {
      const edgeData = forwardEdges[i];
      if (!edgeData) return;

      const srcNode = nodeById[edgeData.from];
      const color = COLORS[srcNode?.color]?.stroke || '#a0a5b5';
      const arrowName = srcNode?.color || 'muted';

      elkEdge.sections?.forEach(section => {
        const points = [];
        points.push(section.startPoint);
        if (section.bendPoints) points.push(...section.bendPoints);
        points.push(section.endPoint);

        const lineGen = d3.line()
          .x(d => d.x).y(d => d.y)
          .curve(d3.curveBasis);

        const path = document.createElementNS(NS, 'path');
        path.setAttribute('class', 'edge-path' + (edgeData.dashed ? ' dashed' : ''));
        path.setAttribute('d', lineGen(points));
        path.setAttribute('stroke', color);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('stroke-opacity', '0.5');
        path.setAttribute('marker-end', `url(#arrow-${arrowName})`);
        if (edgeData.bidirectional) {
          path.setAttribute('marker-start', `url(#arrow-${arrowName}-rev)`);
        }
        if (edgeData.dashed) {
          path.setAttribute('stroke-dasharray', '6 4');
          path.setAttribute('stroke-opacity', '0.4');
        }
        svgEdges.appendChild(path);
      });

      if (edgeData.label && elkEdge.sections?.[0]) {
        const section = elkEdge.sections[0];
        const allPts = [section.startPoint, ...(section.bendPoints || []), section.endPoint];
        const midIdx = Math.floor(allPts.length / 2);
        const mid = allPts[midIdx];

        const text = document.createElementNS(NS, 'text');
        text.setAttribute('class', 'edge-label');
        text.setAttribute('x', mid.x);
        text.setAttribute('y', mid.y - 6);
        text.textContent = edgeData.label;
        svgEdges.appendChild(text);
      }
    });
  }

  // Loop/backward edges (manually drawn)
  edges.filter(e => e.type === 'loop').forEach(e => {
    const src = posMap[e.from];
    const tgt = posMap[e.to];
    if (!src || !tgt) return;

    const srcNode = nodeById[e.from];
    const color = COLORS[srcNode?.color]?.stroke || '#a0a5b5';
    const arrowName = srcNode?.color || 'muted';

    const x1 = src.x + src.w;
    const y1 = src.y + src.h / 2;
    const x2 = tgt.x + tgt.w;
    const y2 = tgt.y + tgt.h / 2;
    const loopX = Math.max(x1, x2) + 200;

    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', `M ${x1},${y1} C ${loopX},${y1} ${loopX},${y2} ${x2},${y2}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-dasharray', '6 4');
    path.setAttribute('stroke-opacity', '0.4');
    path.setAttribute('marker-end', `url(#arrow-${arrowName})`);
    svgEdges.appendChild(path);

    if (e.label) {
      const text = document.createElementNS(NS, 'text');
      text.setAttribute('class', 'edge-label');
      text.setAttribute('x', loopX + 8);
      text.setAttribute('y', (y1 + y2) / 2);
      text.setAttribute('text-anchor', 'start');
      text.textContent = e.label;
      svgEdges.appendChild(text);
    }
  });
}


// ── Data Connections ──
function renderDataConnections() {
  const NS = 'http://www.w3.org/2000/svg';
  const dcGroup = document.createElementNS(NS, 'g');
  dcGroup.setAttribute('id', 'data-connection-group');
  dcGroup.style.display = 'none';

  dataConnections.forEach(dc => {
    const src = posMap[dc.from];
    const tgt = posMap[dc.to];
    if (!src || !tgt) return;

    const x1 = src.x + src.w / 2;
    const y1 = src.y + src.h / 2;
    const x2 = tgt.x + tgt.w / 2;
    const y2 = tgt.y + tgt.h / 2;

    const dx = x2 - x1, dy = y2 - y1;
    const cx = (x1 + x2) / 2 + (-dy * 0.15);
    const cy = (y1 + y2) / 2 + (dx * 0.15);

    const path = document.createElementNS(NS, 'path');
    path.setAttribute('class', 'data-conn-path');
    path.setAttribute('d', `M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}`);
    dcGroup.appendChild(path);

    const text = document.createElementNS(NS, 'text');
    text.setAttribute('class', 'data-conn-label');
    text.setAttribute('x', (x1 + 2 * cx + x2) / 4);
    text.setAttribute('y', (y1 + 2 * cy + y2) / 4 - 6);
    text.textContent = dc.label;
    dcGroup.appendChild(text);
  });

  svgEdges.appendChild(dcGroup);
}


// ── Nodes ──
function renderNodes() {
  nodes.forEach(n => {
    const p = posMap[n.id];
    if (!p) return;

    n._x = p.x;
    n._y = p.y;
    n._h = p.h;

    const div = document.createElement('div');
    div.className = 'node color-' + n.color;
    div.style.left = p.x + 'px';
    div.style.top = p.y + 'px';
    div.dataset.id = n.id;
    div.onclick = () => openModal(n);

    const circ = 2 * Math.PI * 9;
    const offset = circ * (1 - n.progress);
    const pc = getProgressColor(n.progress);
    const pct = Math.round(n.progress * 100);

    div.innerHTML = `
      <div class="node-top">
        <span class="node-icon">${n.icon}</span>
        <span class="node-title">${n.title}</span>
      </div>
      <div class="node-desc">${n.desc}</div>
      ${n.fields ? `<div class="node-fields">${n.fields}</div>` : ''}
      <span class="node-expand">\u2197</span>
      <div class="progress-ring" title="${pct}% complete \u2014 ${getProgressLabel(n.progress)}">
        <svg width="22" height="22" viewBox="0 0 22 22">
          <circle cx="11" cy="11" r="9" fill="none" stroke="#e2e4ea" stroke-width="2"/>
          ${n.progress > 0 ? `<circle cx="11" cy="11" r="9" fill="none" stroke="${pc}" stroke-width="2" stroke-dasharray="${circ}" stroke-dashoffset="${offset}" transform="rotate(-90 11 11)" stroke-linecap="round"/>` : ''}
        </svg>
      </div>
    `;

    canvas.appendChild(div);
  });
}


// ════════════════════════════════════════════════════════════
// PAN & ZOOM
// ════════════════════════════════════════════════════════════

wrapper.addEventListener('mousedown', (e) => {
  if (e.target.closest('.node, .infra-card, .nav-btn, .zoom-btn, #modal-overlay')) return;
  isPanning = true;
  startX = e.clientX - panX;
  startY = e.clientY - panY;
  wrapper.style.cursor = 'grabbing';
});

window.addEventListener('mousemove', (e) => {
  if (!isPanning) return;
  panX = e.clientX - startX;
  panY = e.clientY - startY;
  applyTransform();
});

window.addEventListener('mouseup', () => {
  isPanning = false;
  wrapper.style.cursor = 'grab';
});

wrapper.addEventListener('wheel', (e) => {
  e.preventDefault();
  const rect = wrapper.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const prevScale = scale;
  const delta = e.deltaY > 0 ? 0.93 : 1.07;
  scale = Math.max(0.1, Math.min(3, scale * delta));
  panX = mouseX - (mouseX - panX) * (scale / prevScale);
  panY = mouseY - (mouseY - panY) * (scale / prevScale);
  applyTransform();
}, { passive: false });


// ════════════════════════════════════════════════════════════
// INTERACTIONS
// ════════════════════════════════════════════════════════════

// ── Modal ──
function openModal(node) {
  document.getElementById('modal-title').textContent = node.title;

  const pct = Math.round(node.progress * 100);
  const pc = getProgressColor(node.progress);
  const pLabel = getProgressLabel(node.progress);
  const bar = document.getElementById('modal-progress-bar');
  const fill = document.getElementById('modal-progress-fill');
  bar.style.display = 'block';
  fill.style.width = pct + '%';
  fill.style.background = pc;

  const statusHTML = `<span class="modal-tag" style="background:${pc}18; color:${pc}">${pLabel} \u2014 ${pct}%</span>`;
  const detail = nodeDetails[node.id] || '<p>No additional details available.</p>';
  document.getElementById('modal-body').innerHTML = statusHTML + detail;
  document.getElementById('modal-overlay').classList.add('visible');
}

function openInfraModal(item) {
  document.getElementById('modal-title').textContent = item.name;
  document.getElementById('modal-progress-bar').style.display = 'none';
  document.getElementById('modal-body').innerHTML = item.detail || '<p>No additional details.</p>';
  document.getElementById('modal-overlay').classList.add('visible');
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('modal-overlay') && e.target !== document.getElementById('modal-close')) return;
  document.getElementById('modal-overlay').classList.remove('visible');
}

// ── Zoom Controls ──
function zoomIn() {
  const rect = wrapper.getBoundingClientRect();
  const cx = rect.width / 2, cy = rect.height / 2;
  const prevScale = scale;
  scale = Math.min(3, scale * 1.2);
  panX = cx - (cx - panX) * (scale / prevScale);
  panY = cy - (cy - panY) * (scale / prevScale);
  applyTransform();
}

function zoomOut() {
  const rect = wrapper.getBoundingClientRect();
  const cx = rect.width / 2, cy = rect.height / 2;
  const prevScale = scale;
  scale = Math.max(0.1, scale / 1.2);
  panX = cx - (cx - panX) * (scale / prevScale);
  panY = cy - (cy - panY) * (scale / prevScale);
  applyTransform();
}

function resetView() {
  scale = 0.4; panX = 20; panY = 10;
  applyTransform();
}

function fitAll() {
  const rect = wrapper.getBoundingClientRect();
  const allBounds = Object.values(tierBounds);
  if (allBounds.length === 0) return;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  allBounds.forEach(b => {
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.width);
    maxY = Math.max(maxY, b.y + b.height);
  });

  const graphW = maxX - minX;
  const graphH = maxY - minY;
  scale = Math.min(rect.width / (graphW + 80), rect.height / (graphH + 80)) * 0.92;
  panX = (rect.width - graphW * scale) / 2 - minX * scale;
  panY = (rect.height - graphH * scale) / 2 - minY * scale;
  applyTransform();
}

// ── Tier Navigation ──
function jumpToTier(idx) {
  const b = tierBounds[idx];
  if (!b) return;
  const rect = wrapper.getBoundingClientRect();

  scale = Math.min(rect.width / (b.width + 100), rect.height / (b.height + 100)) * 0.85;
  panX = (rect.width - b.width * scale) / 2 - b.x * scale;
  panY = (rect.height - b.height * scale) / 2 - b.y * scale;
  applyTransform();

  document.querySelectorAll('.nav-btn[data-tier]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tier === String(idx));
  });
}

// ── Data Connections Toggle ──
function toggleDataConnections() {
  dataConnectionsVisible = !dataConnectionsVisible;
  const dcGroup = document.getElementById('data-connection-group');
  if (dcGroup) dcGroup.style.display = dataConnectionsVisible ? 'block' : 'none';
  document.getElementById('data-toggle').classList.toggle('active', dataConnectionsVisible);
}

// ── Infrastructure Panel ──
function renderInfraPanel() {
  const content = document.getElementById('infra-content');
  infraGroups.forEach(group => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'infra-group';
    groupDiv.innerHTML = `<div class="infra-group-title"><div class="dot" style="background:${group.dotColor}"></div>${group.title}</div>`;

    const row = document.createElement('div');
    row.className = 'infra-row';

    group.items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'infra-card';
      card.style.borderLeft = '3px solid ' + group.dotColor;
      card.innerHTML = `<div class="infra-card-name" style="color:${group.dotColor}">${item.name}</div><div class="infra-card-desc">${item.desc}</div>`;
      card.onclick = () => openInfraModal(item);
      row.appendChild(card);
    });

    groupDiv.appendChild(row);
    content.appendChild(groupDiv);
  });
}

function toggleInfra() {
  document.getElementById('infra-panel').classList.toggle('collapsed');
}


// ════════════════════════════════════════════════════════════
// MINIMAP
// ════════════════════════════════════════════════════════════

let minimapSvg, minimapScale, minimapOffX, minimapOffY;
let minimapGraphW, minimapGraphH, minimapGraphMinX, minimapGraphMinY;

function renderMinimap() {
  const mmSvg = d3.select('#minimap-svg');
  mmSvg.selectAll('*').remove();

  const mmW = 200, mmH = 140;
  mmSvg.attr('viewBox', `0 0 ${mmW} ${mmH}`);

  const allBounds = Object.values(tierBounds);
  if (allBounds.length === 0) return;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  allBounds.forEach(b => {
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.width);
    maxY = Math.max(maxY, b.y + b.height);
  });

  minimapGraphMinX = minX;
  minimapGraphMinY = minY;
  minimapGraphW = maxX - minX;
  minimapGraphH = maxY - minY;

  minimapScale = Math.min(mmW / minimapGraphW, mmH / minimapGraphH) * 0.9;
  minimapOffX = (mmW - minimapGraphW * minimapScale) / 2;
  minimapOffY = (mmH - minimapGraphH * minimapScale) / 2;

  tiers.forEach(t => {
    const b = tierBounds[t.id];
    if (!b) return;
    mmSvg.append('rect')
      .attr('x', minimapOffX + (b.x - minX) * minimapScale)
      .attr('y', minimapOffY + (b.y - minY) * minimapScale)
      .attr('width', b.width * minimapScale)
      .attr('height', b.height * minimapScale)
      .attr('fill', t.accent)
      .attr('opacity', 0.15)
      .attr('rx', 2);
  });

  nodes.forEach(n => {
    const p = posMap[n.id];
    if (!p) return;
    mmSvg.append('rect')
      .attr('x', minimapOffX + (p.x - minX) * minimapScale)
      .attr('y', minimapOffY + (p.y - minY) * minimapScale)
      .attr('width', Math.max(2, NODE_W * minimapScale))
      .attr('height', Math.max(2, p.h * minimapScale))
      .attr('fill', COLORS[n.color]?.stroke || '#999')
      .attr('opacity', 0.7)
      .attr('rx', 1);
  });

  mmSvg.append('rect')
    .attr('id', 'mm-viewport')
    .attr('fill', 'rgba(43,125,233,0.1)')
    .attr('stroke', '#2b7de9')
    .attr('stroke-width', 1.5)
    .attr('rx', 2);

  minimapSvg = mmSvg;
}

function updateMinimap() {
  if (!minimapSvg) return;

  const mmVp = minimapSvg.select('#mm-viewport');
  if (mmVp.empty()) return;

  const wRect = wrapper.getBoundingClientRect();
  const viewLeft = -panX / scale;
  const viewTop = -panY / scale;
  const viewW = wRect.width / scale;
  const viewH = wRect.height / scale;

  const mmX = minimapOffX + (viewLeft - minimapGraphMinX) * minimapScale;
  const mmY = minimapOffY + (viewTop - minimapGraphMinY) * minimapScale;
  const mmW = viewW * minimapScale;
  const mmH = viewH * minimapScale;

  mmVp
    .attr('x', mmX).attr('y', mmY)
    .attr('width', mmW).attr('height', mmH);
}


// ════════════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ════════════════════════════════════════════════════════════

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeModal(); return; }
  if (document.getElementById('modal-overlay').classList.contains('visible')) return;

  if (e.key >= '0' && e.key <= '7') jumpToTier(parseInt(e.key));
  if (e.key === '+' || e.key === '=') zoomIn();
  if (e.key === '-') zoomOut();
  if (e.key === 'f') fitAll();
  if (e.key === 'r') resetView();
  if (e.key === 'i') toggleInfra();
  if (e.key === 'd') toggleDataConnections();
});


// ════════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════════

(async function init() {
  try {
    const layout = await computeLayout();
    render(layout);
    renderInfraPanel();
    document.getElementById('loading-indicator').classList.add('hidden');
  } catch (err) {
    console.error('Layout failed:', err);
    document.getElementById('loading-indicator').textContent = 'Layout failed: ' + err.message;
  }
})();
