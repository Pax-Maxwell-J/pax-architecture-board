# Phase I ESA — AI Field Extraction Instructions

Reference schema: `phase1-esa-schema.json`

This document tells the ExtractionEngine how to map continuous narration and photos from a DirectedNarration CaptureSession into the Phase I ESA Schema fields. The inspector sees all fields on-screen while speaking. As they narrate, the system fills fields in real-time via the on-device Coverage Detector, then runs full extraction on the backend after sync.

---

## How This Works

The inspector opens the app, sees every field grouped by section. They walk the property and talk. They don't need to address fields in order — the AI listens to the full narration stream and routes content to the correct field based on semantic meaning. Photos are captured inline and attached to whichever field the inspector is contextually discussing.

**On-device (Coverage Detector):** Lightweight semantic matching. Marks fields as `covered` / `not_covered` in real-time so the inspector can see what they've missed. No values extracted — just topic detection.

**Backend (ExtractionEngine):** Full extraction after CaptureSession sync. Produces FieldExtractions with values and confidence scores.

---

## Section: Subject Property Identification

### `property_address_street`
The street number and street name of the subject property. Listen for "the property is at...", "the address is...", "located at...", or any statement of a street address. Extract the full street portion only (no city/state).

### `property_address_city`
The city, village, or town. Listen for "in the city of...", "village of...", "town of...", or the city name following a street address.

### `property_address_county`
The county. Listen for "...County" anywhere in narration. If not stated, attempt geocode inference from the street address and city.

### `property_address_state`
The US state. Listen for the state name or abbreviation after the city. Normalize to full state name.

### `property_address_zip`
ZIP code. Extract if stated. If not narrated, leave empty — do not guess.

### `property_geolocation`
Auto-captured from device GPS at CaptureSession start. No narration extraction needed.

### `property_use_current`
What the property is currently used for at the broadest level. Listen for "commercial property", "industrial site", "residential", "vacant lot", "mixed-use". Map to the closest Enum value. If the inspector describes a specific business (e.g., "auto repair shop"), infer `Commercial`.

### `parcel_number`
Tax parcel or property index number. Listen for "parcel number", "PIN", "index number", or a string of digits with hyphens that follows those keywords. Often not narrated — typically entered by operator.

### `legal_description`
Formal legal description (lot, block, subdivision). Rarely narrated. Flag as data gap if not provided by operator.

### `zoning_designation`
Zoning code or classification. Listen for "zoned as...", "zoning is...", or alphanumeric codes like "L-1", "C-2", "R-1". May come up during records review narration rather than on-site.

### `location_description`
Relative location using landmarks. Listen for "located on the south side of...", "approximately half a mile from...", "north of the expressway", "west of Route 45". Capture the full relative description.

---

## Section: Property Physical Description

### `land_area_sf`
Total land area in square feet. Listen for "approximately X square feet" or "X acres." If stated in acres, convert: 1 acre = 43,560 sf. If stated with ± prefix, strip it and use the number.

### `land_shape`
The shape of the parcel. Listen for "rectangular", "irregular shaped", "L-shaped", "triangular." If not stated, leave empty.

### `num_structures`
Count of buildings/structures on the property. Listen for "one building", "two structures", "no structures" (vacant). Also listen for "developed with a..." to count.

### `num_stories`
Number of stories for the primary structure. Listen for "one-story", "two-story", "single story with mezzanine." If mezzanine is mentioned, still count the primary stories (e.g., "one-story" even with mezzanine — note mezzanine in `building_layout`).

### `construction_date`
Year the structure was built. Listen for "built in 1994", "circa 19XX", "approximately X years old" (compute: current year minus X). Preserve "circa" qualifier if used.

### `construction_type`
Building materials and foundation. Listen for structural material descriptions: "masonry and steel", "wood frame", "concrete block", "metal building." Also capture foundation: "concrete slab", "crawl space", "basement."

