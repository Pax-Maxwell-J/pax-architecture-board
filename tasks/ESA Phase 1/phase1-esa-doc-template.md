# Phase I ESA — Document Generation Template

Reference schema: `phase1-esa-schema.json`

This template tells the document generation engine exactly how to produce a Phase I Environmental Property Assessment report from a fulfilled Contract. The output is a Word document (.docx) that replicates the standard ESA report format per ASTM E1527-21.

Field references use the format `{{field_id}}`. Conditional blocks use `{{#if field_id}}...{{/if}}`. Loops use `{{#each array_field}}...{{/each}}`.

---

## Document Structure — Page Order

1. Cover Letter (separate page)
2. Title Page (separate page)
3. Table of Contents (auto-generated, separate page)
4. Report Body (Sections 1.0–8.0)
5. Figures (separate pages)
6. Appendices A–E (separate pages)

---

## PAGE 1: Cover Letter

```
{{report_date}}

{{client_name}}
{{client_title}}
{{client_company}}
{{client_address}}

Re:  Phase I Environmental Property Assessment
     Location: {{property_address_street}}
     {{property_address_city}}, {{property_address_state}}
     Project #: {{project_number}}

Dear {{client_name}}:

Following is the Phase I Environmental Property Assessment report
(Report) conducted on the above referenced project location. This
Report details the Findings and Conclusions of our evaluation.

{{prepared_by_firm}} appreciates the opportunity to have provided our
services and looks forward to serving your future needs. Should you
have questions concerning this Report, or have further need of our
services, please do not hesitate to call.

Sincerely,

{{preparer_name}}
{{preparer_title}}

Attachment
```

**Formatting:** Business letter format. Date top-right-aligned. Body single-spaced. Firm letterhead applied as document header if available.

---

## PAGE 2: Title Page

```
PHASE I ENVIRONMENTAL PROPERTY ASSESSMENT

{{property_address_street}}
{{property_address_city}}, {{property_address_state}}


Prepared For:

{{client_company}}
{{client_address}}
{{#if lender_name}}
and
{{lender_name}}
{{/if}}


Prepared By:

{{prepared_by_firm}}
{{prepared_by_firm_address}}

{{preparer_name}}
{{preparer_title}}


Reviewed By:

{{reviewer_name}}
{{reviewer_title}}


Project Number:
{{project_number}}

{{report_date}}
```

**Formatting:** Centered text. Title in bold caps. Each section group separated by whitespace. No page number on this page.

---

## PAGE 3: Table of Contents

Auto-generated from the section headings below. Format:

```
TABLE OF CONTENTS

1.0  Executive Summary ................................. 1
2.0  Introduction ...................................... X
2.1  Purpose ........................................... X
2.2  Phase I Assessment Viability ...................... X
2.3  Scope of Services ................................. X
2.4  Limiting Conditions ............................... X
3.0  Subject Property Description ...................... X
3.1  Location and Legal Description .................... X
3.2  Description of Improvements On-site ............... X
3.3  Current and Past Uses of the Subject Property ..... X
3.4  Current and Past Uses of Adjoining Sites .......... X
4.0  Records Review .................................... X
4.1  Physical Setting Sources .......................... X
4.2  Federal and State Environmental Record Sources .... X
4.3  Historical Use Information ........................ X
5.0  Interviews ........................................ X
6.0  Site Reconnaissance ............................... X
6.1  Underground Storage Tanks (USTs) .................. X
6.2  Aboveground Storage Tanks (ASTs)/Drums/Containers . X
6.3  Stained or Disturbed Surfaces/Stressed Vegetation . X
6.4  Stormwater/Standing Water/Wetlands/Ponds/Lagoons .. X
6.5  Waste Disposal Practices .......................... X
6.6  Polychlorinated Biphenyls (PCBs) .................. X
6.7  Air Quality/Emissions ............................. X
6.8  Readily Observable Suspect ACM .................... X
6.9  Potential Lead-Based Paint ........................ X
6.10 Miscellaneous Equipment ........................... X
6.11 Biological Hazards/Mold ........................... X
6.12 Emerging Contaminants ............................. X
6.13 Observations of Surrounding Sites ................. X
7.0  Findings and Conclusions .......................... X
8.0  Warranty and Limitations of Liability ............. X
8.1  Confidentiality ................................... X
8.2  Reliance on Phase I Assessment and Report ......... X
8.3  Sources of Information ............................ X
8.4  Certification ..................................... X

FIGURES
Figure 1 – Subject Property Location Map
Figure 2 – Subject Property Sketch
Figure 3 – Topographic Map

APPENDICES
Appendix A – Proposal Between the Client and {{prepared_by_firm}}
Appendix B – Photographic Documentation
Appendix C – Environmental Database Information
Appendix D – Historical Information
Appendix E – {{prepared_by_firm}} Qualifications
```

Page numbers auto-calculated. Right-aligned with dot leaders.

---

## SECTION 1.0: EXECUTIVE SUMMARY

### Opening Paragraph

> {{prepared_by_firm}} ({{firm_short_name}}) has performed a Phase I Environmental Property Assessment (Phase I Assessment) of {{property_address_street}} {{property_address_city}}, {{property_address_county}} County, {{property_address_state}} (Subject Property) in conformance with the scope and limitations of the American Society for Testing and Materials (ASTM) Standard Practice for Environmental Site Assessments (Standard E 1527-21) and according to the standards and practices set forth in 40 Code of Federal Regulations (CFR) Part 312. Any exceptions to, or deletions from these practices are described in Section 2.3 of this report (Report).

