# Genealogy Guide — Product & Feature Roadmap

This document records the planned product direction for Genealogy Guide. Features should preserve the app's evidence-first philosophy: the tree stores claims, sources explain why a claim is believed, and Kinley helps the researcher investigate rather than inventing conclusions.

## Product principles

- Never invent an ancestor to fill a gap.
- A surname match is not proof of a relationship.
- Separate documented facts, hypotheses, and unresolved questions.
- Prefer original records and authoritative repositories when available.
- Every important conclusion should be traceable to evidence.
- Imported tree data is user-provided context until independently verified.
- Geographic migration paths must distinguish documented locations from inferred routes.
- Kinley is a helper and research coach, not the final authority.

## 1. Research Center

### Smart Research Workspace
A research session should contain:
- Research question
- Person/family being investigated
- Known facts
- Unknowns
- Evidence collected
- Contradictions
- Records to search
- Search strategy
- Research log
- Findings
- Next steps
- How to repeat the research independently

### Specialized Kinley modes
- Research
- Analyze Record
- DNA
- Relationship
- Brick Wall
- Contradiction Finder
- Timeline
- Migration
- Source Checker

### Relationship Proof
A "Prove This Relationship" workflow should show:
- Proposed relationship
- Evidence supporting it
- Evidence against it
- Missing evidence
- Chronology/geography checks
- Recommended records
- Status: Supported, Probable, Possible, Unverified, or Disproved
- What evidence would actually prove the relationship

### Research Tasks
Per-person checklists for:
- Census
- Birth
- Marriage
- Death
- Probate
- Deeds
- Tax
- Church
- Military
- Newspapers
- Cemetery
- Immigration
- DNA

Negative searches should be recordable so researchers do not repeat the same work.

## 2. Evidence & Source System

### Evidence Board
Visual cards connecting claims to the sources that support them.

Example:
- 1860 Census -> household relationship
- Marriage record -> marriage
- Military record -> identity/service
- Pension -> widow/family evidence

### Evidence Matrix
Columns:
- Claim
- Evidence
- Source type
- What it directly establishes
- Strength
- Conflicts
- Notes

### Source -> Person connections
Sources should explicitly connect to the people and claims they support.

### Source Vault
Organize uploaded or referenced records by:
- Census
- Birth
- Marriage
- Death
- Military
- Probate
- Deeds
- Tax
- Church
- Newspaper
- Cemetery
- Immigration
- DNA
- Other

## 3. Tree Intelligence

### Smart Person Profile
Each person should have:
- Name
- Dates
- Places
- Family
- Relationships
- Records
- Timeline
- Research status
- Research alerts
- "Investigate with Kinley"

### Clean My Tree
Detect:
- Possible duplicates
- Missing dates
- Conflicting dates
- Impossible ages
- Children born before parents
- Implausible parent/child gaps
- Conflicting locations
- Duplicate spouses
- Unsupported relationships
- Orphaned people
- Unattached sources

### Duplicate Review
Never silently merge uncertain duplicates. Flag possible duplicates and let the researcher review them.

### Branch Health
Show documentation/research health by branch and generation. Scores should reflect evidence quality and coverage, not the number of ancestors.

## 4. Timeline

### Automatic Person Timeline
Build chronological events from:
- Birth
- Baptism
- Marriage
- Census appearances
- Residence
- Land
- Military service
- Probate
- Death
- Burial
- Other sourced events

Use timelines to identify impossible chronology and identity conflicts.

### Family Timeline
Combine multiple people into one chronological family view.

## 5. Migration Map

### Migration Journey
Turn documented residence locations into an animated geographic journey.

Core experience:
- Select a person, family, branch, or generation.
- Read dated location events from the tree.
- Display the world map.
- Draw a red animated route between documented locations.
- Advance the timeline as the route moves.
- Show the person/event at each stop.

Controls:
- Play
- Pause
- Restart
- 1x / 2x / 4x speed
- Jump to event
- View evidence
- Documented-only mode
- Research-hypothesis mode

### Evidence rules for maps
- A location with documentary support is marked as documented.
- An inferred route between two documented locations must be labeled as a schematic migration path, not a literal travel route.
- Unknown intermediate locations remain visible as gaps rather than being invented.
- Hypothetical locations/routes must be visually and textually distinguished from documented ones.
- The map should never imply an exact route when records only establish two endpoints.