### `gross_building_area_sf`
Building footprint in square feet. Listen for "totaling approximately X square feet" or "X square foot building." If ± prefix, strip and use the number.

### `building_layout`
How the building is divided internally. Listen for "divided into office areas and shop areas", "warehouse and office", "open floor plan", "mezzanine storage." Capture the functional zone descriptions.

### `interior_finishes`
Materials for floors, walls, and ceilings in each area. Listen for:
- Floors: "concrete", "carpet", "tile", "wood laminate", "epoxy"
- Walls: "gypsum board", "masonry", "drywall", "paneling"
- Ceilings: "drop panels", "steel deck", "exposed", "gypsum"

Capture by area type (e.g., "office: carpet floors, drywall walls; shop: concrete floors, masonry walls").

### `hvac_description`
Heating and cooling systems. Listen for "heated by natural gas", "HVAC units", "suspended heater", "not mechanically cooled", "electric heat", "rooftop units."

### `remaining_grounds`
Everything outside the building footprint. Listen for "asphalt paved parking", "gravel yard", "concrete pad", "grass", "landscaping", "storage yard", "fenced area." Capture location relative to building (north, south, etc.).

### `remaining_grounds_photos`
Photos of parking areas, yards, landscaping. Match photos taken while the inspector is describing grounds features.

### `potable_water_source`
Where drinking water comes from. Listen for "city water", "municipal water", "well water", "private well." Map: "city/municipal/village supplies water" → `Municipal`; "well on property" → `Private_Well`.

### `potable_water_supplier`
The specific utility or municipality. Listen for the name after "supplied by..." or "water from..."

### `monitoring_wells_present`
Whether groundwater monitoring wells exist on-site. Listen for "monitoring wells" or "groundwater wells." If the inspector says "no monitoring wells observed" or doesn't mention them, set `false`.

### `wastewater_system`
How wastewater leaves the property. Listen for "sanitary sewer", "septic system", "combined sewer." Map: "separate sewer systems" → `Municipal_Sewer`; "septic tank" → `Septic`.

### `stormwater_system`
How stormwater is managed. Listen for "storm sewers", "retention pond", "combined sewer", "surface drainage."

### `septic_system_present`
Explicit Boolean. Listen for "septic" anywhere. If "no septic systems" → `false`. If no mention at all, default `false`.

### `floor_drains_present`
Whether floor drains exist in the building. Listen for "floor drains" in shop or work areas.

### `floor_drain_discharge`
Where floor drains go. Listen for "discharge into a triple-trap", "connected to sanitary sewer", "oil-water separator." Only populate if `floor_drains_present` is true.

---

## Section: Current and Past Uses

### `current_tenant_name`
The name of the business or person currently occupying the property. Listen for a business name stated in context of "currently occupied by..." or "the tenant is..."

### `current_operations`
What the current occupant does. Listen for activity descriptions: "automobile repair", "warehousing", "office space", "manufacturing." Capture the full description of operations.

### `hazmat_on_site`
All hazardous materials and petroleum products present. Listen for chemical names: "motor oil", "lubricants", "antifreeze", "solvents", "paints", "pesticides", "acids." If "none observed", set value to "None observed."

### `special_waste_generated`
Regulated waste streams. Listen for "used oil", "used antifreeze", "solvents", "hazardous waste." Capture the waste type and how it's managed (recycled, hauled, etc.).

### `housekeeping_assessment`
Overall cleanliness and organization. Listen for "housekeeping appeared satisfactory", "poor housekeeping", "well maintained", "disorganized." Map to `Satisfactory`, `Unsatisfactory`, or `Mixed`.

### `past_uses`
Chronological history of the property. Listen for "previously used as...", "historically farmland", "used to be a gas station." Capture in order from oldest to most recent.

### `past_uses_sources`
What sources confirmed the history. Listen for "according to the aerial photographs", "city directories show", "the owner stated."

