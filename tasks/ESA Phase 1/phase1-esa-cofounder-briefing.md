# PAX Phase I ESA — System Overview

How PAX captures a site inspection via narration and photos, extracts structured data, and generates a complete Phase I Environmental Site Assessment report.

---

## The Problem We're Solving

A Phase I ESA is a ~20-page regulatory document that environmental consultants produce for every commercial real estate transaction. It follows a rigid structure defined by ASTM E1527-21. Today, the process looks like this:

1. Inspector drives to the property
2. Walks around with a clipboard or voice memo app for 1-3 hours
3. Takes photos on their phone
4. Drives back to the office
5. Spends 6-12 hours manually writing the report in Word
6. Senior reviewer spends 2-4 hours editing
7. Report goes to the client

Steps 5-6 are where all the pain lives. The inspector already has every fact in their head (and in their voice memos and photos) — they just have to manually transcribe it into a rigid document template. This is expensive, slow, and error-prone.

**PAX eliminates steps 5-6.** The inspector narrates as they walk. PAX listens, extracts every data point, and generates the finished Word document automatically.

---

## How It Works — End to End

### Step 1: Schema Setup (One-Time)

The firm owner (the "Mike" persona) uploads a sample Phase I ESA report or uses our pre-built template. PAX creates a **Schema** — the blueprint of every data point the report needs.

Our Phase I ESA Schema has **~130 fields** organized into 11 sections:

| Section | What It Captures | Example Fields |
|---------|-----------------|----------------|
| Property ID | Address, GPS, use type, parcel # | `property_address_street`, `property_use_current` |
| Physical Description | Building size, age, construction, water/sewer | `land_area_sf`, `construction_date`, `potable_water_source` |
| Current/Past Uses | Tenant, operations, chemicals, history | `current_tenant_name`, `hazmat_on_site`, `past_uses` |
| Records Review | Database results, aerials, Sanborns, liens | `subject_property_db_listed`, `aerial_photos_findings` |
| Interviews | Who was interviewed, what they said | `interviewees`, `interview_findings` |
| Site Recon (13 subsections) | USTs, ASTs, staining, PCBs, asbestos, mold, PFAS, etc. | `usts_present`, `acm_inventory`, `staining_assessment` |
| Findings | RECs, CRECs, HRECs, data gaps | `recs_identified`, `recs_list` |
| Certification | EP names, dates, limiting conditions | `ep_names`, `limiting_conditions` |

Every field has a **type** (text, number, date, yes/no, photo, list), **validation rules** (e.g., "temperature must be between -40 and 130"), and **extraction instructions** that tell the AI what to listen for.

### Step 2: Field Capture (The Walk-Around)

The inspector (the "Danny" persona) opens the PAX app on their phone. They see all ~130 fields organized by section. They don't fill anything in manually. Instead:

1. **They tap the mic and start talking.** They narrate what they see as they walk the property, in whatever order feels natural.

2. **The Coverage Strip updates in real-time.** As they talk, the app uses a lightweight on-device detector to mark which fields have been addressed. Green = covered. Gray = not yet covered. This runs offline — no internet needed.

3. **They snap photos inline.** Tap the camera button while narrating. The photo gets timestamped, GPS-tagged, and associated with whatever field they were discussing at that moment.

4. **When they're done walking, they hit submit.** The raw audio and photos upload to the backend when connectivity is available.

The inspector never types. They never look at a form. They just walk, talk, and take photos. The Coverage Strip is the only UI feedback they need — it shows them what they haven't mentioned yet so they can circle back before leaving the site.

### Step 3: AI Extraction (Backend)

Once the audio and photos upload, the **ExtractionEngine** processes everything:

1. **Speech-to-text** converts the full narration to a transcript
2. **Schema-aware extraction** reads the transcript and maps every statement to the appropriate field in the Schema
3. **Photo analysis** reads labels on containers/transformers (OCR), identifies equipment, and fills relevant fields
4. **Confidence scoring** — every extracted value gets a 0.0-1.0 confidence score
5. **Conflict detection** — if the inspector said contradictory things (e.g., "no floor drains" then later "the floor drains discharge to..."), the system flags it
6. **Cross-field validation** — checks logical consistency (e.g., building built in 1994 → lead-based paint = "Unlikely")