### Migration modes
- Family Journey
- Person Journey
- Generation Journey
- Branch comparison

## 6. Geographic Research

### Migration Map Details
Each stop can show:
- Date or date range
- Place
- Event
- Person
- Source count
- Evidence status
- Open evidence
- Research notes

### Geography-driven research expansion
Use the evidence-backed sequence:
Origin -> local area -> surrounding jurisdictions -> wider region -> migration destination.

Geographic expansion should be driven by records, not surname assumptions.

## 7. DNA Lab

Sections:
- Y-DNA
- Autosomal DNA
- mtDNA
- DNA Matches
- Shared Matches
- Triangulation
- Common Ancestors
- Surname/location patterns
- Research limitations

Include clear warnings that DNA evidence can support a relationship hypothesis but does not automatically identify an exact historical ancestor.

## 8. Learning Center

### Genealogy lessons
Continue expanding the existing lesson system into:
- Foundations
- Starting research
- Census
- Vital records
- Church/cemetery
- Land/deeds/probate
- Military
- Newspapers/local history
- Source quality
- Contradictions
- DNA
- Brick walls

### Kinley Learning
Every major Kinley result should explain:
1. What was found
2. Why it matters
3. What evidence supports it
4. What remains unknown
5. How the researcher can verify it
6. How to repeat the research next time

### Research skill progression
Reward research quality rather than ancestor quantity:
- Beginner Genealogist
- Record Hunter
- Evidence Analyst
- Genealogy Researcher
- Family Historian
- Advanced Genealogist

## 9. Interface

### Main navigation
Preferred structure:
- Home
- Tree
- Research
- Kinley
- More

"More" can contain:
- DNA
- Records
- Timeline
- Maps
- Research Log
- Learn
- Import/Export
- Settings

### Home dashboard
Show:
- Continue Research
- Research Alerts
- Kinley
- Recent Records
- Tree
- Open Research Sessions

### Person page
Tabs:
- Overview
- Family
- Records
- Timeline
- Research

Primary action:
- Investigate with Kinley

### Research dashboard
Use clear status chips and cards rather than making users dig through chat history.

### Mobile-first
Keep core research actions reachable with one hand:
- Search
- Add person
- Attach source
- Investigate
- Import
- View evidence
- Start migration journey

## 10. Tree Import & Export

Current direction:
- GEDCOM import/export
- Genealogy Guide JSON export
- Import review before accepting uncertain data
- Preserve original GEDCOM identifiers where possible
- Preserve source/citation structures where possible
- Track import filename, service, and timestamp
- Improve GEDCOM parsing for SOUR, OBJE, CENS, FAMC, FAMS, and additional event structures
- Never bypass Ancestry or FamilySearch account/export controls

## 11. Future Multi-Investigator Kinley

Long-term architecture:
- Multiple independent genealogy research passes
- Standardized investigator prompt
- User-provided reports/results
- Agreement detection
- Contradiction detection
- Source-quality comparison
- Evidence gaps
- Final Audit
- Research plan
- Repeatable methodology

The interface should not make users pick a provider. The goal is to combine useful independent research into one evidence-focused review.

Kinley should not pretend to be another genealogy service or silently scrape private accounts.

## 12. Research Alerts

Examples:
- Conflicting birth years
- Conflicting death dates
- Unsupported parent relationship
- Possible duplicate person
- Missing source
- Impossible chronology
- Geographic inconsistency
- Record attached to wrong person
- Unresolved research question

Each alert should have an action such as:
- Investigate
- Compare sources
- Find records
- Review duplicate
- Add evidence

## 13. Privacy & Data

- Tree data should remain local by default where practical.
- Clearly identify when information leaves the device for an AI request.
- Never ask users to paste passwords, API keys, or account credentials into Kinley.
- Do not bypass private genealogy-service controls.
- Make import/export transparent.
- Allow users to delete local research data.

## 14. Signature experience

The long-term signature workflow should be:

Research Question
-> Tree Context
-> Evidence
-> Independent Research
-> Contradiction Check
-> Timeline
-> Migration Map
-> Final Audit
-> Next Research Step

The goal is not to generate the biggest family tree. The goal is to help researchers build the most defensible family tree possible.