**Note:** `{{firm_short_name}}` is derived from `{{prepared_by_firm}}` — use the abbreviated form the firm uses internally (e.g., "EPS Environmental Services, Inc." → "EPS Environmental"). If not configured, use full name on first reference, then "the Firm" thereafter.

### Project Description Table

Render as a two-column table with borders:

| Label | Value | Source Field |
|-------|-------|-------------|
| Address | `{{property_address_street}}, {{property_address_city}}, {{property_address_state}}` | property_address_* |
| Subject Property Use | `{{property_use_current}}` | property_use_current |
| Land Size | `±{{land_area_sf}} square feet (sf)` | land_area_sf |
| Number of Structures | Spell out: `One (1)`, `Two (2)`, etc. | num_structures |
| Number of Stories | Spell out: `One-story`, `Two-story`, etc. | num_stories |
| Date(s) of Construction | `{{construction_date}}` | construction_date |
| Type of Construction | `{{construction_type}}` | construction_type |
| Gross Building Area | `±{{gross_building_area_sf}} square feet (sf)` | gross_building_area_sf |
| Current Subject Property Index Number | `{{parcel_number}}` or "Not provided" | parcel_number |
| Current Tenant(s)/Operations | `{{current_tenant_name}}/{{current_operations}}` | current_tenant_name, current_operations |
| Former Uses | `{{past_uses}}` (condensed to comma-separated) | past_uses |
| Adjacent Land Use | Derive dominant use from adjacent_north/south/east/west | adjacent_* |
| Inspection Date | `{{inspection_date}}` | inspection_date |
| Inspected By | `{{inspector_name}}` | inspector_name |

### Findings Summary Paragraph

**If no RECs found:**
> This Phase I Assessment has identified no evidence of recognized environmental conditions (RECs), controlled RECs (CRECs), historical RECs (HRECs) or significant data gaps in connection with the Subject Property. No further investigation is warranted at this time.

