# PAX — Technical Specification

> **Version:** 1.0
> **Date:** 2026-02-21
> **Status:** Living document — updated as features ship

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Tech Stack](#2-tech-stack)
3. [Database Schema](#3-database-schema)
4. [Feature Specifications](#4-feature-specifications)
   - [4.0 Tier 0 — Company Setup](#40-tier-0--company-setup)
   - [4.1 Tier 1 — User Onboarding](#41-tier-1--user-onboarding)
   - [4.2 Tier 2 — Inspection Trigger](#42-tier-2--inspection-trigger)
   - [4.3 Tier 3 — Data Capture](#43-tier-3--data-capture)
   - [4.4 Tier 4 — AI Processing](#44-tier-4--ai-processing)
   - [4.5 Tier 5 — Completion & Review](#45-tier-5--completion--review)
   - [4.6 Tier 6 — Delivery & Output](#46-tier-6--delivery--output)
   - [4.7 Tier 7 — Intelligence](#47-tier-7--intelligence)
5. [Infrastructure](#5-infrastructure)
6. [Subscription & Pricing](#6-subscription--pricing)
7. [Implementation Roadmap](#7-implementation-roadmap)
8. [Vertical Configurations](#8-vertical-configurations)

---

## 1. System Overview

PAX is an AI-powered inspection platform that transforms how field inspections are captured, processed, and delivered. Inspectors collect data through two parallel paths — a phone call to a Twilio number or a mobile app — and the system uses GPT-4o, Claude, Deepgram, and Whisper to transcribe speech, extract structured data, analyze photos, and populate inspection forms automatically. The result is a complete, branded inspection report generated in minutes instead of hours.

### Architecture: 8 Tiers

The system is organized into eight tiers that represent the lifecycle of an inspection:

| Tier | Label | Subtitle |
|------|-------|----------|
| 0 | Company Setup | Organization → Forms → Properties |
| 1 | User Onboarding | Invite → Claim → Ready |
| 2 | Inspection Trigger | Schedule · Assign · Self-Start |
| 3 | Data Capture | Phone + App — Two Parallel Paths |
| 4 | AI Processing | Transcription → Extraction → Scoring |
| 5 | Completion & Review | Submit → Review → Approve |
| 6 | Delivery & Output | Reports · Email · Portal |
| 7 | Intelligence | Analytics & Feedback |

### Key Design Principles

- **Multi-tenant by default.** Every entity is scoped by `orgId`. The `Organization` is the top-level tenant boundary — all data (forms, properties, inspections, users) lives under an org.
- **Offline-first mobile.** The Expo app stores all captured data in local SQLite and syncs when connectivity returns. Inspectors can complete full inspections without network access.
- **AI-augmented, not AI-replaced.** AI pre-fills forms and generates captions, but humans always have final authority. Confidence scores guide review — high-confidence values auto-accept, low-confidence values require manual entry.
- **Role-based access with clear boundaries.** Four roles — Admin, Manager, Inspector, Viewer. Admins and Managers access the web dashboard. Inspectors work exclusively through the mobile app. This is a hard boundary, not a preference.

### Inspector Mobile App Capabilities

Inspectors do not have dashboard access. All inspector workflows happen in the mobile app:

- View and start assigned inspections
- Select and fill forms
- Capture voice, photos, GPS data
- Review AI-populated reports with confidence indicators
- Edit and correct field values
- Browse previous inspection reports
- Manage captured media (photos, recordings)
- Configure personal preferences (default form, capture mode, notifications)
- Manage personal workflow (queue, assignments, history)

---

## 2. Tech Stack

### Frontend

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Mobile App | Expo (React Native) | Inspector-facing: inspections, capture, review, preferences |
| Admin Dashboard | Next.js | Admin/Manager-facing: reports, CRM, form routing |
| Forms UI | Drag-and-drop builder | Form creation and field configuration |

### Backend

| Layer | Technology | Purpose |
|-------|-----------|---------|
| API | Hono (TypeScript) | REST + WebSocket API framework |
| Hosting | AWS App Runner | Container-based API hosting |
| ORM | Prisma | Database access and migrations |
| Database | PostgreSQL | Primary data store |
| Auth | AWS Cognito | JWT-based authentication, email verification, MFA |

### Storage & Queues

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Object Storage | AWS S3 | Photos, audio recordings, PDFs |
| Job Queues | AWS SQS | Async job dispatch (PDF generation, email, exports) |
| Workers | AWS Lambda | Async job processing |
| Container Registry | AWS ECR | Docker image storage for App Runner |
| Secrets | AWS Secrets Manager | API keys, credentials |

### AI & ML

| Service | Use Case | Cost |
|---------|----------|------|
| Deepgram | Real-time speech-to-text streaming | $0.0043/min |
| Whisper API | Batch transcription (highest accuracy) | $0.006/min |
| GPT-4o | Field extraction, photo analysis (vision), OCR | Per-token |
| Claude | Field extraction fallback, complex reasoning | Per-token |
| Native STT | On-device speech-to-text (iOS/Android) | Free |

### External Services

| Service | Purpose |
|---------|---------|
| Twilio | Voice calls, SMS/MMS photo intake, phone number provisioning |
| Stripe | Subscription billing, Customer Portal |
| AWS SES | Transactional email delivery |
| Google Places API | Address autocomplete, GPS coordinates |

---

## 3. Database Schema

All models use UUID primary keys. Timestamps (`createdAt`, `updatedAt`) are implicit on every model. Relationships are expressed as foreign keys with Prisma-style notation.

### Enums

```prisma
enum MembershipRole {
  ADMIN
  MANAGER
  INSPECTOR
  VIEWER
}

enum MembershipStatus {
  PENDING
  ACTIVE
  SUSPENDED
  REVOKED
}

enum PersonType {
  CLIENT
  CONTACT
}

enum SubscriptionPlan {
  BASE
  PRO
  ENTERPRISE
}

enum SubscriptionStatus {
  TRIALING
  ACTIVE
  PAST_DUE
  CANCELLED
}

enum FormFieldType {
  TEXT
  NUMBER
  SELECT
  PHOTO
  SIGNATURE
  DATE
  GPS
}

enum InspectionMode {
  SITE_WALK
  AFTER_FACT
}

enum CallSessionStatus {
  DRAFT
  IN_PROGRESS
  AI_PROCESSING
  REVIEW
  APPROVED
  DELIVERED
}

enum AssignmentStatus {
  PENDING
  IN_PROGRESS
  SUBMITTED
  REVIEW
  APPROVED
  CANCELLED
}

enum FieldValueSource {
  AI_EXTRACTED
  MANUAL_ENTRY
  EDITED
  PHOTO_DETECTED
  NORMALIZED
}

enum OutputFormat {
  PDF
  CSV
  JSON
  WEBHOOK
}

enum ExportJobStatus {
  PENDING
  PROCESSING
  DELIVERED
  FAILED
  RETRYING
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}

enum NotificationEventType {
  ASSIGNMENT_CREATED
  REVIEW_REQUESTED
  APPROVAL_STATUS
  COMPLETION_CONFIRMED
}

enum GeoFieldMode {
  POINT
  POLYGON
  TRACK
}

enum GeoExportFormat {
  GEOJSON
  SHAPEFILE
  KML
  GPX
}

enum NarrativeStatus {
  PENDING
  GENERATING
  COMPLETE
  FAILED
}
```

### Org & Auth

```prisma
model User {
  id         String   @id @default(uuid())
  email      String   @unique
  name       String
  phone      String?
  cognitoSub String   @unique

  memberships    Membership[]
  preferences    UserPreference?
  pushTokens     PushToken[]
  assignments    Assignment[]
  callSessions   CallSession[]
  approvals      Approval[]
  comments       Comment[]

  @@index([email])
  @@index([cognitoSub])
}

model Organization {
  id                 String   @id @default(uuid())
  name               String
  slug               String   @unique
  settings           Json     @default("{}")
  plan               SubscriptionPlan @default(BASE)
  stripeCustomerId   String?  @unique
  twilioPhoneNumber  String?

  memberships        Membership[]
  subscription       Subscription?
  licenses           License[]
  forms              Form[]
  properties         Property[]
  persons            Person[]
  assignments        Assignment[]
  callSessions       CallSession[]
  aliases            Alias[]
  vocabularyPackages VocabularyPackage[]
  integrations       Integration[]
  featureConfig      OrgFeatureConfig?
  schedules          Schedule[]

  @@index([slug])
}

model Membership {
  id       String           @id @default(uuid())
  userId   String
  orgId    String
  role     MembershipRole
  status   MembershipStatus @default(PENDING)
  joinedAt DateTime?

  user User         @relation(fields: [userId], references: [id])
  org  Organization @relation(fields: [orgId], references: [id])

  @@unique([userId, orgId])
  @@index([orgId])
}

model Subscription {
  id            String             @id @default(uuid())
  stripeId      String             @unique
  orgId         String             @unique
  plan          SubscriptionPlan
  status        SubscriptionStatus
  currentPeriod Json

  org Organization @relation(fields: [orgId], references: [id])
}

model License {
  id        String    @id @default(uuid())
  orgId     String
  code      String    @unique
  maxSeats  Int
  usedSeats Int       @default(0)
  expiresAt DateTime?

  org Organization @relation(fields: [orgId], references: [id])

  @@index([code])
  @@index([orgId])
}

model Person {
  id    String     @id @default(uuid())
  orgId String
  name  String
  email String?
  type  PersonType

  org        Organization @relation(fields: [orgId], references: [id])
  properties Property[]

  @@index([orgId])
}

model Invite {
  id        String   @id @default(uuid())
  email     String
  orgId     String
  role      MembershipRole
  token     String   @unique
  expiresAt DateTime

  @@index([token])
  @@index([orgId])
}

model UserPreference {
  id                String @id @default(uuid())
  userId            String @unique
  defaultFormId     String?
  captureMode       String?
  notificationPrefs Json   @default("{}")
  featureOverrides  Json   @default("{}")

  user User @relation(fields: [userId], references: [id])
}

model OrgFeatureConfig {
  id                 String           @id @default(uuid())
  orgId              String           @unique
  markupEnabled      Boolean          @default(true)
  captioningMode     String           @default("auto")
  defaultCaptureMode String           @default("voice")
  subscriptionTier   SubscriptionPlan @default(BASE)

  org Organization @relation(fields: [orgId], references: [id])
}

model VerticalConfig {
  id              String @id @default(uuid())
  orgId           String @unique
  verticalType    String                  // "pest_control", "telecom", "environmental", etc.
  complianceReqs  Json?                   // vertical-specific compliance requirements
  outputTemplates Json?                   // vertical-specific output format IDs
  fieldPresets    Json?                   // default field configs for this vertical

  org Organization @relation(fields: [orgId], references: [id])
}
```

### Forms & Configuration

```prisma
model Form {
  id          String    @id @default(uuid())
  orgId       String
  name        String
  version     Int       @default(1)
  schema      Json
  isTemplate  Boolean   @default(false)
  publishedAt DateTime?

  org          Organization  @relation(fields: [orgId], references: [id])
  fields       FormField[]
  versions     FormVersion[]
  guidance     FormGuidance?
  outputConfig OutputConfig?
  aliases      Alias[]
  schedules    Schedule[]

  @@index([orgId])
  @@index([orgId, name])
}

model FormField {
  id        String        @id @default(uuid())
  formId    String
  sectionId String?
  label     String
  type      FormFieldType
  options   Json?               // When type = GPS, includes geoMode: GeoFieldMode
  order     Int                 //   POINT: single lat/lng capture
  required  Boolean       @default(false)  //   POLYGON: draw/walk a boundary
                                //   TRACK: record continuous path

  form        Form             @relation(fields: [formId], references: [id])
  config      FieldConfig?
  fieldValues FormFieldValue[]

  @@index([formId])
  @@index([formId, order])
}

model FieldConfig {
  id              String @id @default(uuid())
  fieldId         String @unique
  importance      Float  @default(1.0)
  keyTerms        Json   @default("[]")
  validationRules Json   @default("{}")
  descriptiveText String?

  field FormField @relation(fields: [fieldId], references: [id])
}

model FormTemplate {
  id       String @id @default(uuid())
  name     String
  category String
  schema   Json

  @@index([category])
}

model FormVersion {
  id          String   @id @default(uuid())
  formId      String
  version     Int
  snapshot    Json
  publishedAt DateTime

  form Form @relation(fields: [formId], references: [id])

  @@unique([formId, version])
  @@index([formId])
}

model FormGuidance {
  id                String @id @default(uuid())
  formId            String @unique
  markdownContent   String @db.Text
  examples          Json   @default("[]")
  fieldMappingHints Json   @default("{}")

  form Form @relation(fields: [formId], references: [id])
}

model OutputConfig {
  id           String       @id @default(uuid())
  formId       String       @unique
  format       OutputFormat
  template     String?
  targetSystem String?
  fieldMapping Json         @default("[]")

  form Form @relation(fields: [formId], references: [id])
}

model Alias {
  id        String  @id @default(uuid())
  orgId     String
  formId    String?
  canonical String
  variants  Json

  org  Organization @relation(fields: [orgId], references: [id])
  form Form?        @relation(fields: [formId], references: [id])

  @@index([orgId])
  @@index([canonical])
}

model VocabularyPackage {
  id       String @id @default(uuid())
  orgId    String
  industry String
  terms    Json

  org Organization @relation(fields: [orgId], references: [id])

  @@index([orgId])
}
```

### Inspection Entities

```prisma
model Assignment {
  id               String           @id @default(uuid())
  orgId            String
  userId           String
  formId           String
  propertyId       String?
  deadline         DateTime?
  notes            String?          @db.Text
  status           AssignmentStatus @default(PENDING)
  self             Boolean          @default(false)
  externalTicketId String?

  org      Organization @relation(fields: [orgId], references: [id])
  user     User         @relation(fields: [userId], references: [id])
  sessions CallSession[]

  @@index([orgId])
  @@index([userId])
  @@index([orgId, status])
}

model Property {
  id             String @id @default(uuid())
  orgId          String
  address        String
  gps            Json
  clientPersonId String?

  org    Organization @relation(fields: [orgId], references: [id])
  client Person?      @relation(fields: [clientPersonId], references: [id])

  riskScores RiskScore[]

  @@index([orgId])
  @@index([clientPersonId])
}

model CallSession {
  id            String            @id @default(uuid())
  orgId         String
  userId        String
  formId        String
  assignmentId  String?
  mode          InspectionMode
  status        CallSessionStatus @default(DRAFT)
  twilioCallSid String?
  startedAt     DateTime          @default(now())
  completedAt   DateTime?

  org         Organization     @relation(fields: [orgId], references: [id])
  user        User             @relation(fields: [userId], references: [id])
  assignment  Assignment?      @relation(fields: [assignmentId], references: [id])
  photos      Photo[]
  recordings  AudioRecording[]
  transcript  Transcript?
  fieldValues FormFieldValue[]
  corrections InspectorCorrection[]
  sessionMeta SessionMeta?
  approvals   Approval[]
  comments    Comment[]
  pdf         PDF?
  exportJobs  ExportJob[]

  @@index([orgId])
  @@index([userId])
  @@index([orgId, status])
  @@index([twilioCallSid])
}

model Photo {
  id            String    @id @default(uuid())
  callSessionId String
  s3Key         String
  mimeType      String
  gpsLat        Float?
  gpsLng        Float?
  altitude      Float?
  accuracy      Float?              // GPS accuracy in meters
  heading       Float?              // compass direction camera faced (0-360)
  speed         Float?              // inspector speed at capture (m/s)
  caption       String?
  capturedAt    DateTime?           // exact capture timestamp
  trackPointIdx Int?                // index into SessionMeta.gpsTrack for nearest point

  session     CallSession     @relation(fields: [callSessionId], references: [id])
  annotations PhotoAnnotation[]

  @@index([callSessionId])
}

model PhotoAnnotation {
  id          String @id @default(uuid())
  photoId     String
  type        String
  coordinates Json
  text        String?
  color       String?

  photo Photo @relation(fields: [photoId], references: [id])

  @@index([photoId])
}

model AudioRecording {
  id            String @id @default(uuid())
  callSessionId String
  localUri      String?
  duration      Int
  s3Key         String?

  session CallSession @relation(fields: [callSessionId], references: [id])

  @@index([callSessionId])
}

model SessionMeta {
  id              String    @id @default(uuid())
  sessionId       String    @unique
  weather         Json?
  deviceInfo      Json?
  pauseCount      Int       @default(0)
  gpsTrack        Json      @default("[]")  // Array of { lat, lng, altitude?, accuracy, heading, speed, timestamp }
  totalDistance    Float?                    // meters walked/driven
  coveragePercent Float?                    // % of property boundary covered (if boundary defined)
  durationSeconds Int?                      // total active session time
  averageSpeed    Float?                    // m/s
  startedAt       DateTime
  completedAt     DateTime?

  session         CallSession      @relation(fields: [sessionId], references: [id])
  weatherSnapshot WeatherSnapshot?
}

model WeatherSnapshot {
  id            String   @id @default(uuid())
  sessionMetaId String   @unique
  temperature   Float
  conditions    String
  humidity      Float?
  windSpeed     Float?
  windDirection String?
  pressure      Float?
  visibility    Float?
  source        String   @default("openweathermap")
  capturedAt    DateTime

  sessionMeta SessionMeta @relation(fields: [sessionMetaId], references: [id])
}

model PropertyBoundary {
  id         String @id @default(uuid())
  propertyId String @unique
  polygon    Json                    // GeoJSON Polygon coordinates
  areaMeters Float?
  source     String                  // "manual_draw", "parcel_api", "gps_trace"

  property Property @relation(fields: [propertyId], references: [id])
}

model Schedule {
  id        String   @id @default(uuid())
  formId    String
  orgId     String
  frequency String
  nextRun   DateTime

  form Form         @relation(fields: [formId], references: [id])
  org  Organization @relation(fields: [orgId], references: [id])

  @@index([orgId])
  @@index([nextRun])
}

model TicketSource {
  id           String @id @default(uuid())
  provider     String
  externalId   String
  mappedFormId String

  @@index([provider, externalId])
}
```

### AI Processing

```prisma
model Transcript {
  id        String @id @default(uuid())
  sessionId String @unique
  text      String @db.Text
  segments  Json   @default("[]")
  speakers  Json   @default("[]")

  session CallSession @relation(fields: [sessionId], references: [id])
}

model FormFieldValue {
  id            String           @id @default(uuid())
  callSessionId String
  formFieldId   String
  value         Json
  confidence    Float
  source        FieldValueSource
  editedAt      DateTime?

  session CallSession @relation(fields: [callSessionId], references: [id])
  field   FormField   @relation(fields: [formFieldId], references: [id])

  @@index([callSessionId])
  @@index([formFieldId])
  @@index([callSessionId, formFieldId])
}

model InspectorCorrection {
  id             String @id @default(uuid())
  sessionId      String
  fieldId        String
  aiValue        Json
  correctedValue Json

  session CallSession @relation(fields: [sessionId], references: [id])

  @@index([sessionId])
  @@index([fieldId])
}

model SessionNarrative {
  id               String          @id @default(uuid())
  callSessionId    String          @unique
  fullNarrative    String          @db.Text    // cleaned-up prose, organized by section
  sectionBreakdown Json                        // { sectionId: narrativeChunk }
  wordCount        Int
  status           NarrativeStatus @default(PENDING)
  generatedAt      DateTime?

  session CallSession @relation(fields: [callSessionId], references: [id])
}

model UnmappedNote {
  id            String   @id @default(uuid())
  callSessionId String
  content       String   @db.Text
  source        String                  // "transcript_overflow", "inspector_note", "ai_detected"
  timestamp     DateTime?               // when in session this was captured
  transcriptRef String?                 // pointer to transcript segment

  session CallSession @relation(fields: [callSessionId], references: [id])

  @@index([callSessionId])
}
```

### Delivery

```prisma
model PDF {
  id        String @id @default(uuid())
  sessionId String @unique
  template  String
  orgLogo   String?
  s3Key     String

  session CallSession @relation(fields: [sessionId], references: [id])
}

model OutputTemplate {
  id              String @id @default(uuid())
  orgId           String
  layout          Json
  brandAssets     Json   @default("{}")
  fieldPlacements Json   @default("[]")

  @@index([orgId])
}

model ExportJob {
  id           String          @id @default(uuid())
  sessionId    String
  targetSystem String
  format       OutputFormat
  status       ExportJobStatus @default(PENDING)
  deliveredAt  DateTime?

  session CallSession @relation(fields: [sessionId], references: [id])

  @@index([sessionId])
  @@index([status])
}

model GeoExportJob {
  id            String          @id @default(uuid())
  callSessionId String?                     // single session or null for batch
  orgId         String
  format        GeoExportFormat
  includePhotos Boolean         @default(true)
  includeTrack  Boolean         @default(true)
  s3Key         String?
  status        ExportJobStatus @default(PENDING)
  createdAt     DateTime        @default(now())

  session CallSession? @relation(fields: [callSessionId], references: [id])
  org     Organization @relation(fields: [orgId], references: [id])

  @@index([orgId])
}

model DataFlowMap {
  id             String @id @default(uuid())
  formId         String
  fieldId        String
  outputTarget   String
  transformation Json   @default("{}")

  @@index([formId])
}

model Integration {
  id       String @id @default(uuid())
  orgId    String
  provider String
  config   Json
  status   String @default("inactive")

  org Organization @relation(fields: [orgId], references: [id])

  @@index([orgId])
}

model WebhookEndpoint {
  id     String @id @default(uuid())
  orgId  String
  url    String
  events Json   @default("[]")
  secret String

  @@index([orgId])
}
```

### Intelligence

```prisma
model RiskScore {
  id           String   @id @default(uuid())
  propertyId   String
  score        Float
  factors      Json
  calculatedAt DateTime @default(now())

  property Property @relation(fields: [propertyId], references: [id])

  @@index([propertyId])
}

model Comment {
  id            String   @id @default(uuid())
  callSessionId String
  userId        String
  text          String   @db.Text
  createdAt     DateTime @default(now())

  session CallSession @relation(fields: [callSessionId], references: [id])
  user    User        @relation(fields: [userId], references: [id])

  @@index([callSessionId])
}

model Approval {
  id            String         @id @default(uuid())
  callSessionId String
  level         Int
  approverId    String
  status        ApprovalStatus @default(PENDING)
  comments      String?        @db.Text

  session  CallSession @relation(fields: [callSessionId], references: [id])
  approver User        @relation(fields: [approverId], references: [id])

  @@index([callSessionId])
  @@index([callSessionId, level])
}
```

### Notifications

```prisma
model PushToken {
  id          String @id @default(uuid())
  userId      String
  deviceToken String
  platform    String

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
}

model NotificationEvent {
  id          String                @id @default(uuid())
  type        NotificationEventType
  recipientId String
  payload     Json
  sentAt      DateTime              @default(now())
  readAt      DateTime?

  @@index([recipientId])
  @@index([type])
}
```

---

## 4. Feature Specifications

### 4.0 Tier 0 — Company Setup

> **Organization → Forms → Properties**
>
> Everything an admin does before the first inspection: create the org, configure billing, build forms, define properties, set up integrations. Property boundaries and vertical configuration extend the setup pipeline. This tier has 18 features.

---

#### 4.0.1 Admin Signup

**Status:** 100% — Shipped

**Description**

Email + password signup via AWS Cognito. Email verification required before the admin can proceed to org creation.

**How It Works**

Admin signs up via the web dashboard with email and password. Cognito handles authentication with email verification, password reset, and optional MFA. Upon successful verification, a JWT is issued and stored in the browser.

**User Experience**

- Admin visits the signup page, enters email and password
- Verification email sent — admin must click the link
- After verification, redirected to org creation flow

**Data Flow**

```
Browser → Cognito signup → email verification → JWT issued → stored in browser
```

Entities touched: `User { id, email, name, cognitoSub }`, Cognito `{ sub, JWT, refreshToken }`

**Dependencies**

- Upstream: None (entry point)
- Downstream: `create_org` — admin must be authenticated before creating an org

**Design Decisions**

- Cognito for managed auth — no custom password infrastructure to maintain
- Email verification required before org creation to prevent spam accounts
- Social login (Google) planned for faster onboarding in a future release

---

#### 4.0.2 Create Organization

**Status:** 100% — Shipped

**Description**

Provision a new organization, set name and type, auto-create the admin's membership with full permissions. The org is the top-level tenant — all data in the system is scoped by `orgId`.

**How It Works**

First-time admin creates their org with name, type, and settings. The system provisions the org in the database and creates the admin's `Membership` with `role: ADMIN`.

**User Experience**

- Admin enters org name, selects industry type
- System auto-generates a URL slug for branding
- Redirected to dashboard with full admin access

**Data Flow**

```
Signup JWT → API → create Organization { name, slug, settings }
                 → create Membership { userId, orgId, role: ADMIN }
```

`Organization.id` becomes the tenant scope for all subsequent data.

**Dependencies**

- Upstream: `admin_signup`
- Downstream: `subscription`, `form_builder`, `setup_properties`, `invite_team`, `license_management`, `vocabulary_aliases`, `feature_toggles`

**Design Decisions**

- Org is the top-level tenant — all data scoped via `orgId`
- Multi-org support: users can belong to multiple orgs via separate `Membership` records
- Org slug used for branding URLs and client portal

---

#### 4.0.3 Subscription & Billing

**Status:** 30% — Building

**Description**

Stripe integration for tiered subscription management. Fixed subscription tiers — not usage-based billing. Three tiers: Base ($350/mo), Pro ($650/mo), Enterprise (custom). Feature availability is gated by tier.

**How It Works**

After org creation, admin selects a plan via Stripe Checkout. The system manages the full subscription lifecycle: trial → active → past_due → cancelled. Stripe webhooks update the local subscription state.

**User Experience**

- Admin selects plan tier from pricing page
- Stripe Checkout handles payment securely (card details never touch PAX servers)
- Stripe Customer Portal for self-serve plan changes, invoices, and cancellation

**Data Flow**

```
Dashboard → Stripe Checkout → webhook → Organization.stripeCustomerId
                                       → Subscription { plan, status, currentPeriod }
```

**Dependencies**

- Upstream: `create_org`
- Downstream: `feature_toggles` (tier determines available features)

**Design Decisions**

- Stripe for managed billing — Customer Portal for self-serve reduces support burden
- Three fixed tiers: Base ($350/mo), Pro ($650/mo), Enterprise (custom)
- Feature gating by tier — unavailable features are grayed out with an "upgrade" prompt, never hidden
- Webhook-driven state updates — no polling Stripe

---

#### 4.0.4 Form Builder

**Status:** 60% — Building

**Description**

Unified drag-and-drop inspection form editor and ingestion system. Admins build forms with sections, fields, and conditional logic. Also supports PDF/web form import via OCR — the ingestion flow is a feature of the Form Builder, not a separate product. Per-field configuration for importance weighting, key terms, and validation.

**How It Works**

Admin builds inspection forms using a drag-and-drop editor, or selects from a template library. Forms define what data gets collected during an inspection. The builder also handles import of existing PDF/web forms — an OCR engine detects field labels, types, and structure, then auto-creates `FormField` records from uploaded documents. Admin reviews and adjusts detected fields before publishing.

**User Experience**

- Drag-and-drop field placement into sections
- Configure per-field: type, importance weight, key terms, validation rules
- Preview form as an inspector would see it
- Import existing PDF forms via OCR auto-detection
- System highlights detected fields with confidence scores
- Admin confirms, adjusts, or removes detected fields

**Data Flow**

```
Admin edits → Form { orgId, name, version, schema }
            → FormField[] { label, type, options, order, required, importance, keyTerms }

Upload → OCR engine → detected fields[] → admin review → FormField[] creation
```

Form schema feeds AI extraction prompts directly.

**Dependencies**

- Upstream: `create_org`
- Downstream: `form_templates`, `form_versioning`, `field_configuration`, `form_markdown_guidance`, `output_configuration`, `admin_assigns` (form selection), `inspection_begins`

**Design Decisions**

- Drag-and-drop form builder in the dashboard
- Template library for common inspection types (EPS, general, safety)
- Forms are versioned — editing a published form creates a new version, past inspections are not affected
- Field types: text, number, select, photo, signature, date, GPS
- GPS field type supports three modes via `geoMode: GeoFieldMode`:
  - **POINT**: Single lat/lng capture — tap to drop a pin (default)
  - **POLYGON**: Draw or walk a boundary — inspector traces an area on the map or walks the perimeter with GPS recording
  - **TRACK**: Record continuous path — Strava-style GPS track recording for the duration of a form section
- OCR via Textract or GPT-4o vision for field detection from uploaded PDFs
- Human-in-the-loop: never auto-publish ingested forms — admin must review and confirm

---

#### 4.0.5 Form Ingestion

**Status:** 5% — Vision

**Description**

This feature is **merged into Form Builder** as part of the unified system. It exists as a separate node in the architecture board for visibility, but all functionality is covered by the Form Builder above. The OCR import flow — uploading a PDF, detecting fields, reviewing results — is a feature of the Form Builder, not a standalone product.

---

#### 4.0.6 Template Library

**Status:** 20% — Early

**Description**

Pre-built form templates based on anonymized forms from other companies. Company-specific details are removed. Templates serve as starting points — admin clones a template and customizes it for their org.

**How It Works**

Pre-built form templates for common inspection types. Admin browses templates by category, previews them, and clones with one click into the Form Builder for customization. Templates are based on real forms from other companies with all company-specific details stripped.

**User Experience**

- Browse template library by category (EPS / Pest Control, Property, Safety, General)
- Preview template before cloning
- One-click clone → opens in Form Builder for customization

**Data Flow**

```
FormTemplate { name, category, schema } → clone → Form { isTemplate: false, orgId }
```

Templates are maintained by the PAX team.

**Dependencies**

- Upstream: `form_builder`
- Downstream: None (templates flow into Form Builder)

**Design Decisions**

- Categories: EPS / Pest Control, Property, Safety, General
- Community templates planned for a marketplace (future)
- Templates versioned independently from org forms
- Templates are anonymized — no client data, no company branding

---

#### 4.0.7 Form Markdown Guidance

**Status:** 0% — Vision

**Description**

AI-enabled contextual guidance per form: mapping rules, field expectations, examples. Fed directly to the AI during extraction to improve accuracy. This is not just static markdown — it is an AI-driven process that ensures each field understands its context, meaning, and expected output type.

**How It Works**

AI-enabled markdown documents per form that describe mapping rules, field expectations, examples, and context. These documents are injected directly into the AI extraction prompt alongside the form schema. The process ensures each field has full context about its meaning and expected output.

**User Experience**

- Admin writes or uploads markdown guidance per form
- Includes field mapping hints and example values
- AI references this context during extraction for higher accuracy

**Data Flow**

```
Admin edits → FormGuidance { formId, markdownContent, examples[], fieldMappingHints }
            → injected into AI extraction prompt alongside form schema
```

**Dependencies**

- Upstream: `form_builder`
- Downstream: `ai_extraction` (guidance context)

**Design Decisions**

- Markdown for maximum flexibility — supports rich examples, tables, conditional rules
- Per-form (not per-field) to keep management simple
- Versioned alongside form versions
- AI-driven: the guidance actively shapes extraction behavior, not just documentation

---

#### 4.0.8 Form Versioning

**Status:** 40% — Building

**Description**

Version control for forms. Edits create new versions — past inspections are never affected. Critical because database adjustments happen when a form changes. The system needs to track when changes occurred so it knows which schema version applies to which data.

**How It Works**

Every edit to a published form creates a new version. Past inspections always reference their original form version. Publishing a new version makes it the default for new inspections. Tracking version timestamps is critical for database schema alignment.

**User Experience**

- Admin edits form in draft mode
- Publishes when ready — creates an immutable snapshot
- Can view version history and diff changes between versions

**Data Flow**

```
Edit → draft → publish → Form.version incremented → FormField[] snapshot frozen
Past CallSession references keep original version
```

**Dependencies**

- Upstream: `form_builder`
- Downstream: All inspection entities reference a specific form version

**Design Decisions**

- Immutable snapshots on publish — once published, a version cannot be modified
- Draft mode for in-progress edits — only published versions are visible to inspectors
- Version diffing for admin review
- Timestamp tracking for schema/data alignment — when a form version was published determines which schema applies to which inspections

---

#### 4.0.9 Setup Properties

**Status:** 30% — Building

**Description**

Client and property management — a "baby back-end CRM." Define properties/sites to inspect, manage clients, and link clients to their properties. This is where all CRM details live: client contacts, property addresses, GPS coordinates, and relationship management.

**How It Works**

Admin defines properties/sites that get inspected. Each property has an address, GPS coordinates, and is linked to a client `Person`. The system also serves as the CRM for managing client contacts and their properties.

**User Experience**

- Add property with address autocomplete (Google Places API)
- Link to client contact from the Person list
- View properties on a map with GPS pins
- Manage client details, contact information, and property relationships

**Data Flow**

```
Admin input → Property { orgId, address, gps, clientPersonId }
            → Person { orgId, name, email, type: CLIENT }
```

GPS coordinates sourced from Google Places API. `Property.id` used in `Assignment` records.

**Dependencies**

- Upstream: `create_org`
- Downstream: `assign_numbers`, `integration_settings`, `admin_assigns` (property selection)

**Design Decisions**

- Google Places API for address autocomplete and GPS coordinate resolution
- GPS coordinates enable map view and future routing optimization
- Client linkage via `Person` entity (not `User`) — clients are not system users
- Functions as lightweight CRM for client/property management
- Property boundary polygon (PropertyBoundary) can be defined per property for coverage verification and geofencing — see `property_boundaries` (4.0.17)

---

#### 4.0.10 License Management

**Status:** 0% — Vision

**Description**

Company codes for batch employee onboarding. License tracking and seat management. Licenses cover both app access and phone/Twilio number access. Seat limits are based on subscription tier.

**How It Works**

Enterprise orgs get company codes for batch employee onboarding. Admins generate license codes, set seat limits, and track usage. Alternative to individual email invites for large teams. A license grants access to both the mobile app and the phone call system (Twilio number).

**User Experience**

- Admin generates license code with seat limit and optional expiry
- Shares code with team via email, Slack, or print
- Dashboard shows seats used vs. available

**Data Flow**

```
Admin creates → License { orgId, code, maxSeats, usedSeats, expiresAt }
Inspector enters code → validates → creates Membership
```

**Dependencies**

- Upstream: `create_org`
- Downstream: `license_code_entry`

**Design Decisions**

- Codes are short alphanumeric strings — easy to share verbally or on a poster
- Seat-based licensing aligned with subscription tier
- Codes can be revoked or expired by admin
- License covers both app access and phone number access — single credential

---

#### 4.0.11 Assign Phone Numbers

**Status:** 40% — Building

**Description**

Provision a Twilio phone number for voice inspections. Each org gets a dedicated number that inspectors call to conduct phone-based inspections.

**How It Works**

Each org gets a dedicated Twilio phone number. Admin provisions and assigns numbers from the dashboard. When an inspector calls the number, Twilio's webhook hits the PAX API to create a `CallSession` and begin recording.

**User Experience**

- Admin clicks "Provision Number" in settings
- System auto-selects a local number from Twilio inventory
- Number displayed for sharing with inspectors

**Data Flow**

```
Admin request → Twilio API → TwilioNumber { phoneNumber, orgId, sid }
             → Organization.twilioPhoneNumber updated
```

**Dependencies**

- Upstream: `setup_properties`
- Downstream: `invite_team` (number included in invite), `calls_twilio`

**Design Decisions**

- Twilio number provisioned via API — ~$1/mo per number
- Call routing: Twilio webhook → API → CallSession creation
- Multiple numbers per org for different regions planned for future

---

#### 4.0.12 Integration Settings

**Status:** 10% — Early

**Description**

Configure third-party integrations, webhooks, and API keys. Visible API endpoints with delivery status tracking. Connectors for Salesforce, ServiceNow, and other enterprise systems.

**How It Works**

Configure connections to third-party systems: CRMs, property management software, compliance databases. Webhook endpoints for real-time event delivery. Visible API endpoints with delivery status tracking.

**User Experience**

- Configure webhook URLs with event filtering
- Generate and manage API keys
- View delivery status and retry failed webhooks
- One-click Salesforce/ServiceNow connector setup

**Data Flow**

```
Admin config → Integration { orgId, provider, config }
             → WebhookEndpoint { url, events[], secret }
```

**Dependencies**

- Upstream: `setup_properties`
- Downstream: `external_ticket_source`, `external_system_export`

**Design Decisions**

- Webhook configuration with event filtering — only subscribe to events you care about
- API key management for programmatic access
- OAuth integrations for partner platforms
- Delivery status tracking with automatic retry on failure

---

#### 4.0.13 Field Configuration

**Status:** 15% — Early

**Description**

Per-field advanced configuration beyond basic type and label: importance weighting for completeness scoring, descriptive text for AI context, key terms for extraction matching, and custom validation rules.

**How It Works**

Click any field in the Form Builder to open an advanced configuration panel. Set importance weights that drive completeness scoring, add key terms that help AI match transcript phrases to fields, and define validation rules.

**User Experience**

- Click any field in Form Builder → advanced config panel opens
- Set importance weight (0–1) for completeness scoring
- Add key terms and descriptive text for AI extraction hints
- Define validation rules (regex, range, enum constraints)

**Data Flow**

```
FieldConfig { fieldId, importance, keyTerms[], validationRules, descriptiveText }
→ fed into AI extraction prompt + quality validation checks
```

**Dependencies**

- Upstream: `form_builder`
- Downstream: `output_configuration`, `ai_extraction`, `confidence_scoring`

**Design Decisions**

- Importance weighting drives completeness percentage calculation
- Key terms help AI match transcript phrases to the correct fields
- Validation rules run both client-side (in app) and server-side (on API)

---

#### 4.0.14 Output Configuration

**Status:** 5% — Vision

**Description**

Per-form output configuration: target format (CSV, JSON, PDF), external system mapping, and a visual flow editor for routing form fields to output targets.

**How It Works**

Per-form output configuration defines how inspection data is delivered. A visual drag-and-drop editor lets admins map form fields to output columns and configure transformations.

**User Experience**

- Select output format per form (PDF, CSV, JSON, webhook)
- Visual drag-and-drop editor: map form fields → output columns
- Preview output with sample data before saving

**Data Flow**

```
OutputConfig { formId, format, template, targetSystem, fieldMapping[] }
→ drives PDF generation, CSV export, and external system delivery
```

**Dependencies**

- Upstream: `field_configuration`, `form_builder`
- Downstream: `output_template_manager`, `external_system_export`

**Design Decisions**

- Visual flow editor for non-technical admins
- Per-form, not per-org — different forms can have different output configurations
- Field transformation rules supported (e.g., date formatting, unit conversion)

---

#### 4.0.15 Vocabulary & Aliases

**Status:** 0% — Vision

**Description**

Company-wide or form-specific term aliases and vocabulary packages. Maps informal shorthand, acronyms, and regional terms to canonical values for consistent AI extraction. Example: "Lifetime North" = "LTN" = "North Project."

**How It Works**

Admin defines aliases that map informal terms to canonical values. Industry vocabulary packages provide pre-built term sets. The AI uses these during transcription and field mapping to normalize extracted values.

**User Experience**

- Admin adds aliases: "LTN" → "Lifetime North"
- Select industry vocabulary packages (pest control, HVAC, etc.)
- AI uses aliases during transcription → field mapping

**Data Flow**

```
Alias { orgId, formId?, canonical, variants[] }
VocabularyPackage { orgId, industry, terms[] }
→ fed to field normalization and AI extraction
```

**Dependencies**

- Upstream: `create_org`
- Downstream: `field_normalization`

**Design Decisions**

- Company-wide aliases apply to all forms unless overridden at the form level
- Industry vocabulary packages pre-built by PAX
- Aliases significantly improve extraction accuracy for domain-specific terms

---

#### 4.0.16 Feature Toggles

**Status:** 0% — Vision

**Description**

Tier-based feature gating. Base tier has the fewest features, Pro unlocks more, Enterprise gets everything. Features unavailable on a tier are shown grayed out with an "upgrade to use" prompt — never hidden. Permissions are set in the dashboard and editable from within the app.

**How It Works**

Subscription-tier-based feature gating: Base < Pro < Enterprise. Features not available on a tier are visible but locked — grayed out with an "upgrade" prompt. Admins configure org-wide defaults in the dashboard. Users can override some settings in their app preferences.

**User Experience**

- Admin configures org-wide defaults in settings
- Unavailable features show grayed out with "upgrade to use" prompt
- Inspectors can override allowed settings in their preferences

**Data Flow**

```
OrgFeatureConfig { orgId, markupEnabled, captioningMode, defaultCaptureMode, subscriptionTier }
→ merged with UserPreference overrides at runtime
→ tier determines which features are available
```

**Dependencies**

- Upstream: `create_org`, `subscription` (tier)
- Downstream: `user_preferences` (org defaults flow to user)

**Design Decisions**

- Tier-based gating — features are never hidden, always visible but locked when unavailable
- Org defaults as baseline, user overrides for flexibility
- Gradual rollout: enable features per-org before global release

---

#### 4.0.17 Property Boundaries

**Status:** 0% — Vision

**Description**

Admin draws or imports a property boundary polygon for coverage verification, site maps, and geofencing. Sources: manual draw on map, parcel API lookup, or GPS trace from an inspector's walk.

**How It Works**

Admin defines a property boundary via one of three methods: (1) manual polygon drawing on a Mapbox map in the dashboard, (2) parcel API lookup that auto-populates the boundary from county/municipal parcel data, or (3) GPS trace import from an inspector's walk that converts a track to a polygon. The boundary is stored as GeoJSON and used for coverage verification, geofencing, and site map overlays.

**User Experience**

- Property settings → "Define Boundary" button
- Draw polygon on satellite map (Mapbox GL JS)
- Or: "Look up parcel" → auto-fill from parcel API
- Or: "Import from GPS trace" → select a past inspection's track
- Area calculated automatically and displayed

**Data Flow**

```
Admin draw / parcel API / GPS trace
→ PropertyBoundary { propertyId, polygon (GeoJSON), areaMeters, source }
→ used by coverage_verification, geofencing, site_map_view
```

**Entities:** PropertyBoundary { propertyId, polygon, areaMeters, source }

**Dependencies**

- Upstream: `setup_properties`
- Downstream: `coverage_verification`, `geofencing`, `site_map_view`

**Design Decisions**

- GeoJSON Polygon format for maximum interoperability
- Parcel API integration (e.g., Regrid/Loveland) for automatic boundary population
- Area calculated via Turf.js (client-side) or PostGIS (server-side)
- One boundary per property — updated, not versioned

---

#### 4.0.18 Vertical Configuration

**Status:** 0% — Vision

**Description**

Per-org industry/vertical selection with compliance presets. Drives default form templates, output formats, compliance requirements, and field presets. Verticals: pest_control, telecom, environmental_phase1, landscaping, construction, property_assessment, safety_osha, utility_infrastructure, general.

**How It Works**

During org setup (or later in settings), admin selects their industry vertical. The system applies vertical-specific defaults: recommended form templates, output format presets, compliance requirements, and field configuration presets. Vertical config stored in VerticalConfig and referenced throughout the system.

**User Experience**

- Org setup wizard → "Select your industry" step
- Pre-populated defaults applied on selection
- Can change vertical later in org settings
- Dashboard shows vertical-relevant tips and recommendations

**Data Flow**

```
Admin selects vertical → VerticalConfig { orgId, verticalType, complianceReqs, outputTemplates, fieldPresets }
→ system applies defaults: Form templates, OutputConfig, FieldConfig presets
```

**Entities:** VerticalConfig { orgId, verticalType, complianceReqs, outputTemplates, fieldPresets }

**Dependencies**

- Upstream: `create_org`
- Downstream: `form_templates`, `output_configuration`, `compliance_packs`

**Design Decisions**

- Vertical selection is optional — defaults to "general" if not set
- Presets are suggestions, not restrictions — admin can always override
- New verticals added via configuration, not code changes
- Compliance requirements stored as JSON for flexibility

---

### 4.1 Tier 1 — User Onboarding

> **Invite → Claim → Ready**
>
> Getting inspectors from zero to productive. Two paths: email invite with magic link, or enterprise license code. Target: under 5 minutes from invite to first inspection. This tier has 7 features.

---

#### 4.1.1 Invite Team

**Status:** 100% — Shipped

**Description**

Email invites with magic links. Role-based memberships. Admin sends invites, inspectors claim them and auto-join the org.

**How It Works**

Admin sends email invites to inspectors. Each invite creates a pending `Membership`. The inspector receives a magic link to claim their account and auto-join the org with the assigned role.

**User Experience**

- Admin enters email addresses, selects role (Admin, Manager, Inspector, Viewer)
- Bulk invite via CSV upload or one-by-one
- Track invite status: sent, opened, claimed

**Data Flow**

```
Admin submits → Invite { email, orgId, role, token, expiresAt }
             → SES email with magic link
             → Membership { status: PENDING → ACTIVE }
```

**Dependencies**

- Upstream: `create_org`, `assign_numbers`
- Downstream: `inspector_claims`, `license_code_entry` (alternative path)

**Design Decisions**

- Roles: Admin, Manager, Inspector, Viewer
- Invite link expires after 7 days — re-invite available
- Cross-org support: inspector with existing account merges memberships automatically

---

#### 4.1.2 Inspector Claims Invite

**Status:** 100% — Shipped

**Description**

Magic link claim. One click creates an account (or links to an existing one) and auto-joins the org with the Inspector role. Mobile-first experience.

**How It Works**

Inspector receives an email with a magic link. One click creates their account (or links to existing) and auto-joins the org with Inspector role. The experience is optimized for mobile.

**User Experience**

- Click magic link in email
- Auto-creates account or links to existing account
- Redirected to app download page or phone number display

**Data Flow**

```
Magic link → validate token → create User { email, phone, cognitoSub }
           → update Membership { status: ACTIVE, joinedAt }
```

**Dependencies**

- Upstream: `invite_team`
- Downstream: `gets_app`

**Design Decisions**

- Magic link preferred over manual signup — lowest friction path
- Link works in mobile browser, redirects to app if already installed
- Zero-training target: inspector should be productive within 5 minutes

---

#### 4.1.3 License Code Entry

**Status:** 0% — Vision

**Description**

Inspector enters a company code to join an enterprise org. Alternative to magic link invite — useful for large teams where individual invites are impractical.

**How It Works**

Inspector enters a company code to join an enterprise org. The system validates the code, checks remaining seats, creates the user account and membership, and increments the seat count.

**User Experience**

- Open app → "Join with Code" option
- Enter alphanumeric code provided by employer
- Instant org join with Inspector role

**Data Flow**

```
Code input → validate License.code → check seats remaining
           → create User + Membership → increment License.usedSeats
```

**Dependencies**

- Upstream: `license_management`, `invite_team` (alternative path)
- Downstream: `gets_app`

**Design Decisions**

- Alternative to email invites for enterprise scale
- Codes can be printed on job site posters for easy distribution
- Seat limit enforcement prevents unauthorized access

---

#### 4.1.4 Gets App & Number

**Status:** 35% — Building

**Description**

Two paths: (1) download the Expo app for full-featured inspections with camera, GPS, and offline support, or (2) just get the org's phone number for voice-only inspections. Shows the default form on first launch. User can request access to additional forms.

**How It Works**

After claiming an invite or entering a license code, the inspector either downloads the Expo app or receives the org's Twilio phone number. The app shows the default form assignment on first launch.

**User Experience**

- Deep link from invite → app store download
- First launch shows default form assignment
- Can request access to additional forms from admin

**Data Flow**

```
Invite/code → app install → JWT auth → load Membership
            → display Organization.twilioPhoneNumber + assigned forms
```

**Dependencies**

- Upstream: `inspector_claims`, `license_code_entry`
- Downstream: `user_preferences`, `training`

**Design Decisions**

- Phone MVP — works on any phone, zero install friction
- App adds: photos in context, GPS, offline mode, form preview
- Deep link from invite email → app store or phone display

---

#### 4.1.5 User Preferences

**Status:** 0% — Vision

**Description**

Per-user settings: default form, preferred capture mode, notification preferences, and feature toggle overrides. Merges with org-level defaults at runtime.

**How It Works**

Per-user settings stored server-side for cross-device consistency. Merges with org-level defaults — user overrides win where allowed.

**User Experience**

- Settings screen in app
- Select default form for quick-start inspections
- Choose capture mode: camera-first vs voice-first
- Configure push notification preferences

**Data Flow**

```
UserPreference { userId, defaultFormId, captureMode, notificationPrefs, featureOverrides }
→ merged with OrgFeatureConfig at runtime (user overrides win)
```

**Dependencies**

- Upstream: `gets_app`, `feature_toggles` (org defaults)
- Downstream: `ready_inspect`, `opens_app` (default form and mode)

**Design Decisions**

- User preferences override org defaults for flexibility
- Stored server-side for cross-device consistency
- Synced to local storage for offline access

---

#### 4.1.6 Training Walkthrough

**Status:** 0% — Vision

**Description**

Guided first-inspection walkthrough. Target: under 5 minutes. The system should be nearly self-explanatory — training is a safety net, not a requirement.

**How It Works**

Guided first-inspection walkthrough with a demo form, practice call, tips and best practices. Goal: inspector can do a real inspection within 5 minutes of claiming their invite.

**User Experience**

- Interactive demo inspection in sandbox mode
- Voice prompt practice for phone path
- Photo capture tips for quality images
- Progress tracker shows completion

**Data Flow**

```
Training module → sandbox CallSession (not saved to real data)
               → completion flag on User profile
```

**Dependencies**

- Upstream: `gets_app`
- Downstream: `ready_inspect`

**Design Decisions**

- Interactive demo preferred over video tutorials
- Sandbox mode — no real data affected
- Skip option for experienced inspectors
- Under 5 minute target — the system should be nearly self-explanatory

---

#### 4.1.7 Ready to Inspect

**Status:** 30% — Building

**Description**

Checkpoint: inspector has everything needed — app installed or phone number saved, form assignments in queue, understanding of the process. Admin can push new form access from the dashboard.

**How It Works**

Readiness is a computed state, not a stored field. The system checks: has active membership, has app or phone number, has assignments in queue.

**User Experience**

- App shows readiness checklist
- Green checkmarks for completed setup steps
- Assignment queue visible and ready

**Data Flow**

```
Readiness = has Membership(ACTIVE) + has app or phone + has Assignment[] in queue
Admin can push form access via dashboard
```

**Dependencies**

- Upstream: `user_preferences`, `training`
- Downstream: `self_start`, inspection trigger tier

**Design Decisions**

- Readiness is a computed state, not a stored field
- Admins notified if inspector hasn't completed setup within expected timeframe
- Gentle reminders via push notification

---

### 4.2 Tier 2 — Inspection Trigger

> **Schedule · Assign · Self-Start**
>
> Three ways an inspection begins: automated schedule, admin assignment, or inspector self-start. All paths converge at "Inspection Begins." This tier has 6 features.

---

#### 4.2.1 Scheduler / Recurring

**Status:** 0% — Vision

**Description**

Automated recurring inspections based on schedules. Calendar-based triggers create assignments automatically at defined intervals.

**How It Works**

Admin creates recurring schedules with form, property, and frequency. A cron job triggers at defined intervals (weekly, monthly, quarterly) and auto-creates assignments with push notifications.

**User Experience**

- Admin creates schedule: form + property + frequency
- Calendar view shows upcoming auto-inspections
- Auto-assignment to available inspectors

**Data Flow**

```
Schedule { formId, orgId, frequency, nextRun }
→ cron trigger → auto-create Assignment → push notification to assigned inspector
```

**Dependencies**

- Upstream: `form_builder`, `setup_properties`
- Downstream: `inspection_begins` (recurring trigger)

**Design Decisions**

- Recurring schedules per property/form type
- Auto-assignment to available inspectors (round-robin)
- Calendar sync (Google Calendar, Outlook) planned for future

---

#### 4.2.2 Admin Assigns

**Status:** 15% — Early

**Description**

Admin manually assigns an inspection to an inspector with a specific form and property. Triggers a push notification. Supports ticket-based assignment from external systems.

**How It Works**

Admin assigns an inspection to a specific inspector. Assignment includes form selection, property details, deadline, and special instructions. A push notification is sent immediately.

**User Experience**

- Select inspector, form, property from dropdowns
- Set deadline and add notes
- Inspector gets immediate push notification
- Bulk assignment for multiple properties

**Data Flow**

```
Admin action → Assignment { orgId, userId, formId, propertyId, deadline, notes }
             → push notification via PushToken → appears in inspector's queue
```

**Dependencies**

- Upstream: `form_builder` (form selection), `setup_properties` (property selection), `ready_inspect`
- Downstream: `inspection_begins`
- External inputs: `external_ticket_source`, `feedback_loop` (re-inspection), `push_notification_service`

**Design Decisions**

- Push notification to inspector on assignment
- Deadline tracking with overdue alerts
- External ticket sources can auto-create assignments via integration

---

#### 4.2.3 External Ticket Source

**Status:** 0% — Vision

**Description**

Ingest tickets from external systems (Jira, ServiceNow, property management software) and automatically map them to inspection assignments.

**How It Works**

External systems push tickets via webhook (or PAX polls on a schedule). Tickets are mapped to forms and auto-create assignments.

**User Experience**

- Admin configures integration in settings
- Tickets auto-appear as assignments in dashboard
- Two-way sync: completion status flows back to source system

**Data Flow**

```
External webhook/poll → TicketSource { provider, externalId, mappedFormId }
                      → auto-create Assignment → inspector notification
```

**Dependencies**

- Upstream: `integration_settings`
- Downstream: `admin_assigns` (ticket → assign)

**Design Decisions**

- Webhook-based for real-time, polling as fallback
- Field mapping configurable per integration
- Bi-directional status sync

---

#### 4.2.4 Inspector Self-Start

**Status:** 10% — Early

**Description**

Inspector initiates an ad-hoc inspection from the app. Selects a form, optionally selects a property, and begins immediately.

**How It Works**

Inspector initiates an inspection on their own — selects a form, optionally selects a property, and begins. The system creates a self-assigned `Assignment` record for tracking.

**User Experience**

- Tap "Start Inspection" in app
- Select form from available list
- Optionally select or create property
- Begin immediately

**Data Flow**

```
Inspector action → Assignment { self: true, formId, propertyId? }
                 → CallSession created → inspection begins
```

**Dependencies**

- Upstream: `ready_inspect`
- Downstream: `inspection_begins`

**Design Decisions**

- Ad-hoc inspections not on the schedule — follow-up inspections, training runs
- Self-assigned assignments tracked the same as admin-assigned
- Available forms controlled by admin — inspector can only select from assigned forms

---

#### 4.2.5 Inspection Begins

**Status:** 50% — Building

**Description**

The inspection starts. Inspector selects a mode: site walk (live GPS + photos) or after-the-fact (sitting, upload photos, narrate). The system creates a `CallSession` — the central tracking entity for the entire inspection lifecycle.

**How It Works**

Inspector begins the inspection and selects their mode. The system creates a `CallSession` and begins data capture. The session can be paused and resumed for multi-hour inspections.

**User Experience**

- Select inspection mode (site walk or after-the-fact)
- AI-guided voice conversation based on form fields
- Progress indicator shows completion percentage
- Can pause and resume

**Data Flow**

```
Mode selection → CallSession { orgId, userId, formId, assignmentId, mode, status: IN_PROGRESS }
              → routes to phone or app capture path
```

**Dependencies**

- Upstream: `scheduler`, `admin_assigns`, `self_start`
- Downstream: `inspection_mode_selector`

**Design Decisions**

- Two modes cover all inspection scenarios
- `CallSession` is the central tracking entity for the entire inspection lifecycle
- Pause/resume supported for multi-hour inspections

---

#### 4.2.6 Inspection Mode Selector

**Status:** 10% — Early

**Description**

Determines the data capture path. Site walk mode activates live GPS tracking and real-time photo capture. After-the-fact mode is optimized for narrating over pre-taken photos.

**How It Works**

Determines data capture path: site walk mode activates live GPS tracking + real-time photo capture, while after-the-fact mode is optimized for narrating over pre-taken photos.

**User Experience**

- Simple toggle: "On-Site" vs "After the Fact"
- On-site: GPS tracking starts, camera accessible
- After-fact: photo upload prompt, narration mode

**Data Flow**

```
InspectionMode { SITE_WALK, AFTER_FACT } stored on CallSession
→ routes to phone call path or app form path based on selection + device
```

**Dependencies**

- Upstream: `inspection_begins`
- Downstream: `calls_twilio` (phone mode), `opens_app` (app mode)

**Design Decisions**

- Two modes cover 95% of use cases
- Mode selection influences AI extraction strategy
- Default mode configurable per org/user via `UserPreference`

---

### 4.3 Tier 3 — Data Capture

> **Phone + App — Two Parallel Paths**
>
> Data enters the system through two parallel paths: a phone call to the Twilio number, or the Expo mobile app. Both paths produce the same output: transcripts, photos, and metadata that flow into AI processing. GPS track recording, geofencing, session narratives, and unmapped notes capture extend the data capture pipeline. This tier has 12 features.

---

#### 4.3.1 Calls Twilio Number

**Status:** 60% — Building

**Description**

Inspector dials the org's Twilio number. A webhook fires, the API creates a `CallSession`, and recording + real-time transcription begin. A form selection menu guides which form to fill.

**How It Works**

Inspector calls the org's Twilio number. Twilio's webhook hits the API, which creates a `CallSession` and begins recording + real-time transcription via Media Streams WebSocket. A voice menu guides form selection if the inspector has multiple forms assigned.

**User Experience**

- Dial org phone number
- Voice menu: select form (if multiple assigned)
- AI guides through form fields conversationally
- Can text photos to the same number during the call

**Data Flow**

```
Phone call → Twilio webhook → API → CallSession { twilioCallSid }
           → Media Streams WebSocket → real-time transcription
```

**Dependencies**

- Upstream: `inspection_mode_selector` (phone mode)
- Downstream: `realtime_audio`, `session_metadata_capture`

**Design Decisions**

- Twilio Media Streams for real-time audio via WebSocket
- Call recording stored in S3 as backup
- Latency target: <500ms for transcription

---

#### 4.3.2 Real-time Audio Stream

**Status:** 50% — Building

**Description**

Audio stream from Twilio piped to transcription service in real-time. Transcription chunks arrive every 1–3 seconds with speaker diarization.

**How It Works**

Audio stream from Twilio is piped via WebSocket to the transcription service. Transcription chunks arrive every 1–3 seconds with speaker diarization and punctuation formatting.

**User Experience**

- Inspector speaks naturally — no special commands needed
- AI processes speech in real-time
- Occasional voice prompts guide to the next field

**Data Flow**

```
Twilio MediaStream → WebSocket → Deepgram
→ TranscriptChunk { text, timestamp, speaker } → buffered for AI extraction
```

**Dependencies**

- Upstream: `calls_twilio`
- Downstream: `sms_photos`, `transcription`

**Design Decisions**

- Deepgram for real-time streaming ($0.0043/min)
- Whisper API for post-processing polish ($0.006/min)
- Speaker diarization + punctuation formatting included

---

#### 4.3.3 Opens App Form

**Status:** 40% — Building

**Description**

Inspector opens the Expo app, sees their assigned inspections, selects one, and begins. The app loads the form schema from the server and shows real-time AI mapping feedback as the inspector captures data.

**How It Works**

Inspector opens the Expo app, sees their assignment queue, selects an assignment, and begins. The form schema is loaded from the server and rendered as a step-by-step UI. Real-time field population preview shows AI mapping as data is captured.

**User Experience**

- Open app → see assignment queue
- Select assignment → form loads
- Step-by-step UI with capture buttons (text, photo, voice, signature)
- Real-time field population preview from AI

**Data Flow**

```
App → API → load Assignment { formId, property }
          → render Form { fields[], sections[] }
```

**Dependencies**

- Upstream: `inspection_mode_selector` (app mode), `user_preferences` (default form and mode)
- Downstream: `voice_camera_gps`

**Design Decisions**

- Expo SDK with React Native
- Form rendered dynamically from server schema — no hard-coded forms
- Each step can capture text, photo, voice, or signature

---

#### 4.3.4 Voice + Camera + GPS

**Status:** 30% — Building

**Description**

On-device capture: speech-to-text, photos with annotations and markup, GPS coordinates, weather, and device info. Supports photo markup with circles, arrows, and text overlays.

**How It Works**

The Expo app captures voice (on-device STT), photos (with annotations and markup), and GPS coordinates simultaneously. All data is stored locally first and synced when connected.

**User Experience**

- Camera button for photos with annotation tools
- Voice button for spoken notes
- GPS auto-tagged to each capture point
- Markup tools: circle, arrow, text overlay

**Data Flow**

```
Capture → Photo { localUri, gpsLat, gpsLng, altitude, accuracy, heading, speed, capturedAt, trackPointIdx }
        + AudioRecording { localUri, duration }
        → local SQLite → sync queue
```

Photos include enriched GPS metadata: altitude, accuracy (meters), heading (compass direction 0–360), speed (m/s), and exact capture timestamp. Each photo is linked to the nearest GPS track point via `trackPointIdx` for route visualization.

**Dependencies**

- Upstream: `opens_app`
- Downstream: `local_sync`, `photo_markup_tagging`, `session_metadata_capture`, `gps_track_recording`

**Design Decisions**

- Photos captured in context, linked to form fields
- GPS auto-tagged to each capture point with enriched metadata (altitude, heading, accuracy, speed)
- On-device STT via native APIs (free, instant)
- Photo.trackPointIdx links to SessionMeta.gpsTrack for walking route map integration

---

#### 4.3.5 Session Metadata

**Status:** 10% — Early

**Description**

Automatically captured for every inspection session: weather, location, timestamps, pause counts, device info. Provides context for AI and audit trail. Zero inspector effort.

**How It Works**

Automatically captured for every inspection session. Weather auto-fetched from GPS coordinates. Timestamps recorded for session start, pauses, and completion.

**User Experience**

- Invisible to inspector — fully automatic
- Weather auto-fetched from GPS coordinates
- Timestamps for session start, pauses, completion

**Data Flow**

```
Auto-capture → SessionMeta {
  sessionId, weather, deviceInfo, pauseCount,
  gpsTrack[]: { lat, lng, altitude?, accuracy, heading, speed, timestamp },
  totalDistance (meters), coveragePercent, durationSeconds, averageSpeed (m/s)
}
→ WeatherSnapshot { temperature, conditions, humidity, windSpeed, windDirection, pressure, visibility, source }
→ stored as context metadata
```

`gpsTrack` element format: `{ lat: Float, lng: Float, altitude?: Float, accuracy: Float, heading: Float, speed: Float, timestamp: ISO8601 }`. Post-processing calculates `totalDistance`, `averageSpeed`, `durationSeconds`, and `coveragePercent` (if PropertyBoundary defined).

**Dependencies**

- Upstream: `voice_camera_gps`, `calls_twilio`
- Downstream: `form_field_values` (metadata context), `gps_track_recording`, `weather_correlation`, `time_analytics`

**Design Decisions**

- Zero inspector effort — fully automatic background capture
- Weather API call based on GPS + timestamp → stored as WeatherSnapshot model
- Metadata available for audit and dispute resolution
- GPS track metrics (distance, coverage, duration, speed) calculated post-sync on server

---

#### 4.3.6 Photo Markup & Tagging

**Status:** 5% — Vision

**Description**

In-app photo annotation tools: draw circles around defects, add arrows pointing to issues, overlay text tags. Caption confirmation toggle lets the inspector review AI-generated captions.

**How It Works**

After taking a photo, annotation tools appear. Inspector can draw circles, arrows, and text annotations. AI suggests a caption — inspector confirms or edits. Tags are auto-linked to relevant form fields.

**User Experience**

- Take photo → markup tools appear
- Draw circles, arrows, text annotations
- AI suggests caption → inspector confirms or edits
- Tags auto-linked to relevant form fields

**Data Flow**

```
Photo → markup → PhotoAnnotation { photoId, type, coordinates, text, color }
     → sent to photo analysis AI
```

**Dependencies**

- Upstream: `voice_camera_gps`
- Downstream: `local_sync`, `photo_analysis`

**Design Decisions**

- Simple touch-based drawing tools optimized for mobile
- Annotations preserved as a separate layer (original photo untouched)
- Caption confirmation reduces AI hallucination risk

---

#### 4.3.7 SMS Photos

**Status:** 15% — Early

**Description**

During or after a phone call, inspector texts photos to the Twilio number. Photos are auto-matched to the active `CallSession` via phone number + 30-minute time window.

**How It Works**

Inspector sends photos via MMS to the org's Twilio number. Photos are automatically matched to the active `CallSession` via phone number + 30-minute time window and uploaded to S3.

**User Experience**

- Take photo with regular camera
- Text/MMS to org's Twilio number
- Photos auto-appear in the inspection report

**Data Flow**

```
MMS → Twilio webhook → match CallSession via phone + 30min window
    → S3 upload → Photo { callSessionId, s3Key }
```

**Dependencies**

- Upstream: `realtime_audio`
- Downstream: `local_sync`, `photo_analysis`

**Design Decisions**

- Twilio MMS webhook → S3 upload
- Phone number matching to active session within 30-minute window
- Multiple photos in one message supported

---

#### 4.3.8 Local Storage & Sync

**Status:** 15% — Early

**Description**

Offline-first SQLite storage with chunked background sync. All captured data is stored locally first, enabling fully offline inspections. Everything syncs when connectivity returns.

**How It Works**

All captured data is stored locally in SQLite first. Enables fully offline inspections — voice recordings, photos, form data all persist on device. Chunked background sync uploads everything when connectivity returns.

**User Experience**

- Works offline — no connectivity required during inspection
- Sync status indicator in app
- Auto-syncs when connection restored
- Manual sync button available

**Data Flow**

```
Capture → Inspection { formId, fieldValues[] } → SQLite
        → SyncQueue { entity, action } → chunked upload
        → S3 for media, API for structured data
```

**Dependencies**

- Upstream: `voice_camera_gps`, `sms_photos`, `photo_markup_tagging`
- Downstream: `transcription` (synced audio), `photo_analysis` (synced photos)

**Design Decisions**

- expo-sqlite for structured data
- Chunked uploads with resume capability — large files don't fail on flaky connections
- Last-write-wins for simple fields (conflict resolution)
- Offline map tile caching: pre-downloaded Mapbox tiles available during offline inspections — see `offline_map_tiles` (4.7.13)

---

#### 4.3.9 GPS Track Recording

**Status:** 0% — Vision

**Description**

Strava-style continuous GPS recording during site walk mode. Records lat, lng, altitude, accuracy, heading, speed, and timestamp every 1–3 seconds. Calculates total distance, average speed, and active duration. Background recording — does not require the app in the foreground.

**How It Works**

When an inspection starts in SITE_WALK mode, the app begins continuous GPS recording using the device's location services in background mode. Points recorded every 1–3 seconds (adaptive based on movement speed). Track data accumulated in local SQLite and synced to SessionMeta.gpsTrack on completion.

**User Experience**

- Automatic: starts recording when inspection begins in SITE_WALK mode
- Background recording — inspector can switch to camera, notes, etc.
- Live distance counter visible in the inspection header
- Track recording stops when inspection is completed or paused

**Data Flow**

```
Device GPS → { lat, lng, altitude?, accuracy, heading, speed, timestamp }
→ local SQLite accumulation → SessionMeta.gpsTrack[]
→ post-processing: totalDistance, averageSpeed, durationSeconds
```

**Dependencies**

- Upstream: `inspection_begins`, `voice_camera_gps`
- Downstream: `walking_route_map`, `coverage_verification`, `site_map_view`

**Design Decisions**

- Background location services (iOS: significant-change + GPS, Android: foreground service)
- Adaptive recording interval: 1s when moving, 3s when stationary (battery optimization)
- Track stored as JSON array in SessionMeta — no separate table needed
- Douglas-Peucker simplification applied before sync to reduce payload size

---

#### 4.3.10 Geofencing & Auto-Detection

**Status:** 0% — Vision

**Description**

Auto-detect inspector arrival/departure at property GPS coordinates. Optional auto-start session on arrival, auto-pause on departure. Uses PropertyBoundary polygon if available, falls back to radius from Property.gps.

**How It Works**

Device monitors geofence regions for assigned properties. On entry, push notification prompts inspector to start inspection. On exit, session auto-pauses (configurable). Uses PropertyBoundary polygon for precise geofencing if available, otherwise a configurable radius (default 100m) from Property.gps coordinates.

**User Experience**

- Push notification: "You've arrived at [property]. Start inspection?"
- One-tap start from notification
- Optional auto-pause on departure (configurable per org)
- Geofence accuracy indicator in settings

**Data Flow**

```
Assignment → Property.gps / PropertyBoundary.polygon → device geofence region
→ entry event → push notification → inspector taps → session starts
→ exit event → auto-pause (if configured)
```

**Dependencies**

- Upstream: `setup_properties`, `property_boundaries`, `push_notification_service`
- Downstream: `gps_track_recording`

**Design Decisions**

- iOS: Core Location geofencing (max 20 regions monitored)
- Android: Geofencing API (max 100 regions)
- Fallback to radius-based when PropertyBoundary not defined
- Auto-start disabled by default — opt-in per org

---

#### 4.3.11 Session Narrative Generation

**Status:** 0% — Vision

**Description**

AI generates a cleaned-up prose summary of the entire inspection after AI processing. Organized by form section — coherent narrative, not field-by-field. Captures context and details that don't map to specific fields. Inspector can review and edit the narrative.

**How It Works**

After AI extraction completes, a second AI pass generates a prose narrative from the full transcript + extracted field values + photo captions. The narrative is organized by form section, creating a readable summary that preserves expert judgment and contextual details. Stored as SessionNarrative with section breakdown.

**User Experience**

- Auto-generated after AI extraction — no inspector action needed
- Appears in review screen as "Inspection Narrative" section
- Inspector can edit/refine the narrative before submission
- Narrative included in PDF report (if output template includes it)

**Data Flow**

```
Transcript + FormFieldValue[] + Photo.caption[]
→ LLM narrative generation → SessionNarrative { fullNarrative, sectionBreakdown }
→ inspector review → final narrative → PDF embed
```

**Entities:** SessionNarrative { callSessionId, fullNarrative, sectionBreakdown, wordCount, status }

**Dependencies**

- Upstream: `transcription`, `ai_extraction`
- Downstream: `branded_pdf`, `data_archive_browser`

**Design Decisions**

- Separate LLM call from extraction — narrative generation is a distinct task
- Section-organized prose — not bullet points or field lists
- Editable by inspector — AI draft, human final authority
- Word count tracked for template sizing

---

#### 4.3.12 Unmapped Notes Capture

**Status:** 0% — Vision

**Description**

Automatically detect and preserve transcript segments that didn't map to any form field. Inspector side-comments, observations, contextual details — nothing is lost. Also captures manual freeform notes entered in the app. Surfaced in review as "Additional Observations" section.

**How It Works**

During AI extraction, transcript segments that don't map to any FormField are flagged and saved as UnmappedNote records. Sources include: transcript overflow (speech that doesn't match any field), inspector freeform notes (entered manually in app), and AI-detected observations (context the AI identifies as important but unmappable).

**User Experience**

- Automatic: transcript overflow captured without inspector action
- Manual: "Add Note" button in app for freeform observations
- Review screen: "Additional Observations" section shows all unmapped notes
- Inspector can delete irrelevant notes or promote them to field values

**Data Flow**

```
Transcript segments → AI extraction → unmapped segments identified
→ UnmappedNote { content, source: "transcript_overflow", timestamp }
Manual note → UnmappedNote { content, source: "inspector_note" }
→ surfaced in review as "Additional Observations"
```

**Entities:** UnmappedNote { callSessionId, content, source, timestamp, transcriptRef }

**Dependencies**

- Upstream: `ai_extraction`, `form_field_values`
- Downstream: `data_archive_browser`, `multimodal_search`

**Design Decisions**

- Nothing lost: every transcript segment either maps to a field or becomes an UnmappedNote
- Three sources: transcript_overflow, inspector_note, ai_detected
- TranscriptRef links back to exact transcript segment for audit trail

---

### 4.4 Tier 4 — AI Processing

> **Transcription → Extraction → Scoring**
>
> The AI pipeline: audio becomes text, text becomes structured data, structured data gets validated and scored. Multi-pass extraction with confidence scoring determines what auto-accepts and what needs human review. This tier has 9 features.

---

#### 4.4.1 Transcription

**Status:** 60% — Building

**Description**

All audio transcribed to text. Real-time streaming via Deepgram for phone calls, batch processing via Whisper for synced recordings. On-device native STT available as a free fallback.

**How It Works**

All audio is transcribed to text. Real-time streaming for phone calls provides sub-second latency. Batch processing for uploaded recordings provides highest accuracy.

**User Experience**

- Invisible to inspector
- Real-time for phone calls (sub-second latency)
- Batch for uploaded recordings (highest accuracy)

**Data Flow**

```
AudioStream/File → transcription engine
→ Transcript { text, segments[], speakers[] }
→ fed to AI extraction + OCR resolver
```

**Dependencies**

- Upstream: `realtime_audio`, `local_sync`
- Downstream: `ai_extraction`, `ocr_narration_resolver`, `realtime_field_mapping`

**Design Decisions**

- Deepgram: Real-time streaming, $0.0043/min
- Whisper API: Batch, highest accuracy, $0.006/min
- On-device: iOS/Android native STT, free, variable quality
- Speaker diarization identifies who said what

---

#### 4.4.2 AI Field Extraction

**Status:** 50% — Building

**Description**

GPT-4o or Claude processes the full transcript + photo descriptions + form markdown guidance against the form schema. Multi-pass extraction with validation. The core AI feature that turns unstructured speech into structured form data.

**How It Works**

The LLM receives the full transcript, photo descriptions, form schema, and form markdown guidance. It performs multi-pass extraction: first pass extracts values, second pass validates, third pass resolves ambiguities. Fallback chain: GPT-4o → Claude → manual entry.

**User Experience**

- Invisible to inspector — results appear as pre-filled form
- Confidence scores shown as color indicators (green/yellow/red)
- Low-confidence fields highlighted for review

**Data Flow**

```
Input: { transcript, formSchema, photos, formGuidance }
→ LLM → output: FieldValue[] { fieldId, value, confidence: 0–1 }
→ stored as FormFieldValue
```

**Dependencies**

- Upstream: `transcription`, `ocr_narration_resolver`, `form_markdown_guidance` (context), `field_configuration` (key terms)
- Downstream: `photo_analysis` (multi-pass loop), `field_normalization`

**Design Decisions**

- Prompt: form schema + transcript + photo descriptions + guidance markdown
- Multi-pass: extract → validate → resolve ambiguities
- Fallback chain: GPT-4o → Claude → manual
- Per-form guidance documents dramatically improve extraction accuracy
- Post-extraction steps: session narrative generation (`session_narrative`, 4.3.11) and unmapped notes detection (`unmapped_notes`, 4.3.12) run after field extraction completes
- Transcript segments that don't map to any field are preserved as UnmappedNote records — nothing is lost

---

#### 4.4.3 Photo Analysis

**Status:** 15% — Early

**Description**

GPT-4o vision analyzes inspection photos: identifies defects, generates captions, auto-links to form fields. OCR text extraction from photos. Priority: narration > OCR when conflicts arise.

**How It Works**

GPT-4o vision analyzes inspection photos: identifies defects, generates captions, auto-links to relevant form fields. OCR text extraction reads any text visible in photos.

**User Experience**

- Photos auto-analyzed after upload
- AI-generated captions appear in the report
- Defects highlighted with severity ratings

**Data Flow**

```
Input: Photo[] { s3Key, context, annotations }
→ GPT-4o vision
→ output: { caption, defects[], linkedFieldIds[], severity, ocrText }
```

**Dependencies**

- Upstream: `sms_photos`, `photo_markup_tagging`
- Downstream: `ocr_narration_resolver`, `confidence_scoring`
- Loop: `ai_extraction` ↔ `photo_analysis` (multi-pass)

**Design Decisions**

- Defect identification (damaged siding, missing insulation, pest evidence)
- Auto-captioning for report inclusion
- OCR text passed to narration resolver for conflict detection

---

#### 4.4.4 OCR/Narration Resolver

**Status:** 0% — Vision

**Description**

Compares text extracted via photo OCR with transcript narration. When conflicts exist, the discrepancy is flagged. Narration is preferred by default — the inspector spoke intentionally.

**How It Works**

Compares text extracted via photo OCR with transcript narration. When conflicts exist, flags the discrepancy. Prefers narration by default.

**User Experience**

- Invisible — runs automatically
- Conflicts flagged as yellow indicators in review
- Inspector sees both values and chooses the correct one

**Data Flow**

```
Input: OCR text + transcript segments
→ compare → output: { resolvedValue, conflictFlag, preferredSource }
```

**Dependencies**

- Upstream: `photo_analysis` (OCR text), `transcription` (narration)
- Downstream: `ai_extraction`

**Design Decisions**

- Narration priority: inspector spoke intentionally, so narration is the default source of truth
- Conflicts surfaced but not auto-resolved — human decision required
- Configurable preference per org

---

#### 4.4.5 Real-time Field Mapping

**Status:** 15% — Early

**Description**

During active inspection, AI processes transcript chunks and updates form field values in near-real-time (~10 second refresh). Provides live preview of AI filling form fields.

**How It Works**

During active inspection, AI processes transcript chunks and updates form field values in near-real-time. The app shows a live preview of fields being populated.

**User Experience**

- Form fields fill in as inspector speaks
- Refresh button for manual update
- Visual feedback: field turns green when AI fills it

**Data Flow**

```
TranscriptChunk stream → partial extraction → FFV[] partial update
→ WebSocket push to app UI
```

**Dependencies**

- Upstream: `transcription`
- Downstream: `form_field_values` (live preview)

**Design Decisions**

- ~10 second refresh cadence
- Partial extraction — later passes may override earlier values
- Visual feedback motivates thorough narration

---

#### 4.4.6 Confidence Scoring

**Status:** 35% — Building

**Description**

Multi-pass validation scores each extracted field value on a 0–1 confidence scale. Includes normalization confidence as a factor.

**How It Works**

Multi-pass validation scores each extracted field value on a 0–1 confidence scale. Considers extraction certainty, normalization confidence, and cross-field consistency.

**User Experience**

- High confidence (≥0.9): green — auto-accepted
- Medium confidence (0.6–0.9): yellow — flagged for review
- Low confidence (<0.6): red — requires manual entry

**Data Flow**

```
Input: FieldValue[] { value, source, normalizationConfidence }
→ scoring algorithm
→ output: confidence 0–1 per field
```

**Dependencies**

- Upstream: `photo_analysis`
- Downstream: `quality_validation`

**Design Decisions**

- Thresholds: ≥0.9 auto-accept | 0.6–0.9 review | <0.6 manual
- Normalization confidence factors into overall score
- Thresholds configurable per org

---

#### 4.4.7 Quality Validation

**Status:** 20% — Early

**Description**

Self-improving quality validation system. Cross-field consistency checks, completeness validation, and a self-learning loop that improves per form type. After every session, the system analyzes how well the session went and how much correction was needed. This is not a one-time validation step — it is a self-learning system organized by form type.

**How It Works**

Automated checks for data quality: required fields present, cross-field consistency, format validation, duplicate detection. Also runs a self-improving feedback loop — after every session, the system analyzes extraction performance and correction levels per form type.

**User Experience**

- Validation errors shown as inline warnings
- Missing required fields highlighted
- Cross-field inconsistencies explained in plain language

**Data Flow**

```
Input: FFV[] + FieldConfig[] → validation rules
→ output: warnings[], errors[], pass/fail

Post-session: analyze corrections → update form-type-specific quality models
```

**Dependencies**

- Upstream: `confidence_scoring`
- Downstream: `form_field_values`

**Design Decisions**

- Required field completeness check
- Conditional logic validation (if field A = X, then field B is required)
- Self-improving loop: tracks correction rates per form type
- Gets smarter over time — learns what needs human review vs. what AI handles well

---

#### 4.4.8 FormFieldValues

**Status:** 50% — Building

**Description**

All extracted data persisted as `FormFieldValue` records in PostgreSQL. Full audit trail of every change, including source tracking (AI-extracted, manual entry, edited, photo-detected, normalized).

**How It Works**

All extracted data is persisted as `FormFieldValue` records in PostgreSQL. Every value includes a confidence score, source attribution, and edit timestamp for full audit trail.

**User Experience**

- Inspector sees pre-filled form with confidence indicators
- Can edit any field — source changes to "edited"
- Full audit trail visible to admins

**Data Flow**

```
FormFieldValue { id, callSessionId, formFieldId, value: JSON, confidence, source, editedAt }
Sources: ai_extracted, manual_entry, edited, photo_detected, normalized
```

**Dependencies**

- Upstream: `quality_validation`, `field_normalization`, `realtime_field_mapping`, `session_metadata_capture`
- Downstream: `inspector_submit`, `auto_complete_upload`

**Design Decisions**

- Value stored as JSON to handle all field types (text, numbers, arrays, objects)
- Full audit trail of changes with timestamps
- Source tracking enables AI learning feedback — corrections train better extraction

---

#### 4.4.9 Field Normalization

**Status:** 0% — Vision

**Description**

After AI extraction, resolve aliases and apply vocabulary packages. Converts shorthand and acronyms to canonical forms using the org's alias and vocabulary configuration.

**How It Works**

After AI extraction, raw values are passed through the normalization pipeline. Aliases and vocabulary packages convert shorthand/acronyms to canonical forms. Original values are preserved for audit.

**User Experience**

- Invisible — runs automatically
- Normalized values shown in review with original in tooltip
- Inspector can revert normalization if incorrect

**Data Flow**

```
Input: raw FieldValue[] + Alias[] + VocabularyPackage[]
→ normalize → canonical values + normalization confidence
```

**Dependencies**

- Upstream: `ai_extraction`, `vocabulary_aliases`
- Downstream: `form_field_values`

**Design Decisions**

- Runs after extraction, before scoring
- Original value preserved for audit trail
- Per-org vocabulary packages improve over time as aliases are added

---

### 4.5 Tier 5 — Completion & Review

> **Submit → Review → Approve**
>
> After AI processing, the inspector reviews the populated report, corrects flagged fields, and submits. Optional multi-level approval chain before delivery. This tier has 6 features.

---

#### 4.5.1 Inspector Submits

**Status:** 30% — Building

**Description**

Inspector reviews the AI-populated report with confidence indicators. Fields are sorted by confidence (lowest first) to focus review time. Slide-to-complete UX available for trusted inspectors.

**How It Works**

After AI processing, the inspector sees the populated report with confidence indicators. They review and correct flagged fields, then submit.

**User Experience**

- Confidence-sorted field list (lowest confidence first)
- Side-by-side: AI value vs. transcript excerpt
- Slide-to-complete for trusted inspector fast path

**Data Flow**

```
Inspector reviews FFV[] → edits low-confidence fields
→ submit → CallSession.status → SUBMITTED
```

**Dependencies**

- Upstream: `form_field_values`
- Downstream: `inspector_review`, `mobile_infield_review`

**Design Decisions**

- Confidence-guided review reduces review time by 60%+
- Slide-to-complete skips detailed review for trusted inspectors
- All edits tracked with source change to "edited"

---

#### 4.5.2 Inspector Review

**Status:** 40% — Building

**Description**

Detailed review of the AI report. Confidence scores guide review focus. For inspectors, this happens only in the mobile app — inspectors do not have dashboard access. Managers and admins can review from the dashboard.

**How It Works**

After submission, inspector or manager/admin does a detailed review. Can edit any field, add notes, and see confidence scores. Inspectors review from mobile app only. Managers/admins can review from dashboard or mobile.

**User Experience**

- Full report view with all fields and photos
- Edit any field
- Photo thumbnails linked to relevant fields
- Approval button

**Data Flow**

```
Display FFV[] with confidence flags → allow edits
→ FFV.source: edited → approve → CallSession.status: REVIEW_COMPLETE
```

**Dependencies**

- Upstream: `inspector_submit`
- Downstream: `multi_approval`

**Design Decisions**

- Inspector reviews from mobile app only (no dashboard access)
- Manager/admin reviews from dashboard or mobile
- Inspector is the final authority on field values — their edits override AI

---

#### 4.5.3 Mobile In-Field Review

**Status:** 5% — Vision

**Description**

Supervisor/manager reviews, edits, and approves inspection reports from the mobile app while still in the field. Same review UI as desktop, optimized for mobile.

**How It Works**

Supervisor/manager receives a push notification when an inspection is ready for review. They can review, edit, and approve from the mobile app without returning to the office.

**User Experience**

- Push notification: "New inspection ready for review"
- Full report view in app with edit capability
- Approve or request changes

**Data Flow**

```
Push notification → open report → review FFV[] → edit/approve → advance
```

**Dependencies**

- Upstream: `inspector_submit`
- Downstream: `multi_approval`

**Design Decisions**

- Same review UI as desktop, optimized for mobile
- Manager/Supervisor role required
- Offline review with sync on reconnect

---

#### 4.5.4 Auto-Complete & Upload

**Status:** 10% — Early

**Description**

Slide-to-complete gesture triggers instant upload. Optionally skips the review queue entirely for trusted inspectors with high historical accuracy.

**How It Works**

Slide-to-complete gesture at the bottom of the completed form triggers instant upload. If skip-review is enabled for the org, the inspection goes directly to delivery.

**User Experience**

- Slide gesture at bottom of completed form
- Instant upload begins
- If skip-review enabled: goes directly to delivery pipeline

**Data Flow**

```
Slide-to-complete → upload all FFV[] + media
→ if org.skipReview: true → bypass review → trigger delivery
```

**Dependencies**

- Upstream: `form_field_values`
- Downstream: `branded_pdf` (skip review path)

**Design Decisions**

- Skip-review is a per-org setting, admin-controlled
- Only for inspectors with >90% historical accuracy
- Audit trail maintained regardless of skip-review

---

#### 4.5.5 Multi-level Approval

**Status:** 10% — Early

**Description**

Multi-level approval workflow for enterprise compliance: Inspector → Manager/Supervisor → Admin → Client.

**How It Works**

Configurable approval chain for enterprise compliance. Each level sees what changed since the last approval. Rejection sends the inspection back with comments.

**User Experience**

- Each approver sees what changed since last approval
- Reject sends back with comments
- Approval timestamps for compliance audit trail

**Data Flow**

```
Approval { callSessionId, level, approverId, status, comments }
→ chain advances → final level triggers delivery
```

**Dependencies**

- Upstream: `inspector_review`, `mobile_infield_review`
- Downstream: `final_signoff`

**Design Decisions**

- Configurable approval chain per org (can be 1 level or 4 levels)
- Reject sends back with comments
- Approval timestamps for compliance audit trail

---

#### 4.5.6 Final Sign-off

**Status:** 10% — Early

**Description**

Last approval triggers the delivery pipeline. `CallSession` status moves to APPROVED, and SQS jobs are enqueued for all delivery targets in parallel.

**How It Works**

The last approval triggers delivery. `CallSession.status` → APPROVED. SQS jobs are enqueued for PDF generation, email delivery, webhook events, and portal updates — all in parallel.

**User Experience**

- Final approver clicks "Sign Off"
- Confirmation with summary of the inspection
- Status changes to APPROVED

**Data Flow**

```
Approval → CallSession.status: APPROVED
→ SQS jobs: PDF generation, email delivery, webhook events, portal update
```

**Dependencies**

- Upstream: `multi_approval`
- Downstream: `branded_pdf`, `pdf_autofill`, `email_ses`, `dashboard`, `client_portal`, `output_template_manager`, `external_system_export`, `data_flow_configuration`

**Design Decisions**

- Triggers all delivery jobs in parallel via SQS
- Final sign-off is the gate between processing and delivery — nothing leaves the system without it

---

### 4.6 Tier 6 — Delivery & Output

> **Reports · Email · Portal**
>
> Inspection data exits the system: branded PDF reports, email delivery, client portal access, external system exports. Geo visualizations, GIS exports, data archive browsing, and compliance output packs extend delivery capabilities. Multiple output formats configured per form. This tier has 13 features.

---

#### 4.6.1 Branded PDF Report

**Status:** 15% — Early

**Description**

Professional branded PDF report compiled from structured data + photos + org branding. Auto-generated after final sign-off.

**How It Works**

Structured data (`FormFieldValue[]`) + photos + org branding compiled into a professional PDF report. Template per form type, branded per org.

**User Experience**

- Auto-generated after final sign-off
- Admin can customize template (logo, colors, layout)
- Photos embedded with AI-generated captions

**Data Flow**

```
Input: FFV[] + Photo[] + OutputTemplate → PDF engine → branded PDF → S3 → delivery
```

**Dependencies**

- Upstream: `final_signoff`, `auto_complete_upload` (skip review path), `output_template_manager`
- Downstream: `pdf_autofill` (bidirectional)

**Design Decisions**

- PDF generation via Puppeteer or react-pdf
- Template per form type, branded per org
- Photos embedded inline with AI captions and annotations
- Walking route map embedded as static map image (from Mapbox Static Images API) — see `walking_route_map` (4.6.9)
- Photo map embed: property map with photo pins showing capture locations
- Session narrative section: AI-generated prose summary included when available — see `session_narrative` (4.3.11)

---

#### 4.6.2 PDF Autofill

**Status:** 10% — Early

**Description**

AI maps extracted `FormFieldValue` records to fields in existing PDF forms — government compliance documents, client templates, insurance forms.

**How It Works**

AI maps extracted `FormFieldValue` records to fields in existing PDF forms. Upload a target PDF template once, AI learns the field mapping, and filled PDFs are generated alongside branded reports.

**User Experience**

- Upload target PDF template once
- AI learns field mapping (human verification on first use)
- Filled PDFs generated alongside branded reports

**Data Flow**

```
Input: FFV[] + target PDF template → AI field mapping → pdf-lib → filled PDF
```

**Dependencies**

- Upstream: `final_signoff`
- Downstream: Bidirectional with `branded_pdf`

**Design Decisions**

- Saves hours of manual data entry for compliance forms
- AI mapping with human verification on first use
- pdf-lib for programmatic PDF field filling

---

#### 4.6.3 Output Template Manager

**Status:** 0% — Vision

**Description**

Manage PDF report templates. WYSIWYG editor for brand assets, field placement, and layout. Standard PAX template as default, custom templates for enterprise branding.

**How It Works**

WYSIWYG template editor for admins. Upload logo, set brand colors, choose fonts, drag form fields onto layout. Preview with sample data.

**User Experience**

- WYSIWYG template editor
- Upload logo, set colors, choose fonts
- Drag form fields onto layout
- Preview with sample data

**Data Flow**

```
OutputTemplate { orgId, layout, brandAssets, fieldPlacements[] } → used by PDF generation
```

**Dependencies**

- Upstream: `final_signoff`
- Downstream: `branded_pdf`

**Design Decisions**

- Standard PAX template as default for all orgs
- Custom templates for enterprise branding
- Per-form template selection

---

#### 4.6.4 External System Export

**Status:** 0% — Vision

**Description**

Export inspection data to external systems in JSON, CSV, or webhook format. Delivery status tracking with automatic retry.

**How It Works**

Export inspection data to external systems with delivery status tracking. Supports multiple formats and transformation rules per export target.

**User Experience**

- One-click CSV/JSON export from dashboard
- Auto-delivery via webhooks after sign-off
- Delivery status visible with retry option

**Data Flow**

```
ExportJob { sessionId, targetSystem, format, status }
→ transform → deliver → track → retry on failure
```

**Dependencies**

- Upstream: `final_signoff`, `data_flow_configuration`, `output_configuration`
- Downstream: None

**Design Decisions**

- Multiple format support (JSON, CSV, webhook)
- Delivery status tracking with automatic retry
- Field mapping per export target

---

#### 4.6.5 Data Flow Configuration

**Status:** 0% — Vision

**Description**

Visual drag-and-drop interface for admins to map form fields to output targets. Supports transformations and conditional routing.

**How It Works**

Visual drag-and-drop interface for admins to map form fields to output targets. Add transformations (date formatting, unit conversion), conditional routing, and test with sample data.

**User Experience**

- Visual flow editor
- Add transformations between source and target
- Conditional routing based on field values
- Test with sample data

**Data Flow**

```
DataFlowMap { formId, fieldId, outputTarget, transformation }
→ executed at delivery time
```

**Dependencies**

- Upstream: `final_signoff`
- Downstream: `external_system_export`

**Design Decisions**

- Visual editor for non-technical admins
- Transformation pipeline (format dates, convert units, map enums)
- Conditional routing (if field X = Y, send to system Z)

---

#### 4.6.6 Email (SES)

**Status:** 15% — Early

**Description**

Reports delivered via SES with branded email templates and PDF attachment. Automatic delivery after sign-off to client contacts.

**How It Works**

After sign-off, branded email with inline summary and PDF attachment is sent to client contacts via AWS SES.

**User Experience**

- Automatic delivery after sign-off
- Branded email with inline summary
- PDF attached
- Delivery confirmation tracked

**Data Flow**

```
SQS job → load Org.emailTemplate → attach PDF
→ SES send to Person[] { type: CLIENT } → status tracked
```

**Dependencies**

- Upstream: `final_signoff`
- Downstream: None

**Design Decisions**

- AWS SES for reliable delivery and deliverability tracking
- Branded HTML template per org
- Delivery status tracked per recipient

---

#### 4.6.7 Dashboard

**Status:** 100% — Shipped

**Description**

Admin/manager-only web dashboard built with Next.js. Three core functions: (1) Report browser — inspection visibility and management, (2) CRM management — client and property data via Setup Properties, (3) Form routing — manage where forms go and assignment tracking. Inspectors do not have dashboard access. Inspectors manage their work exclusively through the mobile app.

**How It Works**

Next.js web dashboard for admin and manager roles only. Real-time inspection visibility, CRM management, form routing and assignment, integration status, and AI learning feedback. Inspectors access their own data (forms, reports, media, preferences) through the mobile app only.

**User Experience**

- Real-time inspection list with status filters
- Search by date, inspector, property, status
- Bulk actions: approve, export, reassign
- CRM: manage clients and properties
- Form routing: assign forms to inspectors, configure schedules

**Data Flow**

```
WebSocket → real-time CallSession[] updates → dashboard renders
Search queries via API
CRM operations via Property/Person APIs
```

**Dependencies**

- Upstream: `final_signoff`
- Downstream: `predictive_analytics`, `insights_dashboard`, `ai_learning_pipeline`

**Design Decisions**

- Admin + Manager access only — inspectors use mobile app exclusively
- Real-time updates via WebSocket
- Three pillars: reports, CRM, form routing
- Analytics: completion rates, turnaround times, AI accuracy metrics
- Extended capabilities: data archive browser (4.6.12), site map view (4.6.10), multi-modal search (4.7.8) are dashboard-integrated features

---

#### 4.6.8 Client Portal / API

**Status:** 0% — Vision

**Description**

White-labeled read-only portal for clients to view their inspections. Separate auth context. Webhook/API for integrations. Major differentiator vs. competitors.

**How It Works**

White-labeled portal branded to the org. Clients log in with their own credentials, see inspections for their properties, download PDF reports, and submit comments or re-inspection requests.

**User Experience**

- Client logs in to branded portal
- Sees inspections for their properties
- Downloads PDF reports
- Submits comments and re-inspection requests

**Data Flow**

```
Client auth → Person { type: CLIENT } → filtered CallSession[] view → PDF download
Webhooks: inspection.completed event
```

**Dependencies**

- Upstream: `final_signoff`
- Downstream: `feedback_loop`

**Design Decisions**

- Major differentiator vs. competitors — drives retention through platform stickiness
- Separate auth context from main system
- Webhook delivery status tracking
- White-label branding per org

---

#### 4.6.9 Walking Route Map

**Status:** 0% — Vision

**Description**

Strava-style visualization of the inspector's GPS track overlaid on satellite/street map. Photo pins along the route showing where each photo was taken. Time-stamped breadcrumbs with speed/pace data. Embedded in PDF reports and viewable in dashboard/portal.

**How It Works**

SessionMeta.gpsTrack rendered as a polyline on Mapbox GL JS. Photo GPS coordinates plotted as clickable pins along the route. Timestamps shown as breadcrumb labels. Speed data visualized as color gradient on the track line (slow = blue, fast = red). Exportable as a static map image for PDF embedding.

**User Experience**

- Interactive map: pan, zoom, click photo pins for previews
- Track color indicates speed/pace
- Time labels along the route
- Embedded as static image in PDF reports
- Toggle satellite vs. street view

**Data Flow**

```
SessionMeta.gpsTrack[] + Photo[] { gpsLat, gpsLng, capturedAt }
→ Mapbox GL JS rendering → interactive web map
→ static map export → PDF embed
```

**Dependencies**

- Upstream: `gps_track_recording`, `branded_pdf`
- Downstream: `site_map_view`, `data_archive_browser`

**Design Decisions**

- Mapbox GL JS for web, react-native-maps for mobile
- Static map export via Mapbox Static Images API for PDF embedding
- Track simplification (Douglas-Peucker) for performance on long inspections

---

#### 4.6.10 Site Map View

**Status:** 0% — Vision

**Description**

Property-level interactive map in the dashboard showing inspection coverage area, photo locations pinned on map with thumbnails, defect/issue heatmap overlay, and historical inspection overlays for comparing visits over time.

**How It Works**

Dashboard page for each property aggregates GPS tracks and photo locations from all inspections. Coverage area computed from GPS track convex hull. Defect heatmap generated from FormFieldValue entries flagged as issues. Historical overlays allow toggling between inspection visits.

**User Experience**

- Property page → "Site Map" tab
- Inspection coverage area (GPS track polygon) highlighted on map
- Photo locations pinned with thumbnails — click → full photo + caption + annotations
- Defect/issue heatmap overlay (toggle on/off)
- Historical inspection overlays — compare visits over time
- Click photo pin → see photo + annotations + AI caption + field values

**Data Flow**

```
Property → CallSession[] → SessionMeta.gpsTrack[] + Photo[]
→ aggregated map layers → Mapbox GL JS rendering
→ heatmap from FormFieldValue[] (issue-flagged)
```

**Dependencies**

- Upstream: `gps_track_recording`, `property_boundaries`, `dashboard`
- Downstream: `temporal_comparison`, `digital_site_docs`

**Design Decisions**

- Mapbox GL JS with multiple toggleable layers
- Heatmap intensity based on defect severity scoring
- Historical overlays limited to last 10 inspections for performance

---

#### 4.6.11 GIS Export

**Status:** 0% — Vision

**Description**

Export inspection geo data for GIS software (ArcGIS, QGIS, Google Earth). Formats: GeoJSON, Shapefile (.shp/.dbf/.prj), KML, GPX. Each photo exported as a point feature with lat/lng, caption, defect severity, form field values, and S3 URL. GPS tracks exported as LineString with timestamps. Batch export across multiple inspections for spatial analysis.

**How It Works**

GeoExportJob created with desired format. Lambda worker converts inspection data to requested GIS format using GDAL/ogr2ogr for Shapefile/KML conversion and native JSON for GeoJSON. Photos become Point features, GPS tracks become LineString features, property boundaries become Polygon features. Output uploaded to S3 with presigned download URL.

**User Experience**

- Dashboard: "Export" dropdown → select GIS format
- Options: include photos, include track, include boundary
- Single inspection or batch export (multiple inspections)
- Download link emailed when ready (async for large exports)

**Data Flow**

```
GeoExportJob { format, includePhotos, includeTrack }
→ SQS → Lambda worker → GDAL/ogr2ogr conversion
→ S3 upload → presigned URL → email notification
```

**Entities:** GeoExportJob { callSessionId?, orgId, format, includePhotos, includeTrack, s3Key, status }

**Dependencies**

- Upstream: `gps_track_recording`, `photo_analysis`, `external_system_export`
- Downstream: None

**Design Decisions**

- GDAL/ogr2ogr in Lambda for Shapefile/KML conversion (Docker layer)
- GeoJSON generated natively — no GDAL dependency
- Batch exports run as background jobs with email notification on completion
- Each photo is a GeoJSON Feature with properties: caption, severity, fieldValues, photoUrl

---

#### 4.6.12 Data Archive Browser

**Status:** 0% — Vision

**Description**

Dashboard feature to browse ALL data layers per inspection. Layers: (1) Raw audio playback, (2) Raw transcript with timestamps, (3) Session narrative, (4) Normalized field values with confidence scores, (5) Unmapped notes, (6) Photos on map, (7) GPS track visualization. Side-by-side comparison of transcript segment ↔ extracted field value ↔ photo. Audio scrubbing synced to transcript highlights. Admin/manager only.

**How It Works**

Single-page dashboard view with tabbed/layered data panels. Audio player with waveform visualization synced to transcript highlights — clicking a transcript segment seeks the audio. Field values linked back to their source transcript segments and photos. Map panel shows GPS track + photo pins.

**User Experience**

- Select inspection → "Data Archive" view
- Tabs/panels for each data layer
- Audio scrubbing synced to transcript highlights
- Click field value → see source transcript segment + confidence
- Side-by-side: transcript ↔ field value ↔ photo
- Admin/manager only (inspectors see their data in mobile app)

**Data Flow**

```
CallSession → all related data layers loaded in parallel:
  AudioRecording (S3 stream), Transcript, SessionNarrative,
  FormFieldValue[], UnmappedNote[], Photo[], SessionMeta.gpsTrack
→ synchronized dashboard rendering
```

**Dependencies**

- Upstream: `dashboard`, `session_narrative`, `unmapped_notes`, `walking_route_map`
- Downstream: `digital_site_docs`

**Design Decisions**

- Lazy-load data layers — don't fetch audio until the audio tab is opened
- Transcript-to-audio sync via segment timestamps
- Field-value-to-transcript linking via FormFieldValue.transcriptRef (if available)

---

#### 4.6.13 Compliance Output Packs

**Status:** 0% — Vision

**Description**

Vertical-specific output templates matching regulatory formats. EPA Phase 1 ESA format, OSHA audit format, DOT inspection format, etc. Auto-maps form fields to compliance document sections. Includes required certifications, disclaimers, and regulatory references.

**How It Works**

Compliance packs are specialized OutputTemplate records with regulatory-specific section layouts, required fields, disclaimers, and certification blocks. The system auto-maps FormFieldValue entries to compliance document sections based on field metadata. Missing required fields are flagged before export.

**User Experience**

- Admin selects compliance pack when configuring form output
- Preview shows regulatory format with mapped fields
- Missing required fields flagged with warnings
- Generated output includes all required certifications and disclaimers
- Formats: EPA Phase 1 ESA, OSHA audit, DOT inspection, utility inspection

**Data Flow**

```
VerticalConfig.outputTemplates → compliance OutputTemplate
→ FormFieldValue[] auto-mapped to regulatory sections
→ PDF generation with compliance formatting
```

**Dependencies**

- Upstream: `vertical_config`, `branded_pdf`, `output_template_manager`
- Downstream: None

**Design Decisions**

- Compliance packs are curated by PAX — not user-editable (regulatory accuracy)
- Version-controlled with regulatory update tracking
- Missing-field validation prevents incomplete compliance submissions

---

### 4.7 Tier 7 — Intelligence

> **Analytics & Feedback**
>
> The learning loop: historical data drives predictions, inspector corrections improve AI, client feedback triggers re-inspections. Geo intelligence, temporal analysis, multi-modal search, and digital site documentation round out the platform. This tier has 13 features.

---

#### 4.7.1 Predictive Analytics

**Status:** 0% — Vision

**Description**

AI analyzes historical inspection data to predict maintenance needs, compliance risks, and cost estimates per property.

**How It Works**

ML pipeline analyzes historical inspection data across all sessions. Generates risk scores per property, predicts maintenance timelines, and estimates costs.

**User Experience**

- Risk scores per property on dashboard
- Predicted maintenance timelines
- Cost estimates for upcoming work

**Data Flow**

```
Historical CallSession[] + FFV[] → ML pipeline
→ RiskScore { propertyId, score, factors[] } → dashboard
```

**Dependencies**

- Upstream: `dashboard`
- Downstream: `insights_dashboard`
- Loop: `ai_learning_pipeline` → `predictive_analytics` (improved models)

**Design Decisions**

- Requires significant data volume before becoming useful
- Major differentiator at scale
- ML models improve with inspector corrections over time

---

#### 4.7.2 Insights Dashboard

**Status:** 0% — Vision

**Description**

Dashboard for trends, risk scoring, and maintenance predictions. Built on top of the main dashboard infrastructure. Admin/manager view with inspector metrics available via mobile app.

**How It Works**

Analytics dashboard showing trends, risk scores, and maintenance predictions. Charts, heatmaps, and performance metrics.

**User Experience**

- Charts: defect frequency over time
- Heatmaps: issues by property/region
- Inspector performance metrics
- Seasonal trends

**Data Flow**

```
Aggregated FFV[] + RiskScore[] → analytics engine → charts → dashboard
```

**Dependencies**

- Upstream: `predictive_analytics`, `dashboard`
- Downstream: None

**Design Decisions**

- Built on dashboard infrastructure
- Export to CSV/PDF
- Role-based: admins see all metrics, inspectors see only their own metrics via mobile app

---

#### 4.7.3 AI Learning Pipeline

**Status:** 0% — Vision

**Description**

Captures every inspector correction (AI value → corrected value) and feeds back to improve extraction and captioning. Per-org learning ensures domain-specific improvement.

**How It Works**

Captures every inspector correction — the AI value and the corrected value — and feeds this data back into the extraction pipeline. Per-org learning ensures domain-specific improvement over time.

**User Experience**

- Invisible to inspector — corrections are auto-captured
- Admin sees AI accuracy metrics on dashboard
- Accuracy improves per org over time

**Data Flow**

```
InspectorCorrection { sessionId, fieldId, aiValue, correctedValue }
→ training data → improved prompts → better extraction
```

**Dependencies**

- Upstream: `dashboard`, `feedback_loop`
- Downstream: `predictive_analytics` (improved models), `ai_extraction` (improved prompts)

**Design Decisions**

- Per-org learning for domain-specific improvement
- Corrections feed into prompt engineering initially (not fine-tuning)
- Accuracy metrics tracked per form type
- Long-term: fine-tuned models per industry vertical

---

#### 4.7.4 Push Notifications

**Status:** 5% — Vision

**Description**

Push notifications for key events: assignment alerts, review requests, completion confirmations. Expo push notification service integration.

**How It Works**

Push notifications for key events. Uses Expo push notification service for cross-platform delivery.

**User Experience**

- Instant notification on new assignment
- Review requests for supervisors/managers
- Completion confirmation after delivery
- Configurable preferences per user

**Data Flow**

```
Event trigger → lookup PushToken { userId, deviceToken, platform }
→ Expo Push API → device notification
```

**Dependencies**

- Upstream: Various triggers (assignment, review, completion)
- Downstream: `admin_assigns` (push alerts)

**Design Decisions**

- Expo Push for cross-platform (iOS + Android)
- User-configurable preferences
- Batched delivery to prevent notification fatigue

---

#### 4.7.5 Feedback & Re-inspection

**Status:** 0% — Vision (TBD)

**Description**

Client comments on inspections, re-inspection requests. **This feature still needs design — do not finalize this spec.** The conceptual model exists but implementation details are TBD.

**How It Works**

TBD — needs design. Conceptually: clients comment on inspections and request re-inspections. Re-inspection requests create new assignments linked to the original. Corrections captured for AI retraining.

**User Experience**

TBD

**Data Flow**

```
Comment { callSessionId, text } → notification
Re-inspect → Assignment { originalCallSessionId } → new inspection cycle
```

**Dependencies**

- Upstream: `client_portal`
- Downstream: `ai_learning_pipeline`, `admin_assigns` (feedback loop)

**Design Decisions**

TBD — needs further design work before implementation.

---

#### 4.7.6 Temporal Comparison

**Status:** 0% — Vision

**Description**

Compare the same property across inspections over time. Side-by-side photo comparison of the same location from different visits, field value trend charts, and condition trajectory analysis (improving/stable/declining per property).

**How It Works**

System matches photos by GPS proximity across visits, aligns field values by field ID, and computes condition trajectories. Dashboard visualizations show trends over time with interactive drill-down.

**User Experience**

- Select a property → see timeline of all inspections
- Photo diff: side-by-side photos of same location from different visits
- Field value trends: track condition changes over time (charts)
- Condition trajectory: improving/stable/declining per property

**Data Flow**

```
Property → CallSession[] (historical) → matched by GPS proximity + field ID
→ trend computation → dashboard visualization
```

**Dependencies**

- Upstream: `dashboard`, `predictive_analytics`, `property_boundaries`
- Downstream: `digital_site_docs`

**Design Decisions**

- GPS proximity matching for cross-visit photo pairing (configurable radius)
- Trend computation runs nightly as a batch job
- Condition trajectories use simple linear regression over field values

---

#### 4.7.7 Coverage Verification

**Status:** 0% — Vision

**Description**

GPS track vs. property boundary → coverage percentage. Proves the inspector walked the entire property (or flags missed areas). Heatmap visualization of areas visited vs. not visited. Required for compliance verticals (environmental, insurance).

**How It Works**

PropertyBoundary polygon is compared against the GPS track LineString. PostGIS `ST_Intersection` and `ST_Area` calculate the percentage of the boundary covered by the track (with a configurable buffer). Missed areas are highlighted on the map.

**User Experience**

- Coverage % displayed on completed inspection card
- Heatmap: areas visited (green) vs. not visited (red)
- Alert if coverage falls below configurable threshold
- Admin sets minimum coverage % per form type

**Data Flow**

```
SessionMeta.gpsTrack + PropertyBoundary.polygon
→ PostGIS spatial analysis → coveragePercent
→ SessionMeta.coveragePercent updated
```

**Dependencies**

- Upstream: `gps_track_recording`, `property_boundaries`
- Downstream: `compliance_packs`, `time_analytics`

**Design Decisions**

- PostGIS for spatial computation — no client-side polygon math for accuracy
- Configurable buffer around GPS track (default 5m) to account for GPS drift
- Coverage threshold configurable per form type (e.g., environmental = 90%, general = 50%)

---

#### 4.7.8 Multi-Modal Search

**Status:** 0% — Vision

**Description**

Search across ALL data types: transcripts, photo captions, field values, notes, and narratives. "Find all inspections mentioning 'water damage'" searches transcript + captions + fields + notes simultaneously.

**How It Works**

Full-text search via PostgreSQL `tsvector` indexes across Transcript.text, Photo.caption, FormFieldValue.value, UnmappedNote.content, and SessionNarrative.fullNarrative. Results ranked by relevance with source type indicators. Filter by date range, property, inspector, vertical, form type.

**User Experience**

- Single search bar in dashboard header
- Results grouped by inspection with source type badges (transcript, photo, field, note)
- Filter panel: date range, property, inspector, form type
- Click result → jump to inspection detail with match highlighted

**Data Flow**

```
Search query → PostgreSQL full-text search across 5 tables
→ ranked results with source indicators → dashboard render
```

**Dependencies**

- Upstream: `dashboard`, `form_field_values`, `session_narrative`, `unmapped_notes`
- Downstream: None

**Design Decisions**

- PostgreSQL tsvector initially — migrate to Elasticsearch if scale demands it
- Unified search index updated on inspection completion
- Search across orgs is forbidden — always scoped by orgId

---

#### 4.7.9 Time & Efficiency Analytics

**Status:** 0% — Vision

**Description**

Inspector productivity analytics: time-per-field, time-on-site, route efficiency, and aggregate trends. Non-punitive — designed for operational optimization, not surveillance.

**How It Works**

GPS track timestamps determine time-on-site. Field capture timestamps (from FormFieldValue.createdAt and transcript segment timestamps) calculate time-per-field. Route efficiency compares distance walked vs. property area. Aggregate trends computed nightly.

**User Experience**

- Dashboard widget: avg inspection time by form type
- Drill-down: time-per-field heatmap (which fields take longest)
- Route efficiency: distance walked vs. property size
- Trend charts: inspection times over weeks/months

**Data Flow**

```
SessionMeta { gpsTrack, durationSeconds, totalDistance }
+ FormFieldValue timestamps + PropertyBoundary.areaMeters
→ analytics computation → InsightsMetric records
```

**Dependencies**

- Upstream: `gps_track_recording`, `session_metadata_capture`, `insights_dashboard`
- Downstream: None

**Design Decisions**

- Non-punitive framing: "optimization" not "surveillance"
- Aggregate-first: team averages shown before individual metrics
- Outlier detection flags unusually fast inspections (possible quality concern)

---

#### 4.7.10 Weather Correlation

**Status:** 0% — Vision

**Description**

Auto-correlate inspection findings with weather conditions at time of inspection. Identify patterns like "90% of moisture issues found when humidity > 80%." Seasonal trend analysis with weather overlay.

**How It Works**

WeatherSnapshot data joined with FormFieldValue data to identify statistical correlations. Nightly batch analysis groups findings by weather conditions and identifies significant patterns. Seasonal overlays compare inspection results across weather periods.

**User Experience**

- Insights dashboard card: "Weather Impact Patterns"
- Pattern alerts: "Moisture issues are 3x more likely when humidity exceeds 80%"
- Seasonal trend chart with weather overlay
- Helps predict when issues are most likely to be found

**Data Flow**

```
WeatherSnapshot + FormFieldValue[] + RiskScore
→ correlation analysis → pattern detection → insight cards
```

**Dependencies**

- Upstream: `session_metadata_capture`, `predictive_analytics`
- Downstream: None

**Design Decisions**

- Minimum sample size (50+ inspections) before surfacing correlations
- Significance threshold to avoid spurious patterns
- Weather data sourced from OpenWeatherMap at inspection time

---

#### 4.7.11 Photo Timeline & Map View

**Status:** 0% — Vision

**Description**

Browse inspection photos chronologically AND spatially. Timeline scrub through photos in capture order with timestamps. Map view with pins on satellite imagery — click to see photo + caption + annotations.

**How It Works**

Photos ordered by capturedAt timestamp for timeline view. GPS coordinates (gpsLat, gpsLng) plotted on Mapbox GL JS map for spatial view. Click interaction shows photo preview with caption, annotations, and linked form fields.

**User Experience**

- Toggle between timeline and map view
- Timeline: scrub through photos in capture order with timestamps
- Map: pins on satellite view, click → photo + caption + annotations
- Filter: by form section, defect severity, confidence level
- Swipe between photos on mobile

**Data Flow**

```
Photo[] { gpsLat, gpsLng, capturedAt, caption }
→ timeline rendering (by capturedAt) + map rendering (by GPS)
→ click → photo detail overlay
```

**Dependencies**

- Upstream: `gps_track_recording`, `photo_analysis`, `dashboard`
- Downstream: `digital_site_docs`

**Design Decisions**

- Mapbox GL JS for web, react-native-maps for mobile
- Lazy-load photo thumbnails for map pins (S3 presigned URLs)
- Filter state persists across timeline/map toggle

---

#### 4.7.12 Digital Site Documentation

**Status:** 0% — Vision

**Description**

Living property record that grows with each inspection visit. All photos, field values, narratives, GPS tracks accumulated per property. Compare any two visits side-by-side. Export full property history as PDF or data package. Foundation for "digital twin" of physical sites.

**How It Works**

Property-level aggregation of all CallSession data. Timeline view shows every inspection with expandable details. Comparison mode allows selecting any two visits for side-by-side diff. Export generates a comprehensive PDF or ZIP data package with all historical data.

**User Experience**

- Property page → "Site Documentation" tab
- Timeline of all inspections with photos, narratives, field values
- Compare any two visits side-by-side
- Export full property history as PDF or ZIP data package
- Search within a single property's history

**Data Flow**

```
Property → CallSession[] (all historical)
→ aggregated view with all data layers per session
→ comparison engine → side-by-side diff
→ export engine → PDF or ZIP
```

**Dependencies**

- Upstream: `temporal_comparison`, `site_map_view`, `data_archive_browser`
- Downstream: None

**Design Decisions**

- Data never deleted — append-only property history
- Export includes all raw data (photos, audio, transcripts) on request
- Future foundation for "digital twin" capabilities

---

#### 4.7.13 Offline Map Tiles

**Status:** 0% — Vision

**Description**

Cache satellite/street map tiles for areas with poor connectivity. Inspector can see property map + previous inspection data while offline. Auto-download tiles when assignment received (WiFi only).

**How It Works**

When an assignment is received, the app pre-downloads Mapbox map tiles for the property area (bounding box + buffer). Tiles cached in device storage. Previous inspection GPS tracks and photo locations available offline. Download only occurs on WiFi to avoid data charges.

**User Experience**

- Automatic: tiles download when assignment received (WiFi only)
- Map available offline during inspection
- Previous inspection overlay visible offline
- Storage management: clear old tiles when space is low

**Data Flow**

```
Assignment received → property GPS → bounding box calculation
→ Mapbox Offline API → tile download (WiFi only) → device cache
→ offline map rendering during inspection
```

**Dependencies**

- Upstream: `local_sync`, `gps_track_recording`
- Downstream: None

**Design Decisions**

- Mapbox Offline API for tile caching
- WiFi-only download to avoid inspector data charges
- Tile retention: 30 days, then auto-purge
- Configurable: admin can disable offline maps to save device storage

---

## 5. Infrastructure

### AWS Architecture

```
                            ┌─────────────────────────────┐
                            │        AWS Cloud            │
                            │                             │
  ┌──────────┐              │  ┌────────────────────┐     │
  │  Expo    │──────────────┼─▶│   App Runner       │     │
  │  Mobile  │   REST/WS    │  │   (Hono API)       │     │
  │  App     │              │  │                    │     │
  └──────────┘              │  │  ┌──────────────┐  │     │
                            │  │  │   Prisma     │  │     │
  ┌──────────┐              │  │  │   ↕          │  │     │
  │  Next.js │──────────────┼─▶│  │  PostgreSQL  │  │     │
  │  Admin   │   REST/WS    │  │  └──────────────┘  │     │
  │Dashboard │              │  └────────┬───────────┘     │
  └──────────┘              │           │                 │
                            │           ▼                 │
                            │  ┌────────────────────┐     │
                            │  │   SQS Queues       │     │
                            │  │   • pdf-generation  │     │
                            │  │   • email-delivery  │     │
                            │  │   • export-jobs     │     │
                            │  │   • ai-processing   │     │
                            │  └────────┬───────────┘     │
                            │           │                 │
                            │           ▼                 │
                            │  ┌────────────────────┐     │
                            │  │   Lambda Workers    │     │
                            │  │   • PDF generator   │     │
                            │  │   • Email sender    │     │
                            │  │   • Export worker   │     │
                            │  │   • AI pipeline     │     │
                            │  └────────────────────┘     │
                            │                             │
                            │  ┌────────────────────┐     │
                            │  │   S3 Buckets        │     │
                            │  │   • media (photos)  │     │
                            │  │   • audio           │     │
                            │  │   • pdfs             │     │
                            │  │   • exports          │     │
                            │  └────────────────────┘     │
                            │                             │
                            │  ┌────────────────────┐     │
                            │  │   Cognito           │     │
                            │  │   • User pools      │     │
                            │  │   • JWT issuance     │     │
                            │  │   • MFA (optional)   │     │
                            │  └────────────────────┘     │
                            │                             │
                            │  ┌────────────────────┐     │
                            │  │   Secrets Manager   │     │
                            │  │   • API keys         │     │
                            │  │   • Stripe secrets   │     │
                            │  │   • Twilio creds     │     │
                            │  └────────────────────┘     │
                            │                             │
                            │  ┌────────────────────┐     │
                            │  │   ECR               │     │
                            │  │   • API container    │     │
                            │  └────────────────────┘     │
                            └─────────────────────────────┘

  ┌────────────────────────────────────────────────────────┐
  │                External Services                       │
  │                                                        │
  │  ┌──────────┐  ┌──────────┐  ┌───────────────────┐    │
  │  │  Twilio  │  │  Stripe  │  │ OpenAI / Anthropic│    │
  │  │  Voice   │  │  Billing │  │ GPT-4o / Claude   │    │
  │  │  SMS/MMS │  │  Portal  │  │ Whisper           │    │
  │  └──────────┘  └──────────┘  └───────────────────┘    │
  │                                                        │
  │  ┌──────────┐  ┌──────────┐  ┌───────────────────┐    │
  │  │ Deepgram │  │  AWS SES │  │  Google Places    │    │
  │  │ RT STT   │  │  Email   │  │  Address + GPS    │    │
  │  └──────────┘  └──────────┘  └───────────────────┘    │
  │                                                        │
  │  ┌──────────┐  ┌──────────┐  ┌───────────────────┐    │
  │  │  Mapbox  │  │  PostGIS │  │  GDAL/ogr2ogr     │    │
  │  │  Maps    │  │  Spatial │  │  GIS conversion   │    │
  │  └──────────┘  └──────────┘  └───────────────────┘    │
  └────────────────────────────────────────────────────────┘
```

### Infrastructure Groups

| Group | Components |
|-------|-----------|
| Core Entities | Organization, User, Membership, Person, UserPreference |
| Form System | Form, FormField, FormTemplate, FormVersion, FormGuidance, FieldConfig |
| Inspection Entities | CallSession, FormFieldValue, Assignment, Photo, Transcript, InspectionMode (enum), TicketSource, PhotoAnnotation |
| AWS Infrastructure | App Runner (API hosting), S3 (media/PDFs), SQS (job queues), Lambda (async workers), ECR (Docker registry), Cognito (Auth/JWT), Secrets Manager |
| External Services | Twilio (Voice/SMS), Stripe (Billing), OpenAI/Anthropic (GPT-4o/Claude/Whisper), Deepgram (Real-time STT), Mapbox (Maps/Tiles) |
| Normalization System | Alias, VocabularyPackage, InspectorCorrection |
| Session Metadata | SessionMeta, WeatherSnapshot |
| Geo & Spatial | PropertyBoundary, GeoExportJob, PostGIS (spatial queries), GDAL/ogr2ogr (format conversion), Turf.js (client-side spatial), Mapbox GL JS (web maps), react-native-maps (mobile maps) |
| Narrative & Notes | SessionNarrative, UnmappedNote |
| Vertical Configuration | VerticalConfig |
| Output & Export | OutputConfig, OutputTemplate, ExportJob, GeoExportJob, DataFlowMap |
| Push Notifications | PushToken, NotificationEvent |
| Licensing & Onboarding | License, OrgFeatureConfig |

### Cost per Inspection Estimate

| Component | Cost | Notes |
|-----------|------|-------|
| Deepgram real-time STT | ~$0.04 | ~10 min call at $0.0043/min |
| Whisper batch polish | ~$0.06 | ~10 min at $0.006/min |
| GPT-4o extraction | ~$0.10–0.30 | Depends on transcript length + photo count |
| GPT-4o photo analysis | ~$0.05–0.15 | Per photo, depends on complexity |
| Twilio call | ~$0.015/min | ~10 min = ~$0.15 |
| Twilio SMS/MMS | ~$0.01–0.03 | Per photo received |
| S3 storage | ~$0.001 | Photos + audio + PDF per inspection |
| SES email | ~$0.0001 | Per recipient |
| Mapbox map load | ~$0.0005 | ~$0.50 per 1,000 loads (free tier: 50K/mo) |
| PostGIS | $0 | PostgreSQL extension — no additional cost |
| GDAL/ogr2ogr (Lambda) | ~$0.001 | Per GIS export conversion |
| **Total estimate** | **~$0.40–0.80** | **Per inspection (phone path)** |

App-only inspections skip Twilio and Deepgram costs, reducing to ~$0.15–0.45 per inspection.

---

## 6. Subscription & Pricing

### Tier Structure

| | Base | Pro | Enterprise |
|---|------|-----|-----------|
| **Price** | $350/mo | $650/mo | Custom |
| **Outputs** | 400/mo | 1,000/mo | Unlimited |
| **Users** | 20 | 50 | Unlimited |
| **Forms** | Unlimited | Unlimited | Unlimited |
| **Phone inspections** | Yes | Yes | Yes |
| **App inspections** | Yes | Yes | Yes |
| **AI extraction** | Yes | Yes | Yes |
| **Branded PDF** | Basic | Custom | Custom |
| **Photo markup** | — | Yes | Yes |
| **PDF autofill** | — | Yes | Yes |
| **Client portal** | — | — | Yes |
| **Multi-level approval** | — | — | Yes |
| **External integrations** | — | — | Yes |
| **Predictive analytics** | — | — | Yes |
| **License codes** | — | — | Yes |
| **Custom vocabulary** | — | Yes | Yes |
| **API access** | — | — | Yes |

### Feature Gating Approach

Features are **never hidden** — they are always visible in the UI. Features unavailable on a tier are shown grayed out with an "upgrade to use" prompt. This serves as built-in upsell while keeping the interface consistent across all tiers.

- **OrgFeatureConfig** stores the org's subscription tier and feature toggles
- **UserPreference** can override some settings where allowed
- At runtime, the system merges `OrgFeatureConfig` with `UserPreference` — user overrides win for allowed settings
- Feature checks happen both server-side (API enforcement) and client-side (UI gating)

---

## 7. Implementation Roadmap

### Phase 1 — Foundation (Auth + Org + Forms + Basic Inspection)

**Goal:** Admin can create an org, build a form, invite an inspector, and complete a basic phone-call inspection.

| Feature | Current | Target |
|---------|---------|--------|
| Admin Signup | 100% | 100% |
| Create Organization | 100% | 100% |
| Invite Team | 100% | 100% |
| Inspector Claims Invite | 100% | 100% |
| Form Builder (core) | 60% | 80% |
| Form Versioning | 40% | 60% |
| Setup Properties | 30% | 60% |
| Assign Phone Numbers | 40% | 80% |
| Gets App & Number | 35% | 70% |
| Ready to Inspect | 30% | 60% |
| Calls Twilio Number | 60% | 80% |
| Real-time Audio Stream | 50% | 80% |
| Inspection Begins | 50% | 70% |
| Dashboard (core) | 100% | 100% |

**Key deliverables:**
- Working signup → org → invite → claim flow
- Basic form builder with field types and sections
- Phone call inspection path (Twilio → transcription)
- Admin dashboard with inspection list

---

### Phase 2 — AI Processing Pipeline

**Goal:** Complete AI extraction pipeline: transcription → field extraction → confidence scoring → review → submission.

| Feature | Current | Target |
|---------|---------|--------|
| Transcription | 60% | 90% |
| AI Field Extraction | 50% | 80% |
| Confidence Scoring | 35% | 70% |
| FormFieldValues | 50% | 80% |
| Quality Validation | 20% | 50% |
| Photo Analysis | 15% | 50% |
| Inspector Submit | 30% | 70% |
| Inspector Review | 40% | 70% |
| Opens App Form | 40% | 70% |
| Voice + Camera + GPS | 30% | 60% |
| Local Storage & Sync | 15% | 50% |
| Subscription & Billing | 30% | 70% |
| Field Configuration | 15% | 40% |
| Admin Assigns | 15% | 50% |

**Key deliverables:**
- Full AI extraction pipeline (transcript → structured data)
- Confidence-guided review workflow
- Dual capture paths (phone + app) both producing structured output
- Stripe billing integration
- App-based inspections with photo/voice/GPS capture

---

### Phase 3 — Delivery & Polish

**Goal:** Complete output pipeline and polish the end-to-end experience. Reports, email, templates, export.

| Feature | Current | Target |
|---------|---------|--------|
| Branded PDF Report | 15% | 80% |
| PDF Autofill | 10% | 60% |
| Email (SES) | 15% | 70% |
| SMS Photos | 15% | 60% |
| Final Sign-off | 10% | 60% |
| Multi-level Approval | 10% | 40% |
| Auto-Complete & Upload | 10% | 50% |
| Form Templates | 20% | 50% |
| Real-time Field Mapping | 15% | 50% |
| Session Metadata | 10% | 40% |
| Inspector Self-Start | 10% | 50% |
| Inspection Mode Selector | 10% | 50% |
| Integration Settings | 10% | 30% |
| Mobile In-Field Review | 5% | 30% |

**Key deliverables:**
- Branded PDF generation and email delivery
- PDF autofill for compliance forms
- Template library with anonymized starter forms
- Multi-level approval chain
- SMS photo intake during phone calls
- Session metadata capture (weather, GPS track, device info)

---

### Phase 4 — Intelligence & Scale

**Goal:** Learning loop, analytics, client portal, enterprise features. The system gets smarter with every inspection.

| Feature | Current | Target |
|---------|---------|--------|
| AI Learning Pipeline | 0% | 40% |
| Predictive Analytics | 0% | 30% |
| Insights Dashboard | 0% | 30% |
| Client Portal / API | 0% | 40% |
| Feedback & Re-inspection | 0% | TBD |
| Form Markdown Guidance | 0% | 40% |
| Vocabulary & Aliases | 0% | 40% |
| Field Normalization | 0% | 40% |
| OCR/Narration Resolver | 0% | 30% |
| License Management | 0% | 40% |
| License Code Entry | 0% | 40% |
| Feature Toggles | 0% | 40% |
| User Preferences | 0% | 40% |
| Training Walkthrough | 0% | 30% |
| Scheduler / Recurring | 0% | 30% |
| External Ticket Source | 0% | 20% |
| Output Template Manager | 0% | 30% |
| External System Export | 0% | 30% |
| Data Flow Configuration | 0% | 20% |
| Photo Markup & Tagging | 5% | 30% |
| Push Notifications | 5% | 40% |

**Key deliverables:**
- AI learning pipeline: corrections improve extraction per org
- Predictive analytics and insights dashboard
- Client portal with white-label branding
- Enterprise features: license codes, vocabulary packages, feature toggles
- Full normalization pipeline (aliases → canonical values)
- Scheduler for recurring inspections
- External integrations (Jira, ServiceNow, Salesforce)

---

## Connection Map

### Flow Edges (80 connections)

**Tier 0 internal:**
admin_signup → create_org → subscription, create_org → form_builder → form_templates, form_builder → form_versioning, create_org → setup_properties → assign_numbers, setup_properties → integration_settings, form_builder → form_ingestion (import fields), form_ingestion → form_builder (OCR → fields loop), form_builder → field_configuration → output_configuration, form_builder → form_markdown_guidance, create_org → license_management, create_org → vocabulary_aliases, create_org → feature_toggles, form_builder → output_configuration

**Tier 0 → Tier 1:**
create_org → invite_team, assign_numbers → invite_team, license_management → license_code_entry, feature_toggles → user_preferences

**Tier 1 internal:**
invite_team → inspector_claims → gets_app → user_preferences → ready_inspect, invite_team → license_code_entry → gets_app, gets_app → training → ready_inspect

**Tier 1 → Tier 2:**
ready_inspect → self_start, form_builder → admin_assigns

**Tier 2 internal:**
scheduler → inspection_begins, admin_assigns → inspection_begins, self_start → inspection_begins, external_ticket_source → admin_assigns, inspection_begins → inspection_mode_selector

**Tier 2 → Tier 3:**
inspection_mode_selector → calls_twilio (phone mode), inspection_mode_selector → opens_app (app mode)

**Tier 3 internal:**
calls_twilio → realtime_audio → sms_photos, opens_app → voice_camera_gps → local_sync, sms_photos → local_sync, voice_camera_gps → photo_markup_tagging → local_sync, voice_camera_gps → session_metadata_capture, calls_twilio → session_metadata_capture

**Tier 3 → Tier 4:**
realtime_audio → transcription, local_sync → transcription, sms_photos → photo_analysis, photo_markup_tagging → photo_analysis, session_metadata_capture → form_field_values

**Tier 4 internal:**
transcription → ai_extraction, photo_analysis → ocr_narration_resolver, transcription → ocr_narration_resolver, ocr_narration_resolver → ai_extraction, ai_extraction ↔ photo_analysis (multi-pass loop), photo_analysis → confidence_scoring → quality_validation → form_field_values, ai_extraction → field_normalization → form_field_values, transcription → realtime_field_mapping → form_field_values

**Tier 4 → Tier 5:**
form_field_values → inspector_submit, form_field_values → auto_complete_upload

**Tier 5 internal:**
inspector_submit → inspector_review → multi_approval → final_signoff, inspector_submit → mobile_infield_review → multi_approval, auto_complete_upload → branded_pdf (skip review)

**Tier 5 → Tier 6:**
final_signoff → branded_pdf, final_signoff → pdf_autofill, final_signoff → email_ses, final_signoff → dashboard, final_signoff → client_portal, final_signoff → output_template_manager, final_signoff → external_system_export, final_signoff → data_flow_configuration

**Tier 6 internal:**
branded_pdf ↔ pdf_autofill (bidirectional), output_template_manager → branded_pdf, data_flow_configuration → external_system_export

**Tier 6 → Tier 7:**
dashboard → predictive_analytics, dashboard → insights_dashboard, dashboard → ai_learning_pipeline, client_portal → feedback_loop

**Tier 7 internal:**
predictive_analytics → insights_dashboard, feedback_loop → ai_learning_pipeline → predictive_analytics (improved models)

**Backward/loop edges:**
feedback_loop → admin_assigns (re-inspection loop), push_notification_service → admin_assigns (push alerts)

### Data Connections (26 foreign key relationships)

| Source | Target | Relationship |
|--------|--------|-------------|
| Organization.id | Form.orgId | Org owns forms |
| Organization.id | Membership.orgId | Org has members |
| Organization.id | Property.orgId | Org owns properties |
| User.id | Membership.userId | User belongs to orgs |
| FormField.id | FormFieldValue.formFieldId | Field defines value schema |
| CallSession.id | FormFieldValue.callSessionId | Session produces values |
| Organization.id | CallSession.orgId | Org scopes sessions |
| Form.id | CallSession.formId | Session uses a form |
| Assignment.id | CallSession.assignmentId | Assignment triggers session |
| Property.id | Assignment.propertyId | Assignment targets property |
| CallSession.id | Photo.callSessionId | Session contains photos |
| FormFieldValue[] | Inspector Review display | Values render in review UI |
| CallSession.id | TranscriptChunk.sessionId | Session has transcript |
| CallSession.id | PDF generation | Session drives PDF output |
| Alias[] + VocabPackage | Field normalization | Aliases normalize values |
| FormGuidance.md | AI extraction context | Guidance improves extraction |
| OutputConfig | OutputTemplate selection | Config selects template |
| OutputConfig | ExportJob target | Config determines export target |
| UserPreference | Opens App default form + mode | Prefs set defaults |
| UserPreference | OrgFeatureConfig overrides | User overrides org settings |
| TicketSource | Assignment.externalTicketId | Tickets create assignments |
| SessionMeta | FormFieldValue context | Metadata enriches values |
| PushToken | Assignment notification | Tokens route push alerts |
| InspectorCorrection | AI extraction improvement | Corrections train AI |
| FormField.id | FieldConfig.fieldId | Field has advanced config |
| License.orgId | Organization seat management | License manages seats |

---

---

## 8. Vertical Configurations

PAX is a horizontal data collection platform that adapts to specific verticals via VerticalConfig, form templates, and compliance output packs.

### Supported Verticals (initial)

| Vertical | Key Data | Compliance Output | GPS Importance |
|----------|----------|-------------------|----------------|
| Pest Control / EPS | Treatment areas, bait stations, activity levels | State regulatory reports | Medium (station locations) |
| Telecom / Fiber Optic | Cable damage location, severity, photo evidence | Damage documentation tickets | Critical (exact damage coordinates) |
| Environmental Phase 1 | Site conditions, contamination indicators, historical use | EPA Phase 1 ESA report format | Critical (sample locations) |
| Landscaping QA | Plant health, irrigation, hardscape condition | Quality audit reports | High (coverage maps) |
| Construction Progress | Phase completion, material status, safety compliance | Progress documentation, OSHA | High (site coverage) |
| Property Assessment | Condition ratings, defects, maintenance needs | Insurance/appraisal reports | Medium (defect locations) |
| Safety / OSHA | Hazard identification, compliance status, corrective actions | OSHA audit format | Medium |
| Utility Infrastructure | Pole/meter/transformer condition, vegetation encroachment | Utility inspection reports | Critical (asset locations) |
| Maintenance / Work Orders | Issue description, repair needed, parts required | Service tickets | Low-Medium |

### What Makes PAX Powerful Across Verticals

Expert narration + photos + GPS + metadata = contextual documentation that no form-only tool can match:

- **Voice** captures nuance and expert judgment
- **Photos** provide visual evidence with spatial context
- **GPS** proves location, tracks coverage, enables GIS analysis
- **AI** extracts structured data while preserving the full narrative
- **Every layer is preserved** — raw audio → transcript → narrative → field values → notes

---

*End of specification. This document is the single source of truth for the PAX system architecture, data model, and feature requirements.*