### `adjacent_north` / `adjacent_south` / `adjacent_east` / `adjacent_west`
What's on each side of the property. Listen for directional language: "to the north is...", "south of the property...", "on the east side..." Extract the current use and address if given for each direction.

### `adjacent_past_uses`
Historical uses of surrounding properties if mentioned.

---

## Section: Records Review

### `topography_description`
Terrain and elevation around the property. Listen for "flat terrain", "slopes to the south", "five foot decrease within...", references to USGS topo maps.

### `geology_description`
Soil and geology type. Listen for "glacial till", "clay and silt", "sand", "Lake Plain", "bedrock depth." Often narrated when reviewing ISGS reports.

### `aquifer_vulnerability`
Susceptibility of groundwater to contamination. Listen for rating codes like "C1", "A1" or descriptions of permeability and bedrock depth.

### `radon_county_pct`
Percentage of county radon samples above 4.0 pCi/L. Listen for "X percent of samples had radon levels greater than..."

### `radon_county_avg`
Average radon level in the county. Listen for "average level of X pCi/L."

### `fill_material_status`
Whether imported fill was documented. Listen for "no documentation regarding fill material" → `Undocumented`. "Clean fill documented" → `Documented_Clean`. No mention → `Unknown`.

### `db_report_provider`
Who provided the database search. Listen for "Environmental Data Resources" or "EDR." Often stated once.

### `subject_property_db_listed`
Whether the subject property appears on any environmental database. Listen for "the subject property was not identified on any databases" → `false`. Any specific listing → `true`.

### `subject_property_db_details`
If listed, what databases and what the listing says. Extract database name (RCRA, LUST, CERCLIS, etc.) and the nature of the listing.

### `adjacent_sites_db_findings`
Database findings for nearby sites. Listen for mentions of adjacent addresses on RCRA, LUST, or other databases. Capture: site name, address, database, type of listing, and the inspector's assessment of whether it presents concern.

### `aerial_photos_years`
Which years of aerial photographs were reviewed. Listen for "aerials for the years 1938, 1951, 1955..." Capture the comma-separated list.

### `aerial_photos_findings`
What the aerials showed. Listen for "depicted as farmland on the 1938 through 1970 aerials", "developed with structures on the 1994 aerial", "no evidence of disturbances."

### `building_permits_findings`
Results from building department FOIA. Listen for "no records of environmental significance" or specific permit findings.

### `fire_dept_findings`
Results from fire department FOIA. Listen for response details or "response not received" (flag as data gap).

### `sanborn_maps_available`
Whether Sanborn fire insurance maps exist for the area. Listen for "no Sanborn coverage available" → `false`.

### `sanborn_maps_findings`
What the Sanborns show, if available.

### `city_directory_findings`
Business listings found at the property address. Listen for business names and years. Flag any environmentally significant listings: gas stations, dry cleaners, chemical companies.

### `env_liens_auls`
Whether environmental liens or activity/use limitations were found. Listen for "no environmental liens" → `false`. Any recorded liens → `true`.

### `env_liens_details`
Details of any liens or AULs found.

### `client_supplied_info`
What documents or information the client provided. Listen for "no environmental reports provided" or list of documents received.

---

## Section: Interviews

### `interviewees`
Array of people interviewed. For each person, extract:
- **name**: Listen for the person's name in interview context
- **title**: Listen for "owner", "property manager", "tenant", "maintenance supervisor"
- **years_associated**: Listen for "X years" or "since YYYY"

### `interview_findings`
Anything environmentally relevant stated during interviews. Listen for statements about spills, past operations, underground tanks, chemical use.

### `former_owner_interviewed`
Whether previous owners were contacted. Listen for "former owner was not interviewed" → `false`.

### `former_owner_data_gap`
If former owner wasn't interviewed, explain why and assess materiality. Listen for "contact information was not provided" and "this data gap is not material."

---

## Section: Site Reconnaissance — Metadata