**If RECs found:**
> This Phase I Assessment has identified the following recognized environmental conditions (RECs) in connection with the Subject Property:
> {{#each recs_list}}
> - {{this}}
> {{/each}}
> Further investigation is warranted.

**If CRECs or HRECs found, add separate paragraphs for each following the same pattern.**

### Business Environmental Risks Paragraph

**Always include if `business_env_risks` is populated:**
> However, business environmental risks (e.g., {{business_env_risks_summary}}) associated with the current or planned uses of the Subject Property are individually discussed in various Sections of this Report.

**`business_env_risks_summary`** is a condensed phrase list generated from `business_env_risks`. Example: "equipment containing regulated substances, suspect asbestos-containing material (ACM), etc."

---

## SECTION 2.0: INTRODUCTION

### Opening Line

> {{firm_short_name}} was retained to conduct the Phase I Assessment of the Subject Property by {{client_company}}{{#if lender_name}} and {{lender_name}} (collectively, the Client){{else}} (the Client){{/if}}.

### 2.1 Purpose

**Static text — do not vary:**
> The purpose of the Phase I Assessment was to identify readily apparent, potential sources of environmental liabilities associated with the Subject Property and to qualify for landowner liability protection (LLP) under the Comprehensive Environmental Response Compensation and Liability Act (CERCLA) in conjunction with the user requirements as defined in 40 CFR Part 312.

### 2.2 Phase I Assessment Viability

**Static opening:**
> According to ASTM E1527-21, this Phase I Assessment is presumed to be viable for 180 days after the earliest date of the following components:

**Viability table:**

| Assessment Component | Date |
|---------------------|------|
| Environmental Database Governmental Records | `{{date_database_records}}` |
| Interviews | `{{date_interviews}}` |
| Visual Inspection | `{{date_visual_inspection}}` |
| Declaration of Environmental Professional | `{{date_ep_declaration}}` |

> Refer to Sections 4.2, 5.0, 6.0 and 8.4 for additional discussion.

### 2.3 Scope of Services

**Semi-static. Generate from available data:**

> The scope of services agreed upon by the Client and performed by {{firm_short_name}} is consistent with the recommendations set forth in the ASTM Standard E 1527-21 and according to the standards and practices set forth in 40 CFR Part 312. Moreover, potential environmental business risks are discussed in this Report, which include {{scope_risk_list}}. Data gaps and/or de minimis concerns identified on the Subject Property are discussed within the text of this Report. In order to qualify for one of the LLPs offered by the Small Business Liability Relief and Brownfields Revitalization Act of 2001, the user of this Report must conduct the inquiries which are included on the environmental questionnaire (refer to Section 4.3.6). It should be noted, the questionnaire can be completed independent of this Report.

**`scope_risk_list`** — auto-generate from what was observed. Include items from this list if the corresponding field has data:
- `acm_observed == true` → "suspect ACM"
- `wetlands_observed == true` → "wetland vegetation"
- `mold_evidence == true` → "biological hazards/mold"
- `lbp_potential != Unlikely_Post1978` → "lead-based paint"
- `fluorescent_lights == true || mercury_thermostats == true || cfc_equipment == true` → "equipment containing hazardous or regulated substances"
- Always include: "radon gas levels"

> The scope of services performed by {{firm_short_name}} was set forth in the Proposal between the Client and {{firm_short_name}} dated {{proposal_date}} (Appendix A).

### 2.4 Limiting Conditions

Generate from `{{limiting_conditions}}`. The text should follow this structure:

**Paragraph 1 — Physical observation limitations.** Auto-generate based on what obstructed views:
> The presence of [list obstructions observed during walk-around: vegetation, parked automobiles, dumpsters, debris, etc.] limited observations in isolated areas of underlying exterior surfaces on the Subject Property. In addition, the presence of [interior obstructions: furnishings, floor coverings, storage drums, ASTs, equipment] limited observations in isolated areas of underlying interior surfaces on the Subject Property. Furthermore, the presence of [adjacent site obstructions: vehicles, dumpsters, fencing, vegetation] limited observations in isolated areas of underlying surfaces on the adjacent sites as viewed from the Subject Property and public right-of-ways. Therefore, {{firm_short_name}} makes no guarantees as to existing conditions of underlying surfaces that could not be readily inspected or inaccessible areas.

**Paragraph 2 — Standard ACM/LBP/mold scope limitation (always include):**
> Sampling and an all-inclusive survey for the presence of suspect ACM, lead-based paint and/or biological hazards/mold were beyond the scope of services for this Phase I Assessment. A visual inspection for readily observable suspect ACM, deteriorated paint and discolored/stained areas of potential mold growth was conducted; however, the removal of physical or visual barriers or inaccessible areas such as pipe chases, interiors of machinery/equipment and "dead spaces," such as fully enclosed masonry vaults, was not conducted as part of this Phase I Assessment.

**Paragraph 3 — Data gaps (if any).** For each item in `data_gaps_list`, generate a paragraph:
> {{data_gap_description}}. However, {{firm_short_name}} opines this data gap is not material to the extent that would alter the Findings and Conclusions of this Report. In the event information is received that alters the Findings and Conclusions of this Report, it will be promptly forwarded to the Client.

**Paragraph 4 — Plat of Survey (if legal_description is empty):**
> As no Plat of Survey was provided for the Subject Property, the exact Subject Property boundaries could not be determined and the sizes of the Subject Property and Subject Property building have been estimated. Any other limiting conditions pertaining to this Phase I Assessment are described in associated Sections of this Report.

---

## SECTION 3.0: SUBJECT PROPERTY DESCRIPTION

### 3.1 Location and Legal Description

> The Subject Property is located {{location_description}}, in the {{municipality_type}} of {{property_address_city}}, {{property_address_county}} County, {{property_address_state}}. The Subject Property is situated in a {{property_use_current | lowercase}} setting. See Figure 1 - Subject Property Location Map following the text of this Report. {{#if legal_description}}The legal description for the Subject Property is: {{legal_description}}.{{else}}The legal description for the Subject Property was not provided.{{/if}}

**`municipality_type`** — derive from city name or use "Village/City/Town" as appropriate. Default to "Village" if unknown.

### 3.2 Description of Improvements On-site

#### 3.2.1 Subject Property Size

> The Subject Property consists of a {{land_shape | lowercase}} shaped parcel of land totaling approximately {{land_area_sf | commaFormat}} square feet. See Figure 2 - Subject Property Sketch.

#### 3.2.2 Structure

{{#if num_structures > 0}}

> The Subject Property is developed with a {{num_stories | spellOut}}-story, {{property_use_current | lowercase}} building totaling approximately {{gross_building_area_sf | commaFormat}} square feet (Subject Property building).

##### 3.2.2.1 General Construction

> The ±{{building_age}}-year-old Subject Property building ({{construction_date}}) is constructed of {{construction_type}}. {{building_layout}}

**`building_age`** = current year minus construction year. If "circa", compute from the circa year.

##### 3.2.2.2 Interior Finishes

> {{interior_finishes}}

**Formatting guidance:** Write as "Typically, the interior of the [area type] consists of [floor type] floors; [wall type] walls; and [ceiling type] ceilings." Repeat for each distinct area (office, shop, warehouse, etc.).

##### 3.2.2.3 Heating and Cooling Sources

> {{hvac_description}}

{{else}}

> The Subject Property is vacant land with no structures.

{{/if}}

#### 3.2.3 Remaining Grounds

> The remaining grounds consist of {{remaining_grounds}}. See Figure 2 - Subject Property Sketch and Appendix B - Photographic Documentation following the text of this Report.

#### 3.2.4 Potable Water Source

{{#if potable_water_source == "Municipal"}}
> The {{municipality_type}} of {{property_address_city}} supplies potable water{{#if potable_water_supplier}}, via {{potable_water_supplier}},{{/if}} to the Subject Property and surrounding area.
{{else if potable_water_source == "Private_Well"}}
> Potable water is supplied to the Subject Property via a private well.
{{else}}
> The source of potable water for the Subject Property was not determined during this Phase I Assessment.
{{/if}}

> There were {{#if monitoring_wells_present}}potable or groundwater monitoring wells reported or observed{{else}}no potable or groundwater monitoring wells reported or observed{{/if}} on the Subject Property.

#### 3.2.5 Wastewater/Stormwater Discharge

> Wastewater {{#if wastewater_system == "Municipal_Sewer"}}and stormwater run-off within the {{municipality_type}} of {{property_address_city}} discharge into {{#if stormwater_system == wastewater_system}}a combined sewer system{{else}}separate sewer systems{{/if}}.{{else if wastewater_system == "Septic"}}from the Subject Property is processed through an on-site septic system.{{/if}}

{{#if floor_drains_present}}
> {{floor_drain_discharge}}
{{/if}}

> There were {{#if septic_system_present}}septic systems reported or observed{{else}}no septic systems reported or observed{{/if}} on the Subject Property.

> Stormwater run-off is collected by {{stormwater_description}}. Refer to Section 6.4 for additional discussion.

### 3.3 Current and Past Uses of the Subject Property

#### 3.3.1 Current Uses

> The Subject Property is currently occupied by {{current_tenant_name}}. {{#if hazmat_on_site != "None observed"}}Various types of hazardous materials and/or petroleum managed on the Subject Property include, but are not limited to, {{hazmat_on_site}}.{{/if}} {{#if special_waste_generated}}Special waste generated from the Subject Property includes {{special_waste_generated}}.{{/if}} Based on site observations, the general work and housekeeping practices appeared to be {{housekeeping_assessment | lowercase}}.

#### 3.3.2 Past Uses

> According to {{past_uses_sources | default: "the Subject Property representative, historical aerial photographs and city directory search reviewed"}}, {{past_uses}}. Refer to Section 4.3 for additional discussion regarding historical uses of the Subject Property.

### 3.4 Current and Past Uses of Adjoining Sites

#### 3.4.1 Current Uses

> The Subject Property is surrounded as follows:

| Direction | Description |
|-----------|-------------|
| North: | {{adjacent_north}} |
| South: | {{adjacent_south}} |
| East: | {{adjacent_east}} |
| West: | {{adjacent_west}} |

#### 3.4.2 Past Uses

> {{adjacent_past_uses | default: "The surrounding sites have historically been utilized for agricultural and/or commercial purposes since development. Refer to Sections 4.2 and 4.3 for additional discussion on the historical uses regarding the adjacent sites."}}

---

## SECTION 4.0: RECORDS REVIEW

### 4.1 Physical Setting Sources

**Static opening:**
> The following sources were reviewed to provide information on the topographic and geologic characteristics of the Subject Property and surrounding area. Additionally, a county radon study was reviewed to provide statistics on the Subject Property's potential radon risk.

#### 4.1.1 USGS Topographic Map

> {{topography_description}}. See Figure 3 for a copy of the Topographic Map reviewed.

#### 4.1.2 State Geological Survey — Surficial Geology

> {{geology_description}}

#### 4.1.3 Aquifer Contamination Potential

> {{aquifer_vulnerability}}

{{#if fill_material_status == "Undocumented"}}
> It should be noted, no documentation was provided or readily available regarding whether imported fill material was used on the Subject Property during construction. As the nature and origin of the imported fill material, if any, is unknown, there is a potential for hazardous substances to be present in imported fill material underlying the Subject Property. Therefore, due to the lack of comprehensive documentation regarding the nature and origin of imported fill material, if any, and lack of environmental regulations prior to existing mandates, {{firm_short_name}} cannot render an opinion regarding the condition of the imported fill material or potential effects on the Subject Property's subsurface conditions.

> Consequently, should future construction activities or subgrade utility work involve excavation and off-site disposal of imported fill material, the imported fill material may require waste characterization analysis. As such, the imported fill material, if any, would be considered a business environmental risk (i.e., additional construction costs) in connection with the Subject Property.
{{/if}}

#### 4.1.4 Radon Data

{{#if radon_county_pct}}
> The Subject Property is located in {{property_address_county}} County in which {{radon_county_pct}}% of samples tested had radon levels greater than 4.0 picocuries per liter (pCi/L). The United States Environmental Protection Agency (USEPA) has set a remedial action level of 4.0 pCi/L for residences.{{#if radon_county_avg}} An average level of {{radon_county_avg}} pCi/L was detected among the samples screened.{{/if}} This screening data is included as a guide to general background conditions and should not be construed as site-specific data.
{{else}}
> Radon data for {{property_address_county}} County was not available at the time of this Report.
{{/if}}

### 4.2 Federal and State Environmental Record Sources

> Federal and State databases were reviewed by {{db_report_provider}} for recorded environmental concerns on the Subject Property and known sites within the Approximate Minimum Search Distance, as designated in the ASTM Standard E 1527-21. See Appendix C - Environmental Database Information for a copy of the database report.

**Subject Property:**

{{#if subject_property_db_listed}}
> {{subject_property_db_details}}
{{else}}
> The Subject Property was not identified on any of the databases reviewed.
{{/if}}

**Adjacent Sites:**

> {{adjacent_sites_db_findings}}

**Remaining Sites (always include):**
> Based on physical distances from the Subject Property, the remaining listed sites identified within the designated search radii should not present a readily apparent environmental concern to the Subject Property.

### 4.3 Historical Use Information

**Static opening:**
> The following reasonably obtainable sources of information were reviewed or contacted to determine the historical uses of the Subject Property. When feasible, information pertaining to the adjacent sites was reviewed.

#### 4.3.1 Historical Aerial Photographs

> Historical Aerial Photographs (Aerials) for the years {{aerial_photos_years}} were reviewed.

> {{aerial_photos_findings}}. See Appendix D, Historical Information for a copy of the Aerials reviewed.

#### 4.3.2 Historical Building Permits

{{#if building_permits_findings}}
> {{building_permits_findings}}. See Appendix D, Historical Information for a copy of the FOIA request and response.
{{else}}
> A FOIA request was submitted for building permit records; however, results were not available at the time of this writing.
{{/if}}

#### 4.3.3 Fire Department Records

{{#if fire_dept_findings}}
> {{fire_dept_findings}}. See Appendix D, Historical Information for a copy of the FOIA request.
{{else}}
> A FOIA request was submitted to the local fire protection district; however, a response had not been received at the time of this writing. {{firm_short_name}} opines this data gap is not material to the extent that would alter the Findings and Conclusions of this Report. In the event environmentally significant information is received that would alter the Findings and Conclusions of this Report, it will be promptly forwarded to the Client. See Appendix D, Historical Information for a copy of the FOIA request.
{{/if}}

#### 4.3.4 Zoning

{{#if zoning_designation}}
> According to the Zoning Map, the Subject Property is zoned within a {{zoning_designation}} District. See Appendix D, Historical Information for a copy of the Zoning Map reviewed.
{{else}}
> Zoning information for the Subject Property was not available.
{{/if}}

#### 4.3.5 Information Supplied by the Client

> {{client_supplied_info | default: "There were no environmental reports, site plans, maps or other documents relating to the Subject Property provided for review."}}

#### 4.3.6 Environmental Liens and AULs

{{#if env_liens_auls}}
> {{env_liens_details}}
{{else}}
> Neither the Client nor Subject Property representative provided {{firm_short_name}} any information regarding environmental liens or litigation regarding environmental concerns on the Subject Property. Moreover, an environmental questionnaire was completed by the Client regarding liens, AULs and for environmental documents that may have aided in the preparation of this Report. The completed environmental questionnaire identified no environmental concerns associated with the Subject Property. See Appendix A for a copy of the completed questionnaire.

> In addition, an environmental lien search for the Subject Property was conducted via review of the {{property_address_county}} County Recorder of Deeds website. There were no environmental liens or AULs recorded to the Subject Property Chain of Title. See Appendix D, Historical Information for a copy of the lien search results.
{{/if}}

#### 4.3.7 Sanborn Fire Insurance Maps

{{#if sanborn_maps_available}}
> {{sanborn_maps_findings}}. See Appendix D, Historical Information.
{{else}}
> Sanborns were ordered from {{db_report_provider}}; however, no Sanborn coverage was available for the Subject Property or immediate surrounding area. See Appendix D, Historical Information for a copy of the Certified Sanborn Map Report.
{{/if}}

#### 4.3.8 Historical City Directories

{{#if city_directory_findings}}
> {{city_directory_findings}}. See Appendix D, Historical Information for a copy of the city directory search reviewed.
{{else}}
> Historical city telephone directories were not available or not reviewed for the Subject Property.
{{/if}}

**Closing paragraph — auto-generate based on earliest known use:**
> Based on the information supplied by the Subject Property representative, Aerials and city directory search reviewed, it appears the Subject Property has been utilized for {{past_uses | condensed}} since development. {{#if earliest_use == "agricultural"}}As farmland is considered a first developed use, no additional historical sources are required to be reviewed.{{/if}}

---

## SECTION 5.0: INTERVIEWS

> The following individual(s) were interviewed and accompanied by {{firm_short_name}} for specialized knowledge concerning the Subject Property. The relevant information provided by these individuals has been incorporated in the appropriate Sections of this Report.

**Interviews table:**

| Subject Property Representative | Title/Relation to Subject Property | Years Associated with Subject Property |
|--------------------------------|-----------------------------------|---------------------------------------|
{{#each interviewees}}
| {{name}} | {{title}} | ±{{years_associated}} |
{{/each}}

{{#if former_owner_interviewed == false}}
> It should be noted, the former Subject Property owner(s)' contact information was not provided or readily ascertainable to {{firm_short_name}}; therefore, the former Subject Property owner(s) was not interviewed. {{former_owner_data_gap | default: "However, " + firm_short_name + " opines this data gap is not material to the extent that would alter the Findings and Conclusions of this Report."}}
{{/if}}

---

## SECTION 6.0: SITE RECONNAISSANCE

### Opening Paragraph

> The site reconnaissance was conducted on {{inspection_date}} at approximately {{inspection_time}} by {{inspector_name}}, {{inspector_title}}, for {{firm_short_name}} (Appendix E). The site reconnaissance was initiated by observing the Subject Property and adjacent sites from public thoroughfares, continued through the Subject Property building and concluded by walking the Subject Property boundaries. Photographic documentation of significant environmental features has been included as Appendix B.

> The weather conditions were {{weather_sky | lowercase}} with a temperature of approximately {{weather_temp_f}} degrees Fahrenheit{{#if weather_wind_mph}} and winds of approximately {{weather_wind_mph | spellOut}} ({{weather_wind_mph}}) miles per hour from the {{weather_wind_dir | lowercase}}{{/if}}. The ground surfaces were {{ground_conditions | lowercase}}.

### 6.1 Underground Storage Tanks (USTs)

{{#if usts_present}}
> {{usts_details}}
{{else}}
> There was no equipment typically associated with USTs observed on the Subject Property.
{{/if}}

### 6.2 Aboveground Storage Tanks (ASTs)/Storage Drums/Containers

{{#if asts_present}}
Generate a narrative paragraph from `asts_inventory`. Group by location. For each item:
- Spell out the quantity: "Two (2)"
- Include capacity: "275-gallon"
- Include contents: "new oil"
- Include material: "single-wall steel"
- Include type: "ASTs"

Example output pattern:
> {{asts_narrative}}. There were no signs of significant staining observed on the underlying surface around the ASTs, storage drums or containers.

**If any item has `staining_observed == true`:**
> Signs of staining were observed on the underlying surface around [specific containers]. [Assessment of significance.]

> There were no additional ASTs, storage drums or unidentified containers observed on the Subject Property.
{{else}}
> There were no ASTs, storage drums or containers observed on the Subject Property.
{{/if}}

### 6.3 Stained or Disturbed Surfaces/Stressed Vegetation

{{#if staining_present}}
> {{staining_details}}

**Auto-generate assessment based on `staining_assessment`:**

If `De_Minimis`:
> Based on the continued {{property_use_current | lowercase}} use of the Subject Property and limited area of {{staining_location}} staining, {{firm_short_name}} opines the staining presents a de minimis environmental concern associated with the Subject Property at this time.

If `Moderate_Concern` or higher — flag for EP to write custom assessment.
{{else}}
> There were no stained areas, disturbed surfaces or unusually stressed vegetation observed on the Subject Property.
{{/if}}

{{#if stressed_vegetation}}
> Unusually stressed vegetation was observed on the Subject Property. [Details from staining_details if vegetation-related content exists.]
{{else}}
> There were no {{#if staining_present}}additional stained areas, disturbed surfaces or {{/if}}unusually stressed vegetation observed on the Subject Property.
{{/if}}

### 6.4 Stormwater Run-off/Standing Water/Wetlands/Sumps/Pits/Ponds/Lagoons

> {{stormwater_description}}. There were {{#if petroleum_sheens}}petroleum sheens observed{{else}}no petroleum sheens observed{{/if}} {{#if unusual_odors_stormwater}}and unusual odors noted{{else}}or unusual odors noted{{/if}} emanating from the stormwater sewers. Moreover, there were {{#if standing_water_present}}areas of standing water observed{{else}}no areas of standing water (e.g., pools of liquid, ponds or lagoons){{/if}} {{#if wetlands_observed}}and suspect wetland vegetation observed{{else}}or suspect wetland vegetation observed{{/if}} on the Subject Property. {{#if wetlands_nwi == "No_Wetlands_Mapped"}}According to U.S. Fish and Wildlife Service (USFWS) National Wetlands Inventory Map, no wetlands were identified on the Subject Property. See Appendix D, Historical Information for a copy of the Wetlands Map reviewed.{{/if}}

### 6.5 Waste Disposal Practices

> Solid waste generated from the Subject Property is collected and transported off-site for disposal by {{solid_waste_hauler}}, as evidenced by a labeled dumpster. {{special_waste_disposal}} There were {{#if improper_disposal_evidence}}signs of improper waste disposal observed{{else}}no additional hazardous or special waste streams reported or observed being generated from{{/if}} the Subject Property.

### 6.6 Polychlorinated Biphenyls (PCBs)

{{#if transformers_present}}
> {{transformer_count | spellOut}} ({{transformer_count}}) pad-mounted electrical transformer(s) were observed on the Subject Property. The equipment {{#if transformer_pcb_sticker == "Yes_PCB"}}was observed to contain a PCBs warning sticker{{else if transformer_pcb_sticker == "Non_PCB_Sticker"}}was labeled as non-PCB{{else}}was not observed to contain a PCBs warning sticker{{/if}}. A warning sticker is required by federal regulations for equipment containing between 50 and 500 parts per million (ppm) PCBs or greater. {{transformer_owner}}, as the owner of the equipment, is responsible for keeping the equipment in compliance with federal, state and local regulations and the cleanup of contamination resulting from leaking equipment, as necessary.
{{else}}
> There were no electrical transformers observed on the Subject Property.
{{/if}}

{{#if other_pcb_equipment}}
> {{other_pcb_equipment}}
{{/if}}

### 6.7 Air Quality/Emissions

> There were {{#if unusual_odors_interior}}unusual odors noticed in{{else}}no unusual odors noticed in{{/if}} the Subject Property building {{#if unusual_odors_exterior}}and unusual odors emanating from{{else}}or emanating from{{/if}} the Subject Property. {{#if point_source_emissions}}{{point_source_details}}{{else}}Other than the Subject Property building's heating sources, the Subject Property was not identified to have other sources typically associated with point source air emissions.{{/if}}

{{#if vec_assessment == "VEC_Unlikely"}}
> This Phase I Assessment has identified neither the Subject Property nor nearby sites located within the critical distances with known releases (e.g., mismanagement, spills, leaks, and/or dumping) of hazardous materials/petroleum into the environment. Therefore, the potential for a vapor encroachment condition (VEC) to impact the Subject Property is unlikely.
{{else}}
> Based on the findings of this Phase I Assessment, the potential for a vapor encroachment condition (VEC) to impact the Subject Property is {{vec_assessment | humanize}}.
{{/if}}

### 6.8 Readily Observable Suspect Asbestos-Containing Material (ACM)

**Always include this standard introductory text:**
> ACM had been used extensively in the construction of buildings prior to 1980. According to the USEPA, ACM is commonly found in three forms: (1) sprayed or troweled-on ceilings and walls (surfacing materials), including structural fireproofing; (2) in insulation on pipes, ducts, boilers, tanks or mechanical equipment [thermal system insulation (TSI)]; and (3) in "miscellaneous materials," such as, floor tiles, roofing felts and shingles, or wall boards. ACM is of greatest potential concern when it is friable, particularly if it is damaged or deteriorated. Friable, by definition, refers to a material that, when dry, can be crumbled, pulverized or reduced to powder by hand pressure. Friable ACM is more likely than non-friable ACM to release fibers when disturbed or damaged. Airborne asbestos fibers can pose a potential respiratory health risk to building occupants who are exposed.

> Though an asbestos survey and sampling were not a part of this Phase I Assessment, the Subject Property building was inspected for the presence and condition of readily observable suspect ACM.

{{#if acm_observed}}
> The following chart summarizes readily observable suspect ACM to include, but is not limited to:

**ACM table:**

| Homogeneous Material | Location | Condition | Friable | Non-Friable |
|---------------------|----------|-----------|---------|-------------|
{{#each acm_inventory}}
| {{material}} | {{location}} | {{condition}} | {{#if friability == "Friable"}}X{{/if}} | {{#if friability == "Non_Friable"}}X{{/if}} |
{{/each}}

> {{acm_recommendation | default: "Based on the condition, location and potential for damage, " + firm_short_name + " opines the suspect ACM can be managed in-place by implementing a site-specific Operations & Maintenance (O&M) program. If future renovation activities are planned, an asbestos survey should be conducted by an accredited inspector to include those areas of the building that were previously inaccessible due to physical barriers. Subsequently, any damaged ACM and/or ACM in the affected areas should be repaired, encapsulated and/or removed as necessary by a professional asbestos abatement firm following all applicable regulations prior to any activities that have the potential to disturb ACM."}}
{{else}}
> There was no readily observable suspect ACM identified in the Subject Property building.
{{/if}}

### 6.9 Potential Lead-Based Paint

> The use of lead paint was banned in 1978. {{#if lbp_potential == "Unlikely_Post1978"}}Based on the construction date of the Subject Property building, it is unlikely for the painted surfaces to contain lead above regulatory levels.{{else if lbp_potential == "Possible_Pre1978"}}Based on the construction date of the Subject Property building (pre-1978), there is a potential for painted surfaces to contain lead-based paint. {{#if paint_condition}}The painted surfaces were observed to be in {{paint_condition | lowercase}} condition.{{/if}} {{lbp_details}}{{else if lbp_potential == "Likely_Pre1978"}}Based on the construction date of the Subject Property building (pre-1978) and the {{paint_condition | lowercase}} condition of painted surfaces, there is a likelihood that lead-based paint is present. A lead-based paint survey is recommended prior to any renovation or demolition activities.{{/if}}

### 6.10 Miscellaneous Equipment

{{#if fluorescent_lights || mercury_thermostats}}
> The fluorescent bulbs{{#if mercury_thermostats}} and thermostats{{/if}} observed throughout the Subject Property building contain mercury and are classified as universal waste under Title 40 CFR Part 273, Standards for Universal Waste Management. Should future plans involve the repair, removal or disposal of the fixtures, proper procedures and precautions should be followed regarding the bulbs{{#if mercury_thermostats}} and thermostats{{/if}}.
{{/if}}

{{#if cfc_equipment}}
> Air-conditioning units are located on the Subject Property. This equipment contains chlorofluorocarbon (CFC) refrigerant. CFC is a federally regulated substance that is known to contribute to ozone depletion within the atmosphere. In the event that the equipment is repaired or removed from the premises, the CFC, if present, should be recovered.
{{/if}}

{{#if misc_equipment_details}}
> {{misc_equipment_details}}
{{/if}}

### 6.11 Biological Hazards/Mold

{{#if mold_evidence}}
> {{mold_details}}
{{else}}
> There was no visual or olfactory evidence of potential microbiological hazards (e.g., excessive mold growth) observed in the Subject Property building.
{{/if}}

### 6.12 Emerging Contaminants

**Always include this standard introductory text:**
> As defined in Section 3.2.36 of the current ASTM Standard E1527, hazardous substance means "those substances defined as a hazardous substance pursuant to CERCLA 42 USC §9601(14), as interpreted by EPA regulations." Per- and polyfluoroalkyl substances (PFAS) are synthetically made chemical compounds which are widely used in industrial processes and consumer products (e.g., food containers, cookware, cleaning products, firefighting foams, repellents). PFAS are transported through air emissions, which then get deposited onto the surface and leach into soil and groundwater and/or get transported offsite as solid waste and are disposed of in landfills. Two common PFAS are perfluorooctane sulfonate (PFOS) and perfluorooctanoic acid (PFOA).

{{#if pfas_evidence}}
> {{pfas_details}}
{{else}}
> As there has been no documentation indicating PFAS were utilized on the Subject Property, and based on the lack of reported releases, evidence has not been identified to indicate the potential presence of significant concentrations of PFAS on the Subject Property.
{{/if}}

> Given the evolving nature of science and regulatory oversight of PFAS, additional sources of PFAS contamination and/or emerging contaminants which are not identified as a hazardous substance by CERCLA may exist.

### 6.13 Observations of Surrounding Sites

{{#if surrounding_concerns}}
> {{surrounding_details}}
{{else}}
> There were no recognizable environmental concerns visually identified on the immediate surrounding sites as observed from the Subject Property and public right-of-ways.
{{/if}}

---

## SECTION 7.0: FINDINGS AND CONCLUSIONS

> {{firm_short_name}} has performed a Phase I Environmental Property Assessment in conformance with the scope and limitations of ASTM Standard E 1527-21 and according to the standards and practices set forth in 40 CFR Part 312 for the Subject Property. Any exceptions to, or deletions from these practices are described in Section 2.3 of this Report.

{{#if recs_identified}}
> This Phase I Assessment has identified the following recognized environmental conditions (RECs) in connection with the Subject Property:
{{#each recs_list}}
> - {{this}}
{{/each}}
> Further investigation is warranted.
{{else}}
> This Phase I Assessment has identified no evidence of recognized environmental conditions (RECs) in connection with the Subject Property. No further investigation is warranted at this time.
{{/if}}

{{#if crecs_identified}}
> The following controlled recognized environmental conditions (CRECs) have been identified:
{{#each crecs_list}}
> - {{this}}
{{/each}}
{{/if}}

{{#if hrecs_identified}}
> The following historical recognized environmental conditions (HRECs) have been identified:
{{#each hrecs_list}}
> - {{this}}
{{/each}}
{{/if}}

---

## SECTION 8.0: WARRANTY AND LIMITATIONS OF LIABILITY

**Static text — do not vary (substitute firm name only):**

> The Phase I Assessment and this Report are of limited scope, and do not provide sufficient information to eliminate the total risk of the presence of contamination or other liabilities. Significantly higher levels of exploratory efforts than those performed in this Phase I Assessment are required to accumulate sufficient information to determine all environmental liabilities associated with the Subject Property. Subsurface investigations and testing were beyond the scope of this Phase I Assessment.

> {{firm_short_name}} warrants that the Phase I Assessment has been conducted in accordance with generally accepted investigatory methods utilized by professional environmental consultants and includes the recommended practices for the "Phase I Environmental Site Assessment Process" contained in the ASTM Standard E 1527-21. {{firm_short_name}} further warrants that the findings and conclusions in this Report are based exclusively on the Phase I Assessment. The investigatory methods that {{firm_short_name}} utilized in the Phase I Assessment have been developed to provide the Client with information regarding apparent indications of existing or potential environmental conditions relating to the Subject Property and are limited to the conditions that were observed at the time of the investigation of the Subject Property. The Findings and Conclusions contained in this Report are also limited to the information available on the Subject Property at the time that the Phase I Assessment was conducted. There is a distinct possibility that conditions may exist at the Subject Property, which were not apparent during the preparation of the Phase I Assessment. In conducting the Phase I Assessment and preparing the Report, {{firm_short_name}} relied on the information obtained from Subject Property owner/operators or other persons, and government agencies having knowledge of operations and practices of the Subject Property. {{firm_short_name}} has assumed that this information is accurate and complete, except when independent investigation has indicated otherwise.

> The Phase I Assessment did not attempt to determine whether the facilities operating on the Subject Property are in compliance with existing environmental regulations. This Report discusses and summarizes areas of potential environmental concern for the Subject Property itself. This Report provides no other warranties, expressed or implied.

### 8.1 Confidentiality

> {{firm_short_name}} will hold the Report and all field observations and related documents in strict confidence and will not disclose these items except to the Client or except as ordered by any state or federal agency or court of law. In the event that {{firm_short_name}} is ordered by a state or federal agency or court of law to disclose the contents of the Report or field observations, the Client shall hold {{firm_short_name}} harmless from liability for any damages that the Client may suffer due to {{firm_short_name}}'s disclosure. In addition, the Client shall indemnify {{firm_short_name}} from any and all damages {{firm_short_name}} may suffer due to any action, which results in an order that {{firm_short_name}} make a disclosure.

### 8.2 Reliance on Phase I Assessment and Report

> The Phase I Assessment has been conducted, and this Report has been prepared, exclusively for the Client and it is intended that only the Client will rely on the Phase I Assessment and Report. The Phase I Assessment and Report will be solely for the benefit of the Client and may not be relied upon by other parties.

### 8.3 Sources of Information Relied Upon

> All information that {{firm_short_name}} has relied on in conducting the Phase I Assessment and preparing the Report, not specifically identified as generated by {{firm_short_name}} or any federal, state, or local agency, has been supplied by or derived from data provided by the Client and Subject Property representatives.

### 8.4 Certification

> We, {{ep_names | joinAnd}}, declare that, to the best of our professional knowledge and belief, we meet the definition of Environmental Professional as defined in 40 CFR Part 312. We have the specific qualifications based on education, training, and/or experience to assess a property of this nature, history, and setting similar to the Subject Property. We have developed and performed all appropriate inquiries in conformance with the standards and practices set forth in 40 CFR Part 312.

> To the best of any information and belief, the facts stated in the Report are true and are made under a penalty of perjury as defined in applicable state statute. It is perjury for any person to sign an audit report that contains a false material statement that the person does not believe to be true.

---

## FIGURES

Each on a separate page:

- **Figure 1 — Subject Property Location Map**: Generated from `{{site_location_map}}` or auto-generated from `{{property_geolocation}}` using a map service. Show property marker with surrounding streets and landmarks.
- **Figure 2 — Subject Property Sketch**: From `{{site_sketch}}`. If not provided, auto-generate from building footprint + grounds description.
- **Figure 3 — Topographic Map**: From `{{topographic_map}}`. Auto-sourced from USGS based on coordinates if not uploaded.

---

## APPENDICES

### Appendix A — Proposal Between the Client and {{prepared_by_firm}}
Insert `{{proposal_agreement}}` and `{{env_questionnaire}}` if available.

### Appendix B — Photographic Documentation
Insert all photos from `{{photo_documentation}}`. Each photo gets:
- Auto-generated caption based on narration context at capture time
- Photo number (sequential)
- Two photos per page in a 2x1 grid layout
- Caption below each photo in 9pt font

### Appendix C — Environmental Database Information
Insert all pages from `{{edr_report}}`.

### Appendix D — Historical Information
Insert in order:
1. `{{historical_aerials}}` — with year labels
2. `{{foia_responses}}` — building permits, fire department
3. Zoning map (if captured as photo)
4. Wetlands map (if captured)
5. Lien search results (if captured)
6. Sanborn map report (if captured)
7. City directory pages (if captured)

### Appendix E — {{prepared_by_firm}} Qualifications
Operator-uploaded firm qualification document. Static per firm — stored at the operator account level, not per-inspection.

---

## Document Formatting Specifications

| Element | Specification |
|---------|--------------|
| Font — Body | Times New Roman, 12pt |
| Font — Headings | Times New Roman, Bold |
| Section Numbers | Bold, same font as body |
| Margins | 1" all sides |
| Line Spacing | Single-spaced, with 6pt spacing after paragraphs |
| Page Numbers | Bottom-center, starting from Section 1.0 (not cover letter or title page) |
| Tables | Full borders, header row shaded light gray, 10pt font |
| Photos | Max width 3.25" each in 2-column layout, 300dpi minimum |
| Headers | Firm name left-aligned, project number right-aligned (starting Section 1.0) |
| Footers | Page number center, "Confidential" right-aligned |

---

## Template Helper Functions

| Function | Description | Example |
|----------|-------------|---------|
| `spellOut` | Number to words | `2` → `Two (2)` |
| `commaFormat` | Number with commas | `26219` → `26,219` |
| `lowercase` | Lowercase string | `Commercial` → `commercial` |
| `joinAnd` | Array to "A and B" or "A, B, and C" | `["Sam", "Nick"]` → `Sam and Nick` |
| `default` | Fallback if empty | `{{field \| default: "Not provided"}}` |
| `humanize` | Enum to readable text | `VEC_Unlikely` → `unlikely` |
| `condensed` | Long text to comma-separated summary | Full history → `agricultural, commercial` |
