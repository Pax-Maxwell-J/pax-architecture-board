# PAX Architecture Board — Node Feedback & Corrections

> Use this document to record verbal feedback, corrections, and detailed notes for each node.
> These notes will be used to update the flowchart copy and details.
>
> **Last updated:** ___________

---

## Table of Contents

- [Tier 0 — Company Setup](#tier-0--company-setup)
- [Tier 1 — User Onboarding](#tier-1--user-onboarding)
- [Tier 2 — Inspection Trigger](#tier-2--inspection-trigger)
- [Tier 3 — Data Capture](#tier-3--data-capture)
- [Tier 4 — AI Processing](#tier-4--ai-processing)
- [Tier 5 — Completion & Review](#tier-5--completion--review)
- [Tier 6 — Delivery & Output](#tier-6--delivery--output)
- [Tier 7 — Intelligence](#tier-7--intelligence)

---

## Tier 0 — Company Setup

*Organization → Forms → Properties*

---

### 1. Admin Signup (`admin_signup`)
**Current description:** Email + password via Cognito. Email verification required.
**Connects to:** Create Organization (flow), Invite Team (data)
**Connects from:** (none — entry point)
**Progress:** 100%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 2. Create Organization (`create_org`)
**Current description:** Provision org, set name/type, auto-create admin membership.
**Connects to:** Subscription & Billing (flow), Form Builder (flow, data), Setup Properties (flow, data), Invite Team (flow, data), License Management (flow), Vocabulary & Aliases (flow), Feature Toggles (flow), Inspection Begins (data)
**Connects from:** Admin Signup (flow), License Management (data)
**Progress:** 100%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 3. Subscription & Billing (`subscription`)
**Current description:** Stripe integration for plan management and usage billing.
**Connects to:** (none)
**Connects from:** Create Organization (flow)
**Progress:** 30%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 4. Form Builder (`form_builder`)
**Current description:** Drag-and-drop inspection form editor. Sections, fields, logic. Supports PDF/web form import via OCR. Per-field configuration for importance weighting, key terms, and validation.
**Connects to:** Form Templates (flow), Form Versioning (flow), Form Ingestion (flow), Field Configuration (flow, data), Form Markdown Guidance (flow), Output Configuration (flow), Admin Assigns (flow), FormFieldValues (data), Inspection Begins (data)
**Connects from:** Create Organization (flow, data), Form Ingestion (flow/loop)
**Progress:** 60%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 5. Form Ingestion (`form_ingestion`)
**Current description:** Import existing PDF/web forms. OCR field detection auto-creates FormFields from uploaded documents.
**Connects to:** Form Builder (flow/loop)
**Connects from:** Form Builder (flow)
**Progress:** 5%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 6. Template Library (`form_templates`)
**Current description:** Pre-built templates for common inspection types. Also ingests external forms as starting points.
**Connects to:** (none)
**Connects from:** Form Builder (flow)
**Progress:** 20%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 7. Form Markdown Guidance (`form_markdown_guidance`)
**Current description:** Markdown docs per form: mapping rules, field expectations, examples. Fed to AI during extraction.
**Connects to:** AI Field Extraction (data)
**Connects from:** Form Builder (flow)
**Progress:** 0%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 8. Form Versioning (`form_versioning`)
**Current description:** Version control for forms. Edits create new versions, don't affect past inspections.
**Connects to:** (none)
**Connects from:** Form Builder (flow)
**Progress:** 40%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 9. Setup Properties (`setup_properties`)
**Current description:** Define properties/sites to inspect. Link to clients.
**Connects to:** Assign Phone Numbers (flow), Integration Settings (flow), Admin Assigns (data)
**Connects from:** Create Organization (flow, data)
**Progress:** 30%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 10. License Management (`license_management`)
**Current description:** Company codes for batch employee onboarding. License tracking and seat management.
**Connects to:** License Code Entry (flow), Create Organization (data)
**Connects from:** Create Organization (flow)
**Progress:** 0%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 11. Assign Phone Numbers (`assign_numbers`)
**Current description:** Provision Twilio number for voice inspections.
**Connects to:** Invite Team (flow)
**Connects from:** Setup Properties (flow)
**Progress:** 40%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 12. Integration Settings (`integration_settings`)
**Current description:** Configure third-party integrations, webhooks, API keys. Visible API endpoints, Salesforce connector, delivery status tracking.
**Connects to:** (none)
**Connects from:** Setup Properties (flow)
**Progress:** 10%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 13. Field Configuration (`field_configuration`)
**Current description:** Per-field: type, format, importance/completeness weight, descriptive text, key terms, validation rules.
**Connects to:** Output Configuration (flow)
**Connects from:** Form Builder (flow, data)
**Progress:** 15%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 14. Output Configuration (`output_configuration`)
**Current description:** Per-form: target format (CSV/JSON/PDF), external system mapping, visual flow editor for field-to-output routing.
**Connects to:** Output Template Manager (data), External System Export (data)
**Connects from:** Field Configuration (flow), Form Builder (flow)
**Progress:** 5%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 15. Vocabulary & Aliases (`vocabulary_aliases`)
**Current description:** Company-wide or form-specific aliases. E.g., "Lifetime North" = "LTN" = "North Project".
**Connects to:** Field Normalization (data)
**Connects from:** Create Organization (flow)
**Progress:** 0%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 16. Feature Toggles (`feature_toggles`)
**Current description:** Per-org defaults for markup, photo captioning, camera vs transcript mode, tagging behavior.
**Connects to:** User Preferences (flow)
**Connects from:** Create Organization (flow), User Preferences (data)
**Progress:** 0%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

## Tier 1 — User Onboarding

*Invite → Claim → Ready*

---

### 17. Invite Team (`invite_team`)
**Current description:** Email invites with magic links. Role-based memberships.
**Connects to:** Inspector Claims Invite (flow), License Code Entry (flow)
**Connects from:** Create Organization (flow, data), Assign Phone Numbers (flow), Admin Signup (data)
**Progress:** 100%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 18. Inspector Claims Invite (`inspector_claims`)
**Current description:** Magic link claim. Auto-join org with Inspector role.
**Connects to:** Gets App & Number (flow)
**Connects from:** Invite Team (flow)
**Progress:** 100%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 19. License Code Entry (`license_code_entry`)
**Current description:** Inspector enters company code to join enterprise org. Alternative to magic link invite.
**Connects to:** Gets App & Number (flow)
**Connects from:** License Management (flow), Invite Team (flow)
**Progress:** 0%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 20. Gets App & Number (`gets_app`)
**Current description:** Phone-first MVP or full app download. Shows default form on first launch. User requests access to additional forms.
**Connects to:** User Preferences (flow), Training Walkthrough (flow)
**Connects from:** Inspector Claims Invite (flow), License Code Entry (flow)
**Progress:** 35%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 21. User Preferences (`user_preferences`)
**Current description:** Default form, capture mode, notification prefs, feature toggles per user.
**Connects to:** Ready to Inspect (flow), Opens App Form (data), Feature Toggles (data)
**Connects from:** Gets App & Number (flow), Feature Toggles (flow)
**Progress:** 0%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 22. Training Walkthrough (`training`)
**Current description:** Guided first-inspection experience. Zero-training target: under 15 min.
**Connects to:** Ready to Inspect (flow)
**Connects from:** Gets App & Number (flow)
**Progress:** 0%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 23. Ready to Inspect (`ready_inspect`)
**Current description:** Inspector has tools, knows process, assigned properties. Admin can push new form access from dashboard.
**Connects to:** Inspector Self-Start (flow)
**Connects from:** User Preferences (flow), Training Walkthrough (flow)
**Progress:** 30%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

## Tier 2 — Inspection Trigger

*Schedule . Assign . Self-Start*

---

### 24. Scheduler / Recurring (`scheduler`)
**Current description:** Automated recurring inspections on schedule.
**Connects to:** Inspection Begins (flow)
**Connects from:** (none)
**Progress:** 0%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 25. Admin Assigns (`admin_assigns`)
**Current description:** Assign inspection to inspector with form + property. Triggers push notification. Supports ticket-based assignment from external systems.
**Connects to:** Inspection Begins (flow, data)
**Connects from:** Form Builder (flow), External Ticket Source (flow, data), Setup Properties (data), Feedback & Re-inspection (flow/loop), Push Notifications (flow/loop, data)
**Progress:** 15%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 26. External Ticket Source (`external_ticket_source`)
**Current description:** Tickets from Jira/ServiceNow/external systems mapped to inspection assignments.
**Connects to:** Admin Assigns (flow, data)
**Connects from:** (none)
**Progress:** 0%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 27. Inspector Self-Start (`self_start`)
**Current description:** Inspector initiates ad-hoc inspection from app.
**Connects to:** Inspection Begins (flow)
**Connects from:** Ready to Inspect (flow)
**Progress:** 10%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 28. Inspection Begins (`inspection_begins`)
**Current description:** Begin inspection. Select mode: site walk (live GPS + photos) or after-the-fact (sitting, upload photos, narrate). System creates CallSession.
**Connects to:** Inspection Mode Selector (flow), FormFieldValues (data), SMS Photos (data), Real-time Audio Stream (data)
**Connects from:** Scheduler / Recurring (flow), Admin Assigns (flow), Inspector Self-Start (flow), Create Organization (data), Form Builder (data), Admin Assigns (data)
**Progress:** 50%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 29. Inspection Mode Selector (`inspection_mode_selector`)
**Current description:** Site walk (live GPS + photos) vs after-the-fact (sitting, upload photos, narrate).
**Connects to:** Calls Twilio Number (flow), Opens App Form (flow)
**Connects from:** Inspection Begins (flow)
**Progress:** 10%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

## Tier 3 — Data Capture

*Phone + App — Two Parallel Paths*

---

### 30. Calls Twilio Number (`calls_twilio`)
**Current description:** Inspector dials org number. Webhook fires. Form selection menu guides which form to fill.
**Connects to:** Real-time Audio Stream (flow), Session Metadata (flow)
**Connects from:** Inspection Mode Selector (flow)
**Progress:** 60%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 31. Real-time Audio Stream (`realtime_audio`)
**Current description:** Twilio Media Streams via WebSocket.
**Connects to:** SMS Photos (flow), Transcription (flow)
**Connects from:** Calls Twilio Number (flow), Inspection Begins (data)
**Progress:** 50%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 32. Opens App Form (`opens_app`)
**Current description:** Expo app loads assignment and form schema. Shows form field list with real-time AI mapping feedback.
**Connects to:** Voice + Camera + GPS (flow)
**Connects from:** Inspection Mode Selector (flow), User Preferences (data)
**Progress:** 40%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 33. Voice + Camera + GPS (`voice_camera_gps`)
**Current description:** On-device capture with STT, annotations, location, weather, device info. Supports photo markup with circles, arrows, text tags.
**Connects to:** Local Storage & Sync (flow), Photo Markup & Tagging (flow), Session Metadata (flow)
**Connects from:** Opens App Form (flow)
**Progress:** 30%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 34. Session Metadata (`session_metadata_capture`)
**Current description:** Auto-captured every session: weather, location, timestamps, pause counts, device info.
**Connects to:** FormFieldValues (flow/data)
**Connects from:** Voice + Camera + GPS (flow), Calls Twilio Number (flow)
**Progress:** 10%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 35. Photo Markup & Tagging (`photo_markup_tagging`)
**Current description:** Circle, arrows, text tags on photos. Caption confirmation toggle.
**Connects to:** Local Storage & Sync (flow), Photo Analysis (flow)
**Connects from:** Voice + Camera + GPS (flow)
**Progress:** 5%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 36. SMS Photos (`sms_photos`)
**Current description:** Text photos to Twilio number during call.
**Connects to:** Local Storage & Sync (flow), Photo Analysis (flow)
**Connects from:** Real-time Audio Stream (flow), Inspection Begins (data)
**Progress:** 15%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 37. Local Storage & Sync (`local_sync`)
**Current description:** Offline-first SQLite + chunked background sync.
**Connects to:** Transcription (flow)
**Connects from:** Voice + Camera + GPS (flow), SMS Photos (flow), Photo Markup & Tagging (flow)
**Progress:** 15%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

## Tier 4 — AI Processing

*Transcription → Extraction → Scoring*

---

### 38. Transcription (`transcription`)
**Current description:** Deepgram (real-time) + Whisper (batch).
**Connects to:** AI Field Extraction (flow), OCR/Narration Resolver (flow), Real-time Field Mapping (flow)
**Connects from:** Real-time Audio Stream (flow), Local Storage & Sync (flow)
**Progress:** 60%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 39. AI Field Extraction (`ai_extraction`)
**Current description:** GPT-4o/Claude maps transcript to form fields. Uses per-form markdown guidance for context. Multi-pass extraction with validation.
**Connects to:** Photo Analysis (flow/loop), Field Normalization (flow)
**Connects from:** Transcription (flow), OCR/Narration Resolver (flow), Form Markdown Guidance (data), AI Learning Pipeline (data)
**Progress:** 50%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 40. Photo Analysis (`photo_analysis`)
**Current description:** GPT-4o vision: defect ID, captions, field linking. OCR text extraction from photos. Priority: narration > OCR when conflict.
**Connects to:** OCR/Narration Resolver (flow), Confidence Scoring (flow)
**Connects from:** SMS Photos (flow), Photo Markup & Tagging (flow), AI Field Extraction (flow/loop)
**Progress:** 15%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 41. OCR/Narration Resolver (`ocr_narration_resolver`)
**Current description:** Compare photo OCR text + transcript narration. Detect conflicts, flag gaps. Prefer narration by default.
**Connects to:** AI Field Extraction (flow)
**Connects from:** Photo Analysis (flow), Transcription (flow)
**Progress:** 0%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 42. Real-time Field Mapping (`realtime_field_mapping`)
**Current description:** Auto-refresh every ~10s or manual trigger. Live preview of AI filling form fields.
**Connects to:** FormFieldValues (flow)
**Connects from:** Transcription (flow)
**Progress:** 15%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 43. Confidence Scoring (`confidence_scoring`)
**Current description:** Multi-pass validation. Score 0-1 per field. Includes normalization confidence from alias resolution.
**Connects to:** Quality Validation (flow)
**Connects from:** Photo Analysis (flow)
**Progress:** 35%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 44. Quality Validation (`quality_validation`)
**Current description:** Cross-field consistency checks and completeness validation.
**Connects to:** FormFieldValues (flow)
**Connects from:** Confidence Scoring (flow)
**Progress:** 20%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 45. FormFieldValues (`form_field_values`)
**Current description:** Persisted structured data in PostgreSQL.
**Connects to:** Inspector Submits (flow), Auto-Complete & Upload (flow), Inspector Review (data)
**Connects from:** Quality Validation (flow), Field Normalization (flow), Real-time Field Mapping (flow), Session Metadata (flow/data), Form Builder (data), Inspection Begins (data)
**Progress:** 50%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 46. Field Normalization (`field_normalization`)
**Current description:** Resolve aliases, apply vocabulary packages, standardize shorthand to canonical terms.
**Connects to:** FormFieldValues (flow)
**Connects from:** AI Field Extraction (flow), Vocabulary & Aliases (data)
**Progress:** 0%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

## Tier 5 — Completion & Review

*Submit → Review → Approve*

---

### 47. Inspector Submits (`inspector_submit`)
**Current description:** Inspector reviews AI-populated report. Slide-to-complete UX for trusted inspectors. Submits for review.
**Connects to:** Inspector Review (flow), Mobile In-Field Review (flow)
**Connects from:** FormFieldValues (flow)
**Progress:** 30%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 48. Inspector Review (`inspector_review`)
**Current description:** Edit AI report. Confidence scores guide review focus. Available on mobile (in-field) and dashboard (office).
**Connects to:** Multi-level Approval (flow)
**Connects from:** Inspector Submits (flow), FormFieldValues (data)
**Progress:** 40%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 49. Mobile In-Field Review (`mobile_infield_review`)
**Current description:** Supervisor reviews/edits/approves from mobile app while in the field.
**Connects to:** Multi-level Approval (flow)
**Connects from:** Inspector Submits (flow)
**Progress:** 5%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 50. Auto-Complete & Upload (`auto_complete_upload`)
**Current description:** Slide to complete -> instant upload. Skip review queue for trusted inspectors.
**Connects to:** Branded PDF Report (flow)
**Connects from:** FormFieldValues (flow)
**Progress:** 10%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 51. Multi-level Approval (`multi_approval`)
**Current description:** Inspector -> Supervisor -> Admin -> Client approval chain.
**Connects to:** Final Sign-off (flow)
**Connects from:** Inspector Review (flow), Mobile In-Field Review (flow)
**Progress:** 10%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 52. Final Sign-off (`final_signoff`)
**Current description:** Last approval triggers delivery pipeline.
**Connects to:** Branded PDF Report (flow, data), PDF Autofill (flow), Email (SES) (flow), Dashboard (flow), Client Portal / API (flow), Output Template Manager (flow), External System Export (flow), Data Flow Configuration (flow)
**Connects from:** Multi-level Approval (flow)
**Progress:** 10%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

## Tier 6 — Delivery & Output

*Reports . Email . Portal*

---

### 53. Branded PDF Report (`branded_pdf`)
**Current description:** PDF from FFV[] + Photo[] + Org branding. Standard PAX template or custom per-org with brand upload.
**Connects to:** PDF Autofill (flow, bidirectional)
**Connects from:** Final Sign-off (flow, data), Auto-Complete & Upload (flow), PDF Autofill (flow, bidirectional), Output Template Manager (flow)
**Progress:** 15%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 54. PDF Autofill (`pdf_autofill`)
**Current description:** AI maps FFV -> existing PDF form fields.
**Connects to:** Branded PDF Report (flow, bidirectional)
**Connects from:** Final Sign-off (flow), Branded PDF Report (flow, bidirectional)
**Progress:** 10%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 55. Output Template Manager (`output_template_manager`)
**Current description:** Standard PAX PDF template + custom per-org. Brand upload, field placement, layout editor.
**Connects to:** Branded PDF Report (flow)
**Connects from:** Final Sign-off (flow), Output Configuration (data)
**Progress:** 0%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 56. External System Export (`external_system_export`)
**Current description:** JSON/CSV/webhook to Salesforce, ServiceNow, etc. Visible API endpoints, delivery status.
**Connects to:** (none)
**Connects from:** Final Sign-off (flow), Data Flow Configuration (flow), Output Configuration (data)
**Progress:** 0%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 57. Data Flow Configuration (`data_flow_configuration`)
**Current description:** Visual drag-and-drop: form fields -> output targets. Self-serve mapping for admins.
**Connects to:** External System Export (flow)
**Connects from:** Final Sign-off (flow)
**Progress:** 0%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 58. Email (SES) (`email_ses`)
**Current description:** Branded template + PDF attachment.
**Connects to:** (none)
**Connects from:** Final Sign-off (flow)
**Progress:** 15%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 59. Dashboard (`dashboard`)
**Current description:** Real-time inspection visibility + management. Report browser, assignment tracker, integration status, AI learning feedback.
**Connects to:** Predictive Analytics (flow), Insights Dashboard (flow), AI Learning Pipeline (flow)
**Connects from:** Final Sign-off (flow)
**Progress:** 100%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 60. Client Portal / API (`client_portal`)
**Current description:** White-labeled portal + webhook/API for integrations. Webhook delivery status tracking visible to admin.
**Connects to:** Feedback & Re-inspection (flow)
**Connects from:** Final Sign-off (flow)
**Progress:** 0%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

## Tier 7 — Intelligence

*Analytics & Feedback*

---

### 61. Predictive Analytics (`predictive_analytics`)
**Current description:** AI insights from historical inspection data.
**Connects to:** Insights Dashboard (flow)
**Connects from:** Dashboard (flow), AI Learning Pipeline (flow)
**Progress:** 0%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 62. Insights Dashboard (`insights_dashboard`)
**Current description:** Trends, risk scoring, maintenance predictions.
**Connects to:** (none)
**Connects from:** Dashboard (flow), Predictive Analytics (flow)
**Progress:** 0%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 63. AI Learning Pipeline (`ai_learning_pipeline`)
**Current description:** Captures inspector corrections -> retrains extraction/captioning models. Per-org learning.
**Connects to:** Predictive Analytics (flow), AI Field Extraction (data)
**Connects from:** Dashboard (flow), Feedback & Re-inspection (flow)
**Progress:** 0%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 64. Push Notifications (`push_notification_service`)
**Current description:** Assignment alerts, review requests, completion confirmations.
**Connects to:** Admin Assigns (flow/loop, data)
**Connects from:** (none)
**Progress:** 5%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

### 65. Feedback & Re-inspection (`feedback_loop`)
**Current description:** Client comments, re-inspection requests. Captures corrections for AI retraining. Continuous improvement loop.
**Connects to:** AI Learning Pipeline (flow), Admin Assigns (flow/loop)
**Connects from:** Client Portal / API (flow)
**Progress:** 0%

#### Feedback & Corrections
-

#### Detailed Notes
<!-- Record verbal feedback, exact wording preferences, corrections to description, missing details, etc. -->

---

*End of document — 65 nodes across 8 tiers.*

---

# Verbal Feedback Session — 2026-02-21

> Transcribed from user walkthrough of all architecture nodes. Corrections, clarifications, and confirmations captured below.

---

## Nodes with Corrections or Clarifications

### Subscription & Billing (`subscription`)
- **Correction:** NOT usage billing anymore. Remove "usage billing" from description.
- **Subscription tiers:**
  - **Base:** $350/month — 400 standard form outputs, 20 users
  - **Pro:** $650/month — 1,000 reports/month, 50 users
  - **Enterprise:** Custom — custom outputs, OR >50 users, OR >1,000 reports, OR long-form reports
- **Action:** Update description to reflect fixed subscription tiers, not usage-based billing.

### Form Builder (`form_builder`)
- **Clarification:** Form Ingestion is PART OF the Form Builder — same system. The drag-and-drop editor also handles ingestion. These are not separate nodes; they are one unified system.
- **Action:** Merge Form Ingestion into Form Builder if they are currently shown as separate concepts.

### Template Library (`form_templates`)
- **Clarification:** Templates are based off forms created for other companies, but made generic (company-specific details removed). They serve as starting points.

### Form Markdown Guidance (`form_markdown_guidance`)
- **Clarification:** This is an AI-enabled process. It ensures that fields understand their context, meaning, and expected output type. Not just static markdown — it is AI-driven contextual guidance.

### Form Versioning (`form_versioning`)
- **Clarification:** Important because database adjustments happen when a form changes. Need to track WHEN changes occurred so the system knows which schema version applies to which data.

### Setup Properties (`setup_properties`)
- **Clarification:** This is where CRM details go. Described as a "baby back-end CRM." Users can add clients, properties, etc. from this node.
- **Action:** Update description to emphasize CRM functionality (client/property management).

### License Management (`license_management`)
- **Clarification:** Based on whatever subscription tier the org chooses. Licenses give access to both the app AND the phone call system / phone number.
- **Action:** Ensure description mentions that licenses cover app access + phone/Twilio number access.

### Feature Toggles (`feature_toggles`)
- **Clarification:** Permissions are set in the dashboard and editable from within the app.
- Certain features are NOT available to Base-tier clients.
- Pro tier gets more features than Base.
- Enterprise tier gets everything.
- Unavailable features show as grayed out with an "upgrade to use" prompt (not hidden — visible but locked).
- **Action:** Update to reflect tier-based feature gating with grayed-out upgrade prompts.

### Training Walkthrough (`training`)
- **Correction:** Should be less than 5 MINUTES, not 15 minutes. Nearly immediate — the system should be very easy to learn.
- **Action:** Update time estimate from 15 min to <5 min.

### Quality Validation (`quality_validation`)
- **Major addition:** Needs a self-improving system. After every session, the system should analyze how well the session went and how much correction was needed.
- Self-learning and improving system, organized by form type.
- Not just markdown guidance — this is an ongoing improvement loop that gets better over time.
- **Action:** Add self-improving/self-learning loop to this node's description. This is a feedback-driven AI improvement system, not just a one-time validation step.

### Dashboard (`dashboard`)
- **Clarification:** This is where users see reports, manage CRM details, and manage where forms are going (form routing/assignment).
- **Action:** Ensure description covers all three functions: reports, CRM management, form routing.

### Feedback & Re-inspection (`feedback_loop`)
- **Note:** Still needs to be figured out. Details TBD.
- **Action:** Mark as "needs design" — do not finalize this node's spec yet.

---

## Nodes Confirmed as Correct

The following nodes were reviewed and confirmed as looking correct with no changes needed:

- `admin_signup` — Admin Signup
- `create_org` — Create Organization
- `form_builder` — Form Builder (with ingestion merged in, see above)
- `form_templates` — Template Library
- `form_markdown_guidance` — Form Markdown Guidance
- `form_versioning` — Form Versioning
- `setup_properties` — Setup Properties
- `license_management` — License Management
- `assign_numbers` — Assign Numbers
- `integration_settings` — Integration Settings
- `field_configuration` — Field Configuration
- `output_configuration` — Output Configuration
- `vocabulary_aliases` — Vocabulary & Aliases
- `invite_team` — Invite Team
- `inspector_claims` — Inspector Claims
- `license_code_entry` — License Code Entry
- `gets_app` — Gets App
- `user_preferences` — User Preferences
- `ready_inspect` — Ready to Inspect
- `scheduler` — Scheduler
- `admin_assigns` — Admin Assigns
- `external_ticket_source` — External Ticket Source
- `self_start` — Self Start
- `inspection_begins` — Inspection Begins
- `inspection_mode_selector` — Inspection Mode Selector
- `calls_twilio` — Calls Twilio
- `realtime_audio` — Realtime Audio
- `opens_app` — Opens App
- `voice_camera_gps` — Voice / Camera / GPS
- `session_metadata_capture` — Session Metadata Capture
- `photo_markup_tagging` — Photo Markup & Tagging
- `sms_photos` — SMS Photos
- `local_sync` — Local Sync
- `transcription` — Transcription
- `ai_extraction` — AI Extraction
- `photo_analysis` — Photo Analysis
- `ocr_narration_resolver` — OCR / Narration Resolver
- `realtime_field_mapping` — Realtime Field Mapping
- `confidence_scoring` — Confidence Scoring
- `field_normalization` — Field Normalization
- `inspector_submit` — Inspector Submit
- `inspector_review` — Inspector Review
- `mobile_infield_review` — Mobile In-Field Review
- `auto_complete_upload` — Auto-Complete Upload
- `multi_approval` — Multi-Approval
- `final_signoff` — Final Sign-Off
- `branded_pdf` — Branded PDF
- `pdf_autofill` — PDF Autofill
- `output_template_manager` — Output Template Manager
- `external_system_export` — External System Export
- `data_flow_configuration` — Data Flow Configuration
- `email_ses` — Email (SES)
- `client_portal` — Client Portal
- `predictive_analytics` — Predictive Analytics
- `insights_dashboard` — Insights Dashboard
- `ai_learning_pipeline` — AI Learning Pipeline
- `push_notification_service` — Push Notifications

---

*End of verbal feedback session — 2026-02-21*
