// ════════════════════════════════════════════════════════════
// EDGES & DATA CONNECTIONS
// ════════════════════════════════════════════════════════════

const edges = [
  // ── Tier 0 internal — Admin setup flow ──
  { from: 'admin_signup',       to: 'create_org' },
  { from: 'create_org',         to: 'subscription' },
  { from: 'create_org',         to: 'form_builder' },
  { from: 'form_builder',       to: 'form_templates' },
  { from: 'form_builder',       to: 'form_versioning' },
  { from: 'create_org',         to: 'setup_properties' },
  { from: 'setup_properties',   to: 'assign_numbers' },
  { from: 'setup_properties',   to: 'integration_settings' },
  // New Tier 0 edges
  { from: 'form_builder',       to: 'form_ingestion', label: 'import fields' },
  { from: 'form_ingestion',     to: 'form_builder', type: 'loop', dashed: true, label: 'OCR → fields' },
  { from: 'form_builder',       to: 'field_configuration' },
  { from: 'form_builder',       to: 'form_markdown_guidance' },
  { from: 'create_org',         to: 'license_management' },
  { from: 'create_org',         to: 'vocabulary_aliases' },
  { from: 'create_org',         to: 'feature_toggles' },
  { from: 'field_configuration', to: 'output_configuration' },
  { from: 'form_builder',       to: 'output_configuration', label: 'form → output map' },

  // ── Tier 0 → Tier 1 ──
  { from: 'create_org',         to: 'invite_team' },
  { from: 'assign_numbers',     to: 'invite_team' },
  { from: 'license_management', to: 'license_code_entry' },
  { from: 'feature_toggles',    to: 'user_preferences', dashed: true, label: 'org defaults' },

  // ── Tier 1 internal — Onboarding chain ──
  { from: 'invite_team',        to: 'inspector_claims' },
  { from: 'invite_team',        to: 'license_code_entry', dashed: true, label: 'alt path' },
  { from: 'inspector_claims',   to: 'gets_app' },
  { from: 'license_code_entry', to: 'gets_app' },
  { from: 'gets_app',           to: 'user_preferences' },
  { from: 'gets_app',           to: 'training' },
  { from: 'user_preferences',   to: 'ready_inspect' },
  { from: 'training',           to: 'ready_inspect' },

  // ── Tier 1 → Tier 2 ──
  { from: 'ready_inspect',      to: 'self_start' },
  { from: 'form_builder',       to: 'admin_assigns', label: 'form select' },

  // ── Tier 2 internal — Triggers → Start ──
  { from: 'scheduler',          to: 'inspection_begins', dashed: true, label: 'recurring' },
  { from: 'admin_assigns',      to: 'inspection_begins' },
  { from: 'self_start',         to: 'inspection_begins' },
  { from: 'external_ticket_source', to: 'admin_assigns', label: 'ticket → assign' },
  { from: 'inspection_begins',  to: 'inspection_mode_selector' },

  // ── Tier 2 → Tier 3 (via mode selector) ──
  { from: 'inspection_mode_selector', to: 'calls_twilio', label: 'phone mode' },
  { from: 'inspection_mode_selector', to: 'opens_app', label: 'app mode' },

  // ── Tier 3 internal — Phone path ──
  { from: 'calls_twilio',       to: 'realtime_audio' },
  { from: 'realtime_audio',     to: 'sms_photos' },

  // ── Tier 3 internal — App path ──
  { from: 'opens_app',          to: 'voice_camera_gps' },
  { from: 'voice_camera_gps',   to: 'local_sync' },

  // ── Tier 3 internal — Cross-path ──
  { from: 'sms_photos',         to: 'local_sync', dashed: true },

  // ── Tier 3 internal — New nodes ──
  { from: 'voice_camera_gps',   to: 'photo_markup_tagging' },
  { from: 'photo_markup_tagging', to: 'local_sync' },
  { from: 'voice_camera_gps',   to: 'session_metadata_capture' },
  { from: 'calls_twilio',       to: 'session_metadata_capture', dashed: true },

  // ── Tier 3 → Tier 4 (convergence) ──
  { from: 'realtime_audio',     to: 'transcription' },
  { from: 'local_sync',         to: 'transcription' },
  { from: 'sms_photos',         to: 'photo_analysis' },
  { from: 'photo_markup_tagging', to: 'photo_analysis' },
  { from: 'session_metadata_capture', to: 'form_field_values', dashed: true, label: 'metadata' },

  // ── Tier 4 internal — AI pipeline ──
  { from: 'transcription',      to: 'ai_extraction' },
  { from: 'photo_analysis',     to: 'ocr_narration_resolver' },
  { from: 'transcription',      to: 'ocr_narration_resolver' },
  { from: 'ocr_narration_resolver', to: 'ai_extraction' },
  { from: 'ai_extraction',      to: 'photo_analysis', type: 'loop', dashed: true, label: 'multi-pass' },
  { from: 'photo_analysis',     to: 'confidence_scoring' },
  { from: 'confidence_scoring', to: 'quality_validation' },
  { from: 'quality_validation', to: 'form_field_values' },
  { from: 'ai_extraction',      to: 'field_normalization' },
  { from: 'field_normalization', to: 'form_field_values' },
  { from: 'transcription',      to: 'realtime_field_mapping' },
  { from: 'realtime_field_mapping', to: 'form_field_values', dashed: true, label: 'live preview' },

  // ── Tier 4 → Tier 5 ──
  { from: 'form_field_values',  to: 'inspector_submit' },
  { from: 'form_field_values',  to: 'auto_complete_upload' },

  // ── Tier 5 internal ──
  { from: 'inspector_submit',   to: 'inspector_review' },
  { from: 'inspector_submit',   to: 'mobile_infield_review' },
  { from: 'mobile_infield_review', to: 'multi_approval' },
  { from: 'inspector_review',   to: 'multi_approval' },
  { from: 'multi_approval',     to: 'final_signoff' },
  { from: 'auto_complete_upload', to: 'branded_pdf', dashed: true, label: 'skip review' },

  // ── Tier 5 → Tier 6 ──
  { from: 'final_signoff',      to: 'branded_pdf' },
  { from: 'final_signoff',      to: 'pdf_autofill' },
  { from: 'final_signoff',      to: 'email_ses' },
  { from: 'final_signoff',      to: 'dashboard' },
  { from: 'final_signoff',      to: 'client_portal' },
  { from: 'final_signoff',      to: 'output_template_manager' },
  { from: 'final_signoff',      to: 'external_system_export' },
  { from: 'final_signoff',      to: 'data_flow_configuration', dashed: true },

  // ── Tier 6 internal ──
  { from: 'branded_pdf',        to: 'pdf_autofill', bidirectional: true },
  { from: 'output_template_manager', to: 'branded_pdf' },
  { from: 'data_flow_configuration', to: 'external_system_export' },

  // ── Tier 6 → Tier 7 ──
  { from: 'dashboard',          to: 'predictive_analytics' },
  { from: 'dashboard',          to: 'insights_dashboard' },
  { from: 'dashboard',          to: 'ai_learning_pipeline' },
  { from: 'client_portal',      to: 'feedback_loop' },

  // ── Tier 7 internal ──
  { from: 'predictive_analytics', to: 'insights_dashboard' },
  { from: 'feedback_loop',      to: 'ai_learning_pipeline' },
  { from: 'ai_learning_pipeline', to: 'predictive_analytics', dashed: true, label: 'improved models' },

  // ── Backward / loop edges (drawn manually) ──
  { from: 'feedback_loop',      to: 'admin_assigns', type: 'loop', dashed: true, label: 'feedback loop' },
  { from: 'push_notification_service', to: 'admin_assigns', type: 'loop', dashed: true, label: 'push alerts' },
];