### `inspection_date`
The date of the site visit. Listen for "today is..." or "inspection conducted on..." Also auto-capture from CaptureSession timestamp.

### `inspection_time`
Start time. Listen for "at approximately 7 AM" or similar. Also auto-capture.

### `inspector_name` / `inspector_title`
Auto-populated from Participant profile. No extraction needed.

### `weather_sky`
Sky conditions. Listen for "overcast", "sunny", "clear", "partly cloudy", "raining."

### `weather_temp_f`
Temperature in Fahrenheit. Listen for "approximately X degrees" or "temperature of X."

### `weather_wind_mph`
Wind speed. Listen for "winds of X miles per hour" or "calm winds."

### `weather_wind_dir`
Wind direction. Listen for "from the north", "southwesterly", "calm."

### `ground_conditions`
Surface wetness. Listen for "ground surfaces were dry", "wet conditions", "snow covered."

---

## Section: Site Reconnaissance — USTs

### `usts_present`
Whether underground storage tanks or their indicators exist. Listen for "fill pipes", "vent pipes", "dispensers", "monitoring wells associated with USTs", or "no equipment typically associated with USTs."

### `usts_details`
If present: number of USTs, size (gallons), contents, material, registration status, condition. If indicators only (fill pipe but no confirmed tank), describe what was observed.

### `usts_photos`
Photos of UST indicators — fill pipes, vent pipes, dispensers, monitoring wells, or the area where they would be.

---

## Section: Site Reconnaissance — ASTs / Drums / Containers

### `asts_present`
Whether any aboveground tanks, drums, or chemical containers are on-site. Listen for "275-gallon tank", "55-gallon drums", "parts washer", "compressed gas cylinders", "containers of..." or "no ASTs observed."

### `asts_inventory`
For each container mentioned, extract a structured entry:
- **container_type**: Classify — AST, 55-gallon drum, tote, parts washer, compressed gas, household container
- **quantity**: How many of this type. Listen for "two 275-gallon tanks" → quantity: 2
- **capacity_gal**: Size in gallons. Listen for "275-gallon", "500-gallon", "55-gallon"
- **contents**: What's inside. Listen for "new oil", "used oil", "antifreeze", "soap", "empty"
- **material**: Tank/drum material. Listen for "single-wall steel", "double-wall", "poly"
- **location**: Where on the property. Listen for "in the shop area", "north exterior wall", "storage room"
- **staining_observed**: Whether staining exists underneath. Listen for "no signs of staining" → `false`

### `asts_photos`
Photos of each significant container, labels, and any staining around them.

---

## Section: Site Reconnaissance — Staining / Disturbance / Vegetation

### `staining_present`
Whether stained surfaces or disturbed ground were observed. Listen for "staining on the concrete", "stained gravel", "disturbed soil", "discolored surface", or "no stained areas observed."

### `staining_details`
Location, surface type (concrete, gravel, soil), extent (limited, widespread), and condition of underlying surface. Listen for "concrete appeared generally sound and intact" or "cracking in the stained area."

### `staining_assessment`
Significance level. Listen for "de minimis concern" → `De_Minimis`. "Environmental concern" without de minimis → `Moderate_Concern` or higher. If the inspector calls it a REC → `REC`.

### `stressed_vegetation`
Unusual plant stress. Listen for "dead vegetation", "stressed vegetation", "discolored grass", or "no unusual vegetation."

### `staining_photos`
Photos of any stained or disturbed areas, including context of surrounding surface condition.

---

## Section: Site Reconnaissance — Stormwater / Standing Water / Wetlands

### `stormwater_description`
How stormwater is collected and where it goes. Listen for "stormwater sewers in the parking areas", "sheet flow to the east", "retention basin."

### `petroleum_sheens`
Sheens visible in storm drains or surface water. Listen for "no petroleum sheens" → `false`, or "sheen observed in the catch basin" → `true`.