The output is a **Contract** — a structured JSON object with every field populated, confidence-scored, and linked back to the specific audio timestamp and/or photo that produced it.

### Step 4: Contract Review (Trust Screen)

The inspector (and/or the senior reviewer) opens the Contract Review screen. Three panels:

| Left Panel | Center Panel | Right Panel |
|-----------|-------------|-------------|
| Raw audio with timeline scrubber | Every extracted field value | Confidence indicator per field |
| Photo thumbnails | Editable — tap to change | Green = confident, Yellow = review, Red = missing |
| Transcript (expandable) | Edit log tracks all changes | Tap yellow/red → plays the audio clip |

This is where trust is built. The reviewer can hear exactly what the inspector said, see what the AI extracted, and correct anything that's wrong. Every manual edit is logged (who, when, what it was before).

Once the reviewer is satisfied, they hit **Approve**. The Contract status moves to **Validated**.

### Step 5: Document Generation (The Output)

The validated Contract feeds into the **Document Generation Agent**. This agent:

1. Takes the structured field data
2. Follows a precise document template that replicates the exact format of a professional Phase I ESA
3. Outputs a complete `.docx` file

The generated report includes:
- **Cover letter** with client/firm info and signature block
- **Title page** with prepared for/by, reviewer, project number
- **Table of contents** with auto-calculated page numbers
- **Executive summary** with project description table and findings
- **Full report body** — every section (1.0 through 8.4) with proper formatting, regulatory boilerplate, and conditional logic
- **Figures** — site location map, property sketch, topo map
- **Appendices** — photos in grid layout with captions, EDR report, historical documents

The document reads like a human wrote it because:
- Regulatory sections use exact standard language (these never change between reports)
- Narrative sections use formal environmental consulting prose generated from the extracted data
- Conditional logic handles every scenario (RECs found vs. not found, ACM present vs. absent, etc.)
- Numbers are formatted correctly (spelled out with numerals in parens, ± prefix on estimates)
- Cross-references are maintained ("Refer to Section 4.3", "See Appendix B")

### Step 6: Human Review of Document

The generated `.docx` opens in Word. The senior reviewer reads through it, makes any final edits, and delivers to the client. Typical review time: **30-60 minutes** instead of 6-12 hours of writing from scratch.

---

## What the Files Are

We have four files that define this entire system:

### `phase1-esa-schema.json`
The **Schema** — the machine-readable definition of every field. This is what gets loaded into PAX when a firm sets up the Phase I ESA template. It defines:
- Field ID (machine key)
- Label (human-readable name)
- Type (String, Number, Boolean, Enum, Date, Text, Photo, Array, GeoLocation)
- Required flag
- Validation rules
- Enum options (for dropdowns)
- Conditional logic (e.g., "UST details required only if USTs present")

### `phase1-esa-schema.md`
The **AI Extraction Instructions** — tells the ExtractionEngine how to map narration to fields. For every field, it explains:
- What to listen for in the narration (signal phrases, keywords)
- How to classify the value (e.g., "auto repair shop" → `Commercial`)
- Default values when nothing is said (e.g., "no USTs mentioned" → `usts_present: false`)
- Photo extraction rules (e.g., read dumpster label → `solid_waste_hauler`)
- Conflict resolution strategy per field
- Coverage Detector keywords for the real-time on-device field highlighting

### `phase1-esa-doc-template.md`
The **Document Template** — tells the document generation agent exactly how to assemble the final Word document. For every section of the report, it specifies:
- Exact prose template with `{{field_id}}` placeholders
- Conditional blocks (if RECs found, render this; if not, render that)
- Static regulatory text that never changes
- Table layouts with column specs
- Formatting rules (font, margins, spacing, headers/footers)
- Photo layout in appendices
- Cross-reference management

