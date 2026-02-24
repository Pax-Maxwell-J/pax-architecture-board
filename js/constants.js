// ════════════════════════════════════════════════════════════
// CONSTANTS & HELPERS
// ════════════════════════════════════════════════════════════

const NODE_W = 260;
const TIER_PAD_X = 50;
const TIER_PAD_Y = 28;

const COLORS = {
  blue:   { stroke: '#2b7de9', dim: '#e8f0fc', fill: 'rgba(43,125,233,0.12)' },
  orange: { stroke: '#e07020', dim: '#fdf0e6', fill: 'rgba(224,112,32,0.12)' },
  green:  { stroke: '#1a9e50', dim: '#e6f7ee', fill: 'rgba(26,158,80,0.12)' },
  purple: { stroke: '#7c3aed', dim: '#f0e8fd', fill: 'rgba(124,58,237,0.12)' },
  gray:   { stroke: '#6b7080', dim: '#eef0f4', fill: 'rgba(107,112,128,0.12)' },
};

function estimateNodeHeight(node) {
  let h = 52; // base: padding (24) + title row (20) + margin (8)
  if (node.desc) {
    const lines = Math.ceil(node.desc.length / 38);
    h += lines * 16;
  }
  if (node.fields) {
    const fieldLines = (node.fields.match(/<br>/g) || []).length + 1;
    h += 14 + fieldLines * 15;
  }
  return Math.max(85, Math.min(h, 200));
}

function getProgressColor(p) {
  if (p >= 1) return '#1a9e50';
  if (p > 0) return '#2b7de9';
  return '#c4c8d4';
}

function getProgressLabel(p) {
  if (p >= 1) return 'Shipped';
  if (p >= 0.5) return 'Building';
  if (p > 0) return 'Early';
  return 'Vision';
}

// Map tier+row to ELK partition index (updated for 65-node layout)
function getPartition(tier, row) {
  const offsets = { 0: 0, 1: 4, 2: 5, 3: 7, 4: 9, 5: 11, 6: 12, 7: 13 };
  return offsets[tier] + (row || 0);
}