### `unusual_odors_stormwater`
Odors from drains or surface water. Listen for "no unusual odors from the stormwater" → `false`.

### `standing_water_present`
Pools, ponds, lagoons on-site. Listen for "no standing water" → `false`, or descriptions of pooled water.

### `wetlands_observed`
Wetland indicator plants on-site. Listen for "no suspect wetland vegetation" → `false`, or "cattails", "wetland species observed."

### `wetlands_nwi`
National Wetlands Inventory status. Listen for "according to the NWI map, no wetlands" → `No_Wetlands_Mapped`.

### `stormwater_photos`
Photos of drain inlets, outfalls, surface water, any sheens.

---

## Section: Site Reconnaissance — Waste Disposal

### `solid_waste_hauler`
Company name on dumpsters. Listen for "Waste Management", "Republic Services", or dumpster company name. Also extractable from photos of labeled dumpsters.

### `special_waste_disposal`
How regulated waste is handled. Listen for "used oil recycled by Safety Kleen", "hazardous waste picked up by Clean Harbors", "disposed through licensed hauler."

### `improper_disposal_evidence`
Signs of unauthorized dumping or disposal. Listen for "open burning", "dumping observed", "waste piles", or "no evidence of improper disposal" → `false`.

### `waste_photos`
Photos of dumpsters, waste storage areas, recycling containers.

---

## Section: Site Reconnaissance — PCBs

### `transformers_present`
Electrical transformers on or adjacent to the property. Listen for "pad-mounted transformer", "pole-mounted transformer", or "no transformers observed."

### `transformer_count`
How many transformers. Extract the count.

### `transformer_pcb_sticker`
PCB labeling status. Listen for:
- "PCB warning sticker" → `Yes_PCB`
- "no PCB sticker" / "not observed to contain a PCBs warning sticker" → `No_Sticker`
- "non-PCB sticker" → `Non_PCB_Sticker`
- "sticker not visible" / "could not be read" → `Not_Visible`

### `transformer_owner`
Who owns the transformer. Listen for "ComEd", "the utility company", "property owner."

### `transformer_leaking`
Staining or leaks around the transformer. Listen for "no signs of leakage" → `false`.

### `other_pcb_equipment`
Older hydraulic equipment, capacitors, or large electrical gear that may contain PCBs. Listen for "air compressors" and their age — newer equipment is unlikely to contain PCBs.

### `pcb_photos`
Photos of transformers, labels, stickers, surrounding ground.

---

## Section: Site Reconnaissance — Air Quality / Emissions

### `unusual_odors_interior`
Odors inside the building. Listen for "no unusual odors in the building" → `false`, or specific odor descriptions (chemical, solvent, fuel).

### `unusual_odors_exterior`
Odors outside. Listen for "no unusual odors emanating from the property" → `false`.

### `point_source_emissions`
Exhaust stacks, vents, or emission sources beyond HVAC. Listen for "other than heating sources, no point source emissions" → `false`.

### `point_source_details`
What the emission source is, if present.

### `vec_assessment`
Vapor encroachment condition assessment. Listen for:
- "potential for VEC is unlikely" → `VEC_Unlikely`
- "vapor encroachment possible" → `VEC_Possible`
- Any mention of known releases nearby impacting the property → `VEC_Likely` or `VEC_Confirmed`

---

## Section: Site Reconnaissance — Asbestos (ACM)

### `acm_observed`
Whether suspect asbestos-containing materials were observed. Listen for any mention of "suspect ACM", "asbestos", specific suspect materials (9x9 floor tiles, pipe insulation, transite panels), or "no suspect ACM observed."