// ── Data Field Connections (26 total — toggled overlay) ──
const dataConnections = [
  // Original 14
  { from: 'create_org',         to: 'form_builder',       label: 'Organization.id → Form.orgId' },
  { from: 'create_org',         to: 'invite_team',        label: 'Org.id → Membership.orgId' },
  { from: 'create_org',         to: 'setup_properties',   label: 'Org.id → Property.orgId' },
  { from: 'admin_signup',       to: 'invite_team',        label: 'User.id → Membership.userId' },
  { from: 'form_builder',       to: 'form_field_values',  label: 'FormField.id → FFV.formFieldId' },
  { from: 'inspection_begins',  to: 'form_field_values',  label: 'CallSession.id → FFV.sessionId' },
  { from: 'create_org',         to: 'inspection_begins',  label: 'Org.id → CallSession.orgId' },
  { from: 'form_builder',       to: 'inspection_begins',  label: 'Form.id → CallSession.formId' },
  { from: 'admin_assigns',      to: 'inspection_begins',  label: 'Assignment.id → CS.assignmentId' },
  { from: 'setup_properties',   to: 'admin_assigns',      label: 'Property.id → Assignment.propId' },
  { from: 'inspection_begins',  to: 'sms_photos',         label: 'CallSession.id → Photo.sessionId' },
  { from: 'form_field_values',  to: 'inspector_review',   label: 'FFV[] → Review display' },
  { from: 'inspection_begins',  to: 'realtime_audio',     label: 'CS → TranscriptChunk.sessionId' },
  { from: 'final_signoff',      to: 'branded_pdf',        label: 'CallSession → PDF generation' },

  // 12 new data connections
  { from: 'vocabulary_aliases', to: 'field_normalization', label: 'Alias[] + VocabPackage → normalize' },
  { from: 'form_markdown_guidance', to: 'ai_extraction',  label: 'FormGuidance.md → extraction context' },
  { from: 'output_configuration', to: 'output_template_manager', label: 'OutputConfig → template selection' },
  { from: 'output_configuration', to: 'external_system_export', label: 'OutputConfig → export target' },
  { from: 'user_preferences',   to: 'opens_app',          label: 'UserPref → default form + mode' },
  { from: 'user_preferences',   to: 'feature_toggles',    label: 'UserPref overrides OrgConfig' },
  { from: 'external_ticket_source', to: 'admin_assigns',  label: 'TicketSource → Assignment.externalId' },
  { from: 'session_metadata_capture', to: 'form_field_values', label: 'SessionMeta → FFV context' },
  { from: 'push_notification_service', to: 'admin_assigns', label: 'PushToken → notify on assign' },
  { from: 'ai_learning_pipeline', to: 'ai_extraction',    label: 'Corrections → improved prompts' },
  { from: 'form_builder',       to: 'field_configuration', label: 'FormField.id → FieldConfig.fieldId' },
  { from: 'license_management', to: 'create_org',         label: 'License.orgId → Org seats' },
];