### `phase1-esa-doc-agent.md`
The **Agent Instructions** — the system prompt for the AI agent that actually generates the document. It covers:
- Input format (the Contract JSON)
- Output format (.docx specs)
- Text generation rules (never invent facts, use formal prose, standard abbreviation tracking)
- Error handling (missing fields → red placeholders, low confidence → yellow highlights)
- Validation checklist the agent runs before returning the document

---

## The Value Chain

```
Inspector walks property     →  Raw audio + photos
     ↓
PAX extracts data           →  Structured Contract (130 fields, confidence-scored)
     ↓
Reviewer verifies           →  Validated Contract
     ↓
Agent generates report      →  Complete .docx (20+ pages, publication-ready)
     ↓
Senior reviewer polishes    →  30-60 min instead of 6-12 hours
```

**Time saved per report:** 5-11 hours of writing eliminated
**Error reduction:** Every field traces to audio/photo evidence. No transcription mistakes.
**Audit trail:** Complete chain from raw narration → extracted value → document text

---

## What Makes This Different from "Just Using ChatGPT"

1. **Schema-aware extraction.** The AI doesn't just summarize — it maps narration to 130 specific fields with types, validation, and confidence scores. It knows that "about 26,000 square feet" goes into `land_area_sf` as the number `26000`.

2. **Regulatory compliance baked in.** The document template includes exact ASTM E1527-21 boilerplate. The viability dates are auto-calculated. The section numbering matches the standard. A generic AI would get this wrong.

3. **Evidence chain.** Every value in the report links back to the audio timestamp or photo that produced it. This is what makes it auditable. A ChatGPT-generated report has no provenance.

4. **Confidence scoring.** Low-confidence extractions are flagged, not silently inserted. The reviewer knows exactly which parts to check.

5. **The AI doesn't touch the database.** Extraction (AI) and fulfillment (document generation) are separate layers. The extraction proposes values. The engine executes deterministically. This is what makes it trustworthy for compliance-heavy industries.

---

## Technical Implementation Notes

### The Document Agent

The document generation agent uses `python-docx` (or equivalent) to produce the Word file. It's not a language model generating free-form text — it's a **template engine with conditional logic**. The vast majority of the document is either:
- **Static regulatory boilerplate** (copied verbatim from the template)
- **Direct field value insertion** (`{{property_address_street}}` → "4321 East Oak Street")
- **Simple conditional branching** (if USTs present → render details paragraph; else → render "none observed" sentence)

The only sections where the agent generates prose are:
- AST inventory narrative (converting structured inventory items into a flowing paragraph)
- Limiting conditions (generating from a list of observed obstructions)
- Findings summary (assembling the conclusion from Boolean REC flags)

Even these follow strict templates — the agent is filling in blanks, not writing creatively.

### Offline Behavior

- The inspector can capture the entire session offline
- Audio, photos, and coverage state are stored on-device
- When connectivity returns, everything syncs automatically
- The backend runs extraction and sends a push notification: "Your report is ready for review"

### Amendment Flow

If the report needs corrections after delivery:
- A new Contract is created referencing the original
- Only changed fields are included, plus a reason
- The engine applies the delta
- Both the original and amendment are preserved in the audit log
- A new document can be generated reflecting the amendment

---

## Next Steps

1. **Validate the Schema** — Walk through each field with an experienced Phase I inspector. Are we capturing everything? Are the field types right? Are validation rules appropriate?

2. **Build the Extraction Prompt** — Turn `phase1-esa-schema.md` into the actual system prompt for the ExtractionEngine. Test against real narration recordings.

3. **Build the Document Agent** — Implement `phase1-esa-doc-agent.md` as a working service that takes Contract JSON and outputs `.docx`. Test against the sample document for formatting fidelity.

4. **Pilot** — Get one firm to do a real inspection using PAX. Compare the generated report against what they would have written manually. Measure time saved and error rate.