### `acm_inventory`
For each suspect material, extract:
- **material**: What it is — "wallboard system", "2x2 drop-ceiling panels", "9x9 floor tiles", "roofing materials", "pipe insulation", "transite siding"
- **location**: Where in the building — "throughout building", "office areas", "roof", "boiler room"
- **condition**: Physical state — `Good` (intact, no damage), `Fair` (minor wear), `Poor` (deteriorating), `Damaged` (broken, crumbling), `Not_Observed` (e.g., roof material not accessed)
- **friability**: Whether it crumbles under hand pressure. General rules:
  - Friable: spray-on fireproofing, pipe insulation, acoustical plaster
  - Non-Friable: floor tiles, roofing, transite, intact wallboard, ceiling panels

### `acm_recommendation`
Management suggestion. Listen for "managed in-place with O&M program", "removal recommended prior to renovation", "survey recommended."

### `acm_photos`
Photos of each suspect material in context.

---

## Section: Site Reconnaissance — Lead-Based Paint

### `lbp_potential`
Based on building age vs. 1978 ban. Auto-infer from `construction_date`:
- Built 1978 or later → `Unlikely_Post1978`
- Built before 1978 → `Possible_Pre1978`
- Built before 1950 with deteriorated paint → `Likely_Pre1978`
- Testing confirms → `Confirmed`

### `paint_condition`
Visual condition of painted surfaces. Listen for "good condition", "peeling paint", "chipping", "deteriorated."

### `lbp_details`
Any additional context about painted surfaces or LBP concerns.

---

## Section: Site Reconnaissance — Miscellaneous Equipment

### `fluorescent_lights`
Whether fluorescent bulbs (contain mercury) are present. Listen for "fluorescent bulbs" or "LED lighting" (LEDs = no mercury concern).

### `mercury_thermostats`
Whether mercury-type thermostats are present. Listen for "thermostats" and whether mercury or digital.

### `cfc_equipment`
Air conditioning or refrigeration with CFC refrigerants. Listen for "air-conditioning units", "refrigeration equipment", "CFC", "R-22."

### `misc_equipment_details`
Additional detail on any regulated equipment.

---

## Section: Site Reconnaissance — Biological Hazards / Mold

### `mold_evidence`
Visual or olfactory signs of mold. Listen for "no visual or olfactory evidence of mold" → `false`, or "water staining", "musty odor", "visible mold growth" → `true`.

### `mold_details`
Location, extent, and type of mold/moisture issue observed.

### `mold_photos`
Photos of mold, water staining, moisture damage.

---

## Section: Site Reconnaissance — Emerging Contaminants (PFAS)

### `pfas_evidence`
Signs of PFAS use on the property. Listen for "PFAS", "AFFF", "firefighting foam", "Teflon manufacturing", "chrome plating", or "no documentation indicating PFAS were utilized" → `false`.

### `pfas_details`
What PFAS source was identified, if any.

---

## Section: Site Reconnaissance — Surrounding Sites

### `surrounding_concerns`
Environmental concerns visible on neighboring properties from the boundary. Listen for "no recognizable environmental concerns on surrounding sites" → `false`, or descriptions of drums, staining, tanks, distressed vegetation on adjacent properties.

### `surrounding_details`
What was observed and on which adjacent site.

### `surrounding_photos`
Photos of any concerns visible on neighboring properties.

---

## Section: Findings and Conclusions

> These fields are AI-proposed, EP-confirmed. The ExtractionEngine analyzes all preceding sections and proposes findings. The Environmental Professional reviews and confirms/edits on the Contract Review Screen.

### `recs_identified` / `recs_list`
Recognized Environmental Conditions. AI should flag as potential REC if any of these are found:
- Confirmed releases (spills, leaks) of hazardous substances
- LUST listings on or adjacent to the property with plume migration potential
- USTs with unknown contents or status
- Staining assessed above `De_Minimis`
- Active hazardous waste violations on adjacent sites within influence distance

### `crecs_identified` / `crecs_list`
Controlled RECs. Past releases that have been addressed but have residual contamination with institutional/engineering controls. Look for AULs, deed restrictions, or remediation with monitoring.

