// ════════════════════════════════════════════════════════════
// INFRASTRUCTURE GROUPS (10 total)
// ════════════════════════════════════════════════════════════

const infraGroups = [
  // ── Original 5 groups (3 expanded) ──
  {
    title: 'Core Entities',
    dotColor: '#1a9e50',
    items: [
      { name: 'Organization', desc: 'id, name, slug, plan', detail: `<h3>Schema</h3><p><code>Organization { id, name, slug, settings, stripeCustomerId, plan, createdAt }</code></p><p>Top-level tenant. All data scoped via orgId.</p>` },
      { name: 'User', desc: 'id, email, cognitoSub', detail: `<h3>Schema</h3><p><code>User { id, cognitoSub, email, name, phone, createdAt }</code></p><p>Linked to Cognito. Can belong to multiple orgs via Membership.</p>` },
      { name: 'Membership', desc: 'userId, orgId, role', detail: `<h3>Schema</h3><p><code>Membership { id, userId, orgId, role, status, joinedAt }</code></p><h3>Roles</h3><ul><li>ADMIN — full org access</li><li>INSPECTOR — create inspections</li><li>VIEWER — read-only</li></ul>` },
      { name: 'Person', desc: 'orgId, name, type', detail: `<h3>Schema</h3><p><code>Person { id, orgId, name, email, phone, type }</code></p><p>Represents clients, contacts. Not a User — Persons don't log in.</p>` },
      { name: 'UserPreference', desc: 'userId, defaults, overrides', detail: `<h3>Schema</h3><p><code>UserPreference { userId, defaultFormId, captureMode, notificationPrefs, featureOverrides }</code></p><p>Per-user settings that override org-level defaults.</p>` },
    ]
  },
  {
    title: 'Form System',
    dotColor: '#2b7de9',
    items: [
      { name: 'Form', desc: 'orgId, name, version', detail: `<h3>Schema</h3><p><code>Form { id, orgId, name, version, schema, isTemplate, publishedAt }</code></p><p>Versioned inspection form definition.</p>` },
      { name: 'FormField', desc: 'formId, label, type', detail: `<h3>Schema</h3><p><code>FormField { id, formId, sectionId, label, type, options, order, required }</code></p><p>Types: text, number, select, photo, signature, date, GPS.</p>` },
      { name: 'FormTemplate', desc: 'category, schema', detail: `<p>Pre-built templates managed by PAX. Cloned into org-owned Forms. Categories: EPS, Property, Safety, General.</p>` },
      { name: 'FormVersion', desc: 'formId, snapshot', detail: `<p>Immutable snapshot of Form + FormFields at publish time. Past inspections reference specific versions.</p>` },
      { name: 'FormGuidance', desc: 'formId, markdown, hints', detail: `<h3>Schema</h3><p><code>FormGuidance { formId, markdownContent, examples[], fieldMappingHints }</code></p><p>Markdown docs fed to AI during extraction for improved accuracy.</p>` },
      { name: 'FieldConfig', desc: 'fieldId, importance, terms', detail: `<h3>Schema</h3><p><code>FieldConfig { fieldId, importance, keyTerms[], validationRules, descriptiveText }</code></p><p>Per-field advanced configuration for AI extraction and quality validation.</p>` },
    ]
  },
  {
    title: 'Inspection Entities',
    dotColor: '#e07020',
    items: [
      { name: 'CallSession', desc: 'orgId, formId, status', detail: `<h3>Schema</h3><p><code>CallSession { id, orgId, userId, formId, mode, status, twilioCallSid, startedAt, completedAt }</code></p><p>Status: draft → in_progress → ai_processing → review → approved → delivered.</p>` },
      { name: 'FormFieldValue', desc: 'value, confidence', detail: `<h3>Schema</h3><p><code>FormFieldValue { id, callSessionId, formFieldId, value, confidence, source, editedAt }</code></p>` },
      { name: 'Assignment', desc: 'userId, formId, deadline', detail: `<p><code>Assignment { id, orgId, userId, formId, propertyId, deadline, notes, status, externalTicketId }</code></p>` },
      { name: 'Photo', desc: 'sessionId, s3Key', detail: `<p><code>Photo { id, callSessionId, s3Key, mimeType, caption, gpsLat, gpsLng }</code></p>` },
      { name: 'Transcript', desc: 'sessionId, text', detail: `<p><code>Transcript { id, callSessionId, fullText, segments[], speakers[] }</code></p>` },
      { name: 'InspectionMode', desc: 'SITE_WALK, AFTER_FACT', detail: `<p>Enum stored on CallSession. Determines data capture path and AI extraction strategy.</p>` },
      { name: 'TicketSource', desc: 'provider, externalId', detail: `<p><code>TicketSource { provider, externalId, mappedFormId }</code>. External ticket → Assignment mapping.</p>` },
      { name: 'PhotoAnnotation', desc: 'photoId, type, coords', detail: `<p><code>PhotoAnnotation { photoId, type, coordinates, text, color }</code>. Markup layer on photos — circles, arrows, text tags.</p>` },
    ]
  },
  {
    title: 'AWS Infrastructure',
    dotColor: '#7c3aed',
    items: [
      { name: 'App Runner', desc: 'API hosting, auto-scale', detail: `<p>Hosts the Hono API. Auto-scaling, managed TLS. ECR image-based deployment.</p>` },
      { name: 'S3', desc: 'Media + PDFs', detail: `<p>Stores recordings, photos, generated PDFs. Presigned URLs for secure access.</p>` },
      { name: 'SQS', desc: 'Job queues, DLQ', detail: `<p>Separate queues per job type: AI extraction, PDF generation, email delivery.</p>` },
      { name: 'Lambda', desc: 'Async workers', detail: `<p>SQS-triggered functions for heavy async tasks.</p>` },
      { name: 'ECR', desc: 'Docker registry', detail: `<p>Docker image registry. GitHub Actions pushes on merge.</p>` },
      { name: 'Cognito', desc: 'Auth + JWT', detail: `<p>User authentication, JWT issuance + verification, password reset.</p>` },
      { name: 'Secrets Manager', desc: 'API keys, creds', detail: `<p>All API keys and credentials. Accessed at runtime by App Runner + Lambda.</p>` },
    ]
  },
  {
    title: 'External Services',
    dotColor: '#6b7080',
    items: [
      { name: 'Twilio', desc: 'Voice, SMS, numbers', detail: `<h3>Usage</h3><ul><li>Programmable Voice for phone inspections</li><li>SMS/MMS for photo capture</li><li>Phone number provisioning ($1/mo)</li></ul>` },
      { name: 'Stripe', desc: 'Billing + subscriptions', detail: `<ul><li>Subscription billing per org</li><li>Usage-based pricing</li><li>Customer portal for self-serve</li></ul>` },
      { name: 'OpenAI / Anthropic', desc: 'GPT-4o, Claude, Whisper', detail: `<ul><li>GPT-4o: field extraction + photo analysis</li><li>Claude: complex reasoning + validation</li><li>Whisper: batch transcription</li></ul><p>AI cost per inspection: $0.05–$0.15.</p>` },
      { name: 'Deepgram', desc: 'Real-time STT', detail: `<p>Real-time streaming speech-to-text. $0.0043/min.</p>` },
    ]
  },

  // ── 5 New groups ──
  {
    title: 'Normalization System',
    dotColor: '#7c3aed',
    items: [
      { name: 'Alias', desc: 'orgId, canonical, variants[]', detail: `<h3>Schema</h3><p><code>Alias { orgId, formId?, canonical, variants[] }</code></p><p>Maps informal terms/acronyms to canonical values. E.g., "LTN" → "Lifetime North".</p>` },
      { name: 'VocabularyPackage', desc: 'orgId, industry, terms[]', detail: `<h3>Schema</h3><p><code>VocabularyPackage { orgId, industry, terms[] }</code></p><p>Industry-specific term packages pre-built by PAX. Pest control, HVAC, electrical, etc.</p>` },
      { name: 'InspectorCorrection', desc: 'sessionId, aiValue, corrected', detail: `<h3>Schema</h3><p><code>InspectorCorrection { sessionId, fieldId, aiValue, correctedValue }</code></p><p>Every inspector edit of an AI value captured for learning pipeline.</p>` },
    ]
  },
  {
    title: 'Session Metadata',
    dotColor: '#1a9e50',
    items: [
      { name: 'SessionMeta', desc: 'sessionId, weather, device', detail: `<h3>Schema</h3><p><code>SessionMeta { sessionId, weather, deviceInfo, pauseCount, gpsTrack[], startedAt, completedAt }</code></p><p>Auto-captured context for every inspection session.</p>` },
      { name: 'WeatherSnapshot', desc: 'temp, conditions, humidity', detail: `<p><code>WeatherSnapshot { temperature, conditions, humidity, windSpeed }</code>. Auto-fetched from GPS coordinates at session start.</p>` },
    ]
  },
  {
    title: 'Output & Export',
    dotColor: '#2b7de9',
    items: [
      { name: 'OutputConfig', desc: 'formId, format, mapping', detail: `<h3>Schema</h3><p><code>OutputConfig { formId, format, template, targetSystem, fieldMapping[] }</code></p><p>Per-form output configuration driving PDF, CSV, JSON, and webhook delivery.</p>` },
      { name: 'OutputTemplate', desc: 'orgId, layout, brand', detail: `<h3>Schema</h3><p><code>OutputTemplate { orgId, layout, brandAssets, fieldPlacements[] }</code></p><p>Branded PDF report template with field placement configuration.</p>` },
      { name: 'ExportJob', desc: 'sessionId, target, status', detail: `<h3>Schema</h3><p><code>ExportJob { sessionId, targetSystem, format, status, deliveredAt }</code></p><p>Tracks delivery of inspection data to external systems with retry logic.</p>` },
      { name: 'DataFlowMap', desc: 'formId, fieldId, target', detail: `<h3>Schema</h3><p><code>DataFlowMap { formId, fieldId, outputTarget, transformation }</code></p><p>Visual field-to-output mapping configured by admin in flow editor.</p>` },
    ]
  },
  {
    title: 'Push Notifications',
    dotColor: '#e07020',
    items: [
      { name: 'PushToken', desc: 'userId, deviceToken, platform', detail: `<h3>Schema</h3><p><code>PushToken { userId, deviceToken, platform }</code></p><p>Device registration for push notifications. Supports iOS and Android via Expo Push.</p>` },
      { name: 'NotificationEvent', desc: 'type, recipientId, payload', detail: `<h3>Schema</h3><p><code>NotificationEvent { type, recipientId, payload, sentAt, readAt }</code></p><p>Types: assignment_created, review_requested, approval_status, completion_confirmed.</p>` },
    ]
  },
  {
    title: 'Licensing & Onboarding',
    dotColor: '#6b7080',
    items: [
      { name: 'License', desc: 'orgId, code, maxSeats', detail: `<h3>Schema</h3><p><code>License { orgId, code, maxSeats, usedSeats, expiresAt }</code></p><p>Company codes for batch employee onboarding. Admin generates, inspectors redeem.</p>` },
      { name: 'OrgFeatureConfig', desc: 'orgId, toggles, defaults', detail: `<h3>Schema</h3><p><code>OrgFeatureConfig { orgId, markupEnabled, captioningMode, defaultCaptureMode }</code></p><p>Per-org feature toggles and default settings. Users can override via UserPreference.</p>` },
    ]
  },
];