### `hrecs_identified` / `hrecs_list`
Historical RECs. Past releases that have been fully remediated with regulatory closure. Look for closed LUST cases, NFR letters, completed cleanups in database records.

### `data_gaps_identified` / `data_gaps_list`
Missing information that could affect findings. Auto-flag:
- FOIA responses not received
- Former owners not interviewed
- Areas not accessible during inspection
- Required fields with no coverage

### `further_investigation`
Set `true` if any RECs identified. May also be `true` for significant data gaps.

### `findings_summary`
AI-generated summary paragraph. Should state whether RECs/CRECs/HRECs were or were not identified, and whether further investigation is warranted. EP reviews and edits for final wording.

### `business_env_risks`
Non-REC concerns: ACM management, LBP potential, regulated equipment, fill material costs, universal waste. These are reported separately from RECs.

---

## Photo Extraction Rules

When a photo is captured during the CaptureSession:
1. Timestamp and GPS are automatically recorded
2. The photo is associated with whatever field the inspector is currently discussing (based on the last 30 seconds of narration context)
3. AI generates an auto-caption from the photo contents + narration context
4. If the photo contains readable text (labels, signs, stickers), OCR extracts it and attaches as metadata
5. Photos of labeled containers populate `asts_inventory` fields (read label → contents, capacity)
6. Photos of transformers populate `transformer_pcb_sticker` (read sticker text)
7. Photos of dumpsters populate `solid_waste_hauler` (read company name)

---

## Conflict Resolution

If the inspector contradicts themselves (e.g., says "no floor drains" then later says "the floor drains discharge to..."), apply the conflict resolution strategy:
1. **LatestWins** — default for most fields. The later statement is presumed to be the correction.
2. **FlagForHuman** — used for REC-significant fields (`usts_present`, `staining_assessment`, `recs_identified`). Both values are preserved and flagged for EP review.

---

## Coverage Detector Keywords

The on-device Coverage Detector uses lightweight keyword matching to mark fields as covered. These are the trigger phrases per section (not exhaustive — the detector uses semantic similarity, not exact match):

| Section | Trigger Phrases |
|---------|----------------|
| Property ID | "address", "located at", "city of", "county", "state of" |
| Physical Description | "square feet", "acres", "stories", "built in", "constructed", "foundation", "parking", "water source" |
| Current/Past Uses | "currently used", "occupied by", "tenant", "hazardous materials", "previously", "historically", "to the north/south/east/west" |
| Records Review | "database", "EDR", "aerial", "Sanborn", "directory", "FOIA", "lien", "topography", "geology", "radon" |
| Interviews | "interviewed", "spoke with", "owner stated", "property manager said" |
| Recon — USTs | "underground", "UST", "fill pipe", "vent pipe", "dispenser" |
| Recon — ASTs | "aboveground", "AST", "drum", "container", "tank", "gallon", "parts washer" |
| Recon — Staining | "staining", "stained", "disturbed", "stressed vegetation", "discolored" |
| Recon — Stormwater | "stormwater", "standing water", "wetland", "pond", "lagoon", "sheen" |
| Recon — Waste | "waste", "dumpster", "disposal", "recycling", "hauler" |
| Recon — PCBs | "transformer", "PCB", "capacitor", "hydraulic" |
| Recon — Air | "odor", "smell", "emissions", "exhaust", "vapor encroachment" |
| Recon — ACM | "asbestos", "ACM", "ceiling tile", "floor tile", "pipe insulation", "roofing", "friable" |
| Recon — LBP | "lead", "paint", "1978", "chipping", "peeling" |
| Recon — Misc | "fluorescent", "mercury", "thermostat", "CFC", "refrigerant" |
| Recon — Mold | "mold", "mildew", "musty", "water damage", "biological" |
| Recon — PFAS | "PFAS", "PFOS", "PFOA", "AFFF", "firefighting foam" |
| Recon — Surrounding | "surrounding", "neighboring", "adjacent sites observed" |
