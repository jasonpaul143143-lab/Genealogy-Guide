"use client";

import {
  BookOpen, Search, GitBranch, Dna, Sparkles, ShieldCheck, Home as HomeIcon, Wrench, MapPinned,
  FileText, Landmark, ScrollText, Newspaper, Users, ClipboardList, ArrowRight,
  ChevronRight, Plus, X, GraduationCap, Microscope, ExternalLink, Database,
  CheckCircle2, Clock3, MapPin, UserPlus, Link2, Download, Smartphone, Send, Loader2, Save, Upload
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import KinleyDesk from "./components/KinleyDesk";
import ResearchCommandCenter from "./components/ResearchCommandCenter";
import FamilyTreeCanvas from "./components/FamilyTreeCanvas";
import Plans from "./components/Plans";
import VisualExperience from "./components/VisualExperience";
import AncestorGallery from "./components/AncestorGallery";
import ResearchWorkspace from "./components/ResearchWorkspace";
import { parseMigrationStops } from "./lib/migration";
import { normalizePlan } from "./lib/plans";
import { unzipSync, strFromU8 } from "fflate";

type Section = "Home"|"Learn"|"Research"|"Tree"|"Tools"|"DNA";
type ToolKey = "Evidence Checker"|"Research Log"|"Name Variants"|"Timeline Builder"|"Relationship Analyzer"|"Brick Wall Planner"|null;

const lessons = [
  ["01","Genealogy Foundations","Learn the difference between a clue, a source, an assertion, a hypothesis, and a documented conclusion."],
  ["02","Start With What You Know","Build a reliable starting point from yourself, relatives, certificates, photographs, interviews, and family records."],
  ["03","Census Records","Read households across census years and use ages, relationships, occupations, neighbors, and places as identity evidence."],
  ["04","Birth, Marriage & Death","Use vital records to establish identities and relationships while understanding indexes, certificates, registers, and originals."],
  ["05","Church & Cemetery Records","Use baptisms, marriages, burials, church minutes, cemetery records, and memorials without treating every transcription as proof."],
  ["06","Land, Deeds & Probate","Follow property transfers, wills, estates, guardianships, heirs, witnesses, neighbors, and chain-of-title clues."],
  ["07","Military Records","Trace service, units, pensions, residences, affidavits, and identity evidence across a veteran's lifetime."],
  ["08","Newspapers & Local History","Use obituaries, marriage notices, community news, county histories, maps, and archives as evidence and leads."],
  ["09","Evidence & Source Quality","Evaluate original versus derivative records, authored works, source independence, and what a record actually proves."],
  ["10","Resolving Conflicts","Build a conflict table and compare dates, places, relationships, handwriting, witnesses, and record creation context."],
  ["11","DNA & Genetic Genealogy","Understand autosomal DNA, Y-DNA, mtDNA, shared matches, triangulation, segment evidence, and limitations."],
  ["12","Brick-Wall Research","Turn an unknown parent or missing generation into a precise question, jurisdiction plan, source strategy, and documented search."]
];

const lessonDetails:Record<string,{objective:string;sections:string[]}> = {
  "Genealogy Foundations":{objective:"Learn to separate what you know from what you think might be true.",sections:["Start with a claim: write exactly what relationship or fact you are trying to establish.","Classify each item as a clue, source, or conclusion. A family tree website may be a clue; an original deed is a source; your statement about the relationship is the conclusion.","Prefer evidence that directly identifies the people involved. Names alone are weak; combinations of place, age, spouse, parents, occupation, witnesses, and chronology are stronger.","Never fill a missing generation just because the names, dates, and geography seem to fit. Record the gap and investigate it."]},
  "Start With What You Know":{objective:"Create a documented starting point before researching earlier generations.",sections:["Begin with yourself and work backward one generation at a time.","Interview relatives with specific questions about full names, nicknames, places, churches, occupations, military service, and family stories.","Collect certificates, photographs, obituaries, letters, family Bibles, funeral programs, and other records. Preserve the original whenever possible.","For every fact, record where it came from and distinguish first-hand family knowledge from a record created later."]},
  "Census Records":{objective:"Use census records as identity snapshots rather than isolated name searches.",sections:["Search the correct jurisdiction and census year, then inspect the actual image when possible instead of relying only on an index.","Compare age, birthplace, occupation, household members, relationship to head, neighbors, and nearby families.","Track a person across multiple censuses. An age may drift, a birthplace may change, or a name may be indexed incorrectly without making the person a different individual.","Use neighbors and recurring associates as identity clues, then verify the relationship with stronger records when possible."]},
  "Birth, Marriage & Death":{objective:"Use vital records to anchor identity, relationships, and life events.",sections:["Separate an index entry from the underlying certificate, register, return, or original image.","Marriage records can identify spouses, bondsmen, witnesses, officiants, residences, and sometimes parents; the exact information varies by jurisdiction and era.","Death records may identify parents or spouse, but informant knowledge can be imperfect. Check the informant and creation date.","Compare event records against census, probate, church, land, and newspaper evidence rather than forcing every discrepancy to agree."]},
  "Church & Cemetery Records":{objective:"Use community records to connect people who may be difficult to distinguish in civil records.",sections:["Church minutes, membership rolls, baptisms, marriages, disciplinary records, and cemetery registers can reveal relationships and locations.","Separate an original church register from a later transcription or compiled cemetery database.","A gravestone or memorial can provide useful dates and relationships, but treat later memorial claims cautiously unless supported by contemporary records.","Pay attention to witnesses, sponsors, church associates, and repeated family groups. These can identify the correct community even when surnames vary."]},
  "Land, Deeds & Probate":{objective:"Follow property and estate records to discover relationships that ordinary vital records may not show.",sections:["Read deeds as transactions: identify grantor, grantee, date, location, witnesses, consideration, and the land description.","Probate files may contain wills, inventories, administrator bonds, guardianships, distributions, receipts, and lists of heirs.","Look for indirect relationships: a deed may name a wife, heir, trustee, witness, or adjoining landowner; a probate file may identify children who were not living in the household.","Search the entire jurisdiction and surrounding counties because families often crossed county lines while records remained in the original jurisdiction."]},
  "Military Records":{objective:"Prove that a military record belongs to the correct individual and use it to extend the family timeline.",sections:["Start with unit, enlistment location, residence, age, occupation, and service dates rather than matching a name alone.","Pension files can be especially valuable because applications and affidavits may contain marriages, residences, children, relatives, and statements from people who knew the veteran.","Distinguish a roster or index from the original service or pension file.","Resolve identity before attaching military events to a family tree, especially when several people with the same name served in the same war."]},
  "Newspapers & Local History":{objective:"Use newspapers and local histories to discover evidence while controlling for errors.",sections:["Search multiple spellings and nearby communities. Newspapers often contain notices that never appear in formal indexes.","Obituaries can identify family members and residences, but the information may be supplied by relatives and can contain errors.","County histories, biographies, and local histories are authored sources. They are valuable for leads and context, but verify their specific genealogical claims against contemporary records.","Record the publication date, newspaper title, page or image, and exact wording or a concise transcription in your research log."]},
  "Evidence & Source Quality":{objective:"Judge the quality and independence of evidence before reaching a conclusion.",sections:["Ask four questions: Who created the record? When? Why? What did the creator actually know?","An original record is not automatically correct, and a derivative record is not automatically wrong. Evaluate the information and the record's creation context.","Separate source type from information type. A later death certificate may be an original record of the death event but secondary information about the deceased person's parents.","Independent sources are powerful when they were created separately. Ten online trees copying the same source are not ten independent sources."]},
  "Resolving Conflicts":{objective:"Investigate contradictions instead of averaging conflicting facts.",sections:["Make a conflict table listing each version, its source, creation date, informant, and what evidence supports it.","Check whether the records refer to the same person before trying to reconcile the dates. Identity resolution comes first.","Give more weight to evidence created close to the event when appropriate, while considering the record's purpose and informant knowledge.","If the conflict cannot be resolved, preserve both possibilities and mark the conclusion unresolved rather than inventing a compromise."]},
  "DNA & Genetic Genealogy":{objective:"Use DNA as supporting evidence alongside documentary genealogy.",sections:["Autosomal DNA is generally most useful for relatively recent generations; relationship ranges overlap, so a match alone rarely identifies one exact ancestor.","Y-DNA follows the direct paternal line and can help investigate surname-line hypotheses; mtDNA follows the direct maternal line.","Use shared matches, documented trees, and—where available and appropriate—segment evidence to test a hypothesis rather than simply collecting match counts.","DNA evidence can support or challenge a documentary conclusion, but it does not replace identity resolution and source analysis."]},
  "Brick-Wall Research":{objective:"Turn a stuck family-tree problem into a controlled investigation.",sections:["Write the unknown relationship as one sentence, such as 'Who was the biological father of John Scoggins, born about 1822 in Georgia?'","Create a known-facts table with every date, place, spouse, child, residence, record, and source already established.","Map the jurisdictions involved and identify which records existed during the target period: probate, deeds, tax lists, court, church, guardianship, marriage, military, newspapers, and census.","Search systematically, record negative searches, and define what evidence would actually prove or disprove each candidate relationship."]}
};

const researchTools = [
  ["Record Guide","Learn what each record type can prove and where to look.",FileText,"Vital records, census, probate, deeds, church, military, newspapers, and more."],
  ["Census Research","Understand U.S. federal census records and their genealogical value.",Users,"Compare households across years and watch for indexing errors, ages that drift, and changing neighbors."],
  ["Probate & Deeds","Follow estates, land, heirs, witnesses, and neighbors.",ScrollText,"Probate can name heirs; deeds can reveal relationships through grants, witnesses, and adjoining land."],
  ["Military Research","Research service records, pensions, units, and veterans.",ShieldCheck,"Use service files, pension applications, draft registrations, rosters, and unit histories to establish identity."],
  ["Newspaper Research","Use historical newspapers to identify people and relationships.",Newspaper,"Treat newspaper reports as evidence whose reliability depends on the event, date, and proximity of the reporter."],
  ["Local History","Use county histories, maps, churches, and archives.",Landmark,"Local sources can supply context and leads, but authored histories still need independent verification."]
];

const toolDetails:Record<Exclude<ToolKey,null>,string> = {
  "Evidence Checker":"Write the exact claim first. Identify the source, classify its origin, note what it directly establishes, and choose Supported, Probable, Possible, Unverified, or Disproved. A conclusion should never be stronger than its evidence.",
  "Research Log":"Record the question, person, place, date range, repository, collection searched, result, citation, and next step. Negative searches matter too because they prevent repeating the same work.",
  "Name Variants":"Record spelling variants, initials, aliases, translations, phonetic spellings, and indexing mistakes. A variant is a search strategy—not proof that two people are the same.",
  "Timeline Builder":"Place every known event in chronological order. Impossible ages, overlapping residences, duplicate spouses, and impossible parent-child gaps can expose an identity problem before you attach a record.",
  "Relationship Analyzer":"Compare the proposed relationship against age, geography, chronology, naming patterns, records, witnesses, and independent sources. A shared surname alone is not enough.",
  "Brick Wall Planner":"Define the unknown relationship in one sentence, list every known fact, identify the jurisdictions involved, rank the records most likely to answer the question, and document every search."
};

const GG_HISTORY="gg-version-history";
const GG_PRIVACY="gg-privacy-mode";
const CASE_TEMPLATES=[{id:"parentage",name:"Parentage Investigation",question:"Who were the parents of [person], and what evidence proves the relationship?",records:["Census","Probate","Deed / land","Marriage"]},{id:"military",name:"Military Identity",question:"Does this military record belong to [person]?",records:["Service","Pension","Census","Death"]},{id:"migration",name:"Migration Study",question:"Where did [person/family] live over time?",records:["Census","Deed / land","Tax","Church"]},{id:"probate",name:"Probate / Heirs",question:"Who were the heirs of [decedent]?",records:["Will","Probate","Guardianship","Deed / land"]},{id:"census",name:"Census Cluster",question:"Which household identifies [person] across census years?",records:["Census","Tax","Deed / land"]},{id:"surname",name:"Surname Study",question:"How are the [surname] families in [place] related?",records:["Census","Probate","Marriage","Church"]}];
function ResearchUpgradeBar(){const [online,setOnline]=useState(()=>typeof navigator!=="undefined"?navigator.onLine:true);const [privacy,setPrivacy]=useState("private");const [search,setSearch]=useState(false);useEffect(()=>{if(typeof window!=="undefined"){setPrivacy(localStorage.getItem(GG_PRIVACY)||"private");}const a=()=>setOnline(true),b=()=>setOnline(false);addEventListener("online",a);addEventListener("offline",b);return()=>{removeEventListener("online",a);removeEventListener("offline",b)}},[]);const snapshot=()=>{const h=JSON.parse(localStorage.getItem(GG_HISTORY)||"[]");h.unshift({id:crypto.randomUUID(),date:new Date().toISOString()});localStorage.setItem(GG_HISTORY,JSON.stringify(h.slice(0,30)))};return <div className="upgradeBar"><div className="upgradeStatus"><span className={online?"statusDot online":"statusDot"}></span><strong>{online?"Kinley online":"Offline mode"}</strong><small>Saved locally</small></div><div className="upgradeActions"><button onClick={()=>setSearch(v=>!v)}><Search size={14}/> Search</button><button onClick={snapshot}><Save size={14}/> Version</button><button onClick={()=>{const n=privacy==="private"?"public-safe":"private";setPrivacy(n);localStorage.setItem(GG_PRIVACY,n)}}>{privacy==="private"?"Private":"Public-safe"}</button></div>{search&&<div className="upgradePopover"><input autoFocus placeholder="Search people, places, sources, evidence IDs…"/><small>Local-first search across your research workspace.</small></div>}</div>}
const recordCollections = [
  ["Ancestry record search","Search Ancestry's record collections for a person or family. The app links you to Ancestry rather than copying protected record images.","https://www.ancestry.com/search/"],
  ["Ancestry census collections","Explore U.S. census collections available through Ancestry.","https://www.ancestry.com/search/categories/us_census/"],
  ["Ancestry vital records","Search Ancestry's birth, marriage, and death record collections.","https://www.ancestry.com/search/categories/bmd_birth/"],
  ["Ancestry military records","Search military collections and service-related records on Ancestry.","https://www.ancestry.com/search/categories/military/"]
];

function Logo(){return <div className="logo" aria-label="Genealogy Guide logo"><img src="/icon.svg?v=5" alt="" /></div>}

function KinleyMark(){return <span className="kinleyMark" aria-hidden="true"><i/><i/><i/><b/><em/></span>}

export default function HomePage(){
  const [section,setSection]=useState<Section>("Home");
  const [lesson,setLesson]=useState<number|null>(null);
  const [showKinley,setShowKinley]=useState(false);
  const [showPlans,setShowPlans]=useState(false);
  const [showInstall,setShowInstall]=useState(false);
  const [installEvent,setInstallEvent]=useState<any>(null);

  useEffect(()=>{
    const handler=(e:any)=>{e.preventDefault();setInstallEvent(e);setShowInstall(true)};
    window.addEventListener("beforeinstallprompt",handler);
    return ()=>window.removeEventListener("beforeinstallprompt",handler);
  },[]);

  const go=(s:Section)=>{setSection(s);setLesson(null);window.scrollTo({top:0,behavior:"smooth"})};
  const install=async()=>{if(installEvent){await installEvent.prompt();setInstallEvent(null);setShowInstall(false)}else setShowInstall(true)};

  return <main>
    <ResearchUpgradeBar/>
    {!showKinley && <header>
      <button className="brand brandButton" onClick={()=>go("Home")}><Logo/><div><h1>Genealogy Guide</h1><p>Find. Learn. Prove.</p></div></button>
      <div className="headerActions"><button className="installButton" onClick={install}><Smartphone size={16}/> Install</button><button className="plansButton" onClick={()=>setShowPlans(true)}>Plans</button><button className="kinley" onClick={()=>setShowKinley(true)}><KinleyMark/> <span>Kinley</span></button></div>
    </header>}

    {section==="Home" && <HomeSection go={go} setShowKinley={setShowKinley} setLesson={setLesson}/>}
    {section==="Learn" && <Learn lessons={lessons} lesson={lesson} setLesson={setLesson}/>}
    {section==="Research" && <Research go={go}/>}
    {section==="Tree" && <Tree/>}
    {section==="Tools" && <Tools/>}
    {section==="DNA" && <DNA/>}

    {showKinley && <Kinley close={()=>setShowKinley(false)} go={go}/>} 
    {showPlans && <Plans close={()=>setShowPlans(false)}/>}
    {showInstall && !installEvent && <InstallHelp close={()=>setShowInstall(false)}/>}

    <nav>
      {[
        ["Home",HomeIcon,"Home"],["Learn",BookOpen,"Learn"],["Find Ancestors",Search,"Research"],
        ["My Tree",GitBranch,"Tree"],["Research Tools",Wrench,"Tools"]
      ].map(([name,Icon,key])=><button className={section===key?"active":""} onClick={()=>go(key as Section)} key={key as string}><Icon size={19}/><span>{name as string}</span></button>)}
    </nav>
  </main>
}

function HomeSection({go,setShowKinley,setLesson}:{go:(s:Section)=>void,setShowKinley:(v:boolean)=>void,setLesson:(n:number|null)=>void}){
 return <>
 <section className="hero guideHomeHero"><div><p className="eyebrow">YOUR FAMILY HISTORY STARTS HERE</p><h2>Find your ancestors. Learn how to prove them.</h2><p>Genealogy Guide is your guide to family history: start with the people you know, discover where the next generation may be hiding, learn which records matter, and build a family story you can defend.</p><div className="heroActions"><button className="primary" onClick={()=>go("Research")}><Search size={17}/> Find My Ancestors</button><button className="secondary" onClick={()=>go("Learn")}><BookOpen size={16}/> Learn Genealogy</button></div><div className="guideHomeTrust"><span><CheckCircle2 size={14}/> Evidence-first</span><span><MapPin size={14}/> Place-aware</span><span><ShieldCheck size={14}/> No invented ancestors</span></div></div><div className="principle guideHomeMethod"><div className="methodIcon"><GitBranch size={28}/></div><strong>The Genealogy Guide Method</strong><span>Start with what you know → find the next record → evaluate the evidence → prove the relationship.</span><small>Your tree grows from documented discoveries, not guesses.</small></div></section>
 <VisualExperience onResearch={()=>go("Research")} onTree={()=>go("Tree")} onKinley={()=>setShowKinley(true)}/>
 <AncestorGallery/>
 <section className="stats"><div><b>12</b><span>Core lessons</span></div><div><b>6</b><span>Research guides</span></div><div><b>5</b><span>Evidence levels</span></div><div><b>∞</b><span>Research questions</span></div></section>
 <section className="section"><div className="sectionTitle"><div><p className="eyebrow">EXPLORE</p><h3>One guide. Four ways to move your research forward.</h3><p>The tree organizes what you discover, but the guide is built around the real goal: finding and proving your ancestors.</p></div></div>
 <div className="grid">{[
  ["Find My Ancestors","Start with a person you know and work backward through records, places, family connections, and research leads.",Search,"Research"],
  ["Research Guide","Learn what to search, where to search, and what each record can actually prove.",BookOpen,"Learn"],
  ["My Family Tree","Keep your discoveries organized. The tree records the research—it does not replace the research.",GitBranch,"Tree"],
  ["DNA & Genetics","Use DNA as supporting evidence when it can help answer a specific family-history question.",Dna,"DNA"]
 ].map(([t,d,I,k])=><article key={t as string} onClick={()=>go(k as Section)}><div className="cardIcon"><I size={22}/></div><h4>{t as string}</h4><p>{d as string}</p><button onClick={(e)=>{e.stopPropagation();go(k as Section)}}>Explore <ArrowRight size={15}/></button></article>)}</div></section>
 <section className="feature"><div><p className="eyebrow">YOUR RESEARCH WORKFLOW</p><h3>Question → Record → Evidence → Conclusion</h3><p>Good genealogy is not about collecting the most names. It is about building defensible relationships from the records.</p></div><div className="workflow"><span><b>1</b>Ask a specific question</span><span><b>2</b>Find the best available record</span><span><b>3</b>Evaluate the source</span><span><b>4</b>Write the conclusion</span></div></section>
 <section className="lessons"><div className="sectionTitle compact"><p className="eyebrow">LEARNING PATH</p><h3>Start here</h3></div>{lessons.slice(0,4).map((l,i)=><button className="lesson" key={l[0]} onClick={()=>{go("Learn");setTimeout(()=>setLesson(i),50)}}><b>{l[0]}</b><div><strong>{l[1]}</strong><span>{l[2]}</span></div><ChevronRight/></button>)}</section>
 </>;
}

function Learn({lessons,lesson,setLesson}:{lessons:string[][],lesson:number|null,setLesson:(n:number|null)=>void}){
 const [completed,setCompleted]=useState<number[]>([]);
 useEffect(()=>{try{const x=localStorage.getItem("gg-guide-complete");if(x)setCompleted(JSON.parse(x))}catch{}},[]);
 const toggleComplete=(i:number)=>{const next=completed.includes(i)?completed.filter(x=>x!==i):[...completed,i];setCompleted(next);localStorage.setItem("gg-guide-complete",JSON.stringify(next));};
 const current=lesson===null?null:lessons[lesson];
 const detail=current?lessonDetails[current[1]]:null;
 return <section className="page">
  <div className="guideHero"><div><p className="eyebrow">THE GENEALOGY GUIDE</p><h2>Learn genealogy like a researcher.</h2><p className="lead">A practical, evidence-first field guide. Start at Lesson 1 if you are new, or jump directly to the skill you need.</p></div><div className="guideProgress"><strong>{completed.length}/{lessons.length}</strong><span>lessons completed</span><div><i style={{width:`${Math.round(completed.length/lessons.length*100)}%`}}/></div></div></div>
  <div className="guidePrinciples"><span><b>01</b> Ask a precise question</span><span><b>02</b> Find the right record</span><span><b>03</b> Evaluate the evidence</span><span><b>04</b> Prove the relationship</span></div>
  <div className="guideLayout">
   <aside className="guideMap"><p className="eyebrow">FIELD GUIDE</p>{lessons.map((l,i)=><button className={lesson===i?"active":""} key={l[0]} onClick={()=>setLesson(i)}><b>{l[0]}</b><span>{l[1]}</span>{completed.includes(i)&&<CheckCircle2 size={14}/>}</button>)}</aside>
   <div className="guideContent">
    {detail&&current?<article className="guideChapter">
      <div className="chapterTop"><span>LESSON {current[0]}</span><span>{completed.includes(lesson!)?"COMPLETED":"IN PROGRESS"}</span></div>
      <h3>{current[1]}</h3><p className="chapterIntro">{detail.objective}</p>
      <div className="guideSteps"><div className="guideSectionTitle"><BookOpen size={17}/><strong>What you need to know</strong></div>{detail.sections.map((s,n)=><div className="guideStep" key={n}><b>{n+1}</b><p>{s}</p></div>)}</div>
      <div className="guidePractice"><div><Microscope size={18}/><strong>Practice in your own tree</strong></div><p>Write one specific research question. Name the person, place, approximate date, and relationship or fact you are trying to establish. Then choose the record you would search first and explain why.</p></div>
      <div className="guideRule"><ShieldCheck size={17}/><div><strong>Genealogist's rule</strong><span>Do not upgrade a possibility into a fact because it fits. If the evidence does not prove the relationship, preserve the gap and keep researching.</span></div></div>
      <button className={completed.includes(lesson!)?"completeButton done":"completeButton"} onClick={()=>toggleComplete(lesson!)}>{completed.includes(lesson!)?<><CheckCircle2 size={16}/> Lesson completed</>:<>Mark lesson complete <ArrowRight size={16}/></>}</button>
    </article>:<div className="guideWelcome"><p className="eyebrow">START HERE</p><h3>Your genealogy field guide</h3><p>Choose Lesson 1 to learn the research method, then work through the guide in order. Every lesson is built around a real genealogical task.</p><button className="primary" onClick={()=>setLesson(0)}>Begin Lesson 1 <ArrowRight size={16}/></button></div>}
   </div>
  </div>
 </section>
}
const guideDetails:Record<string,{what:string;steps:string[];watch:string}> = {
  "Record Guide":{what:"A record guide helps you choose the record most likely to answer a specific genealogy question.",steps:["Define the fact or relationship you need to establish.","Choose records created closest to the event or by people with first-hand knowledge.","Search the correct jurisdiction and time period.","Inspect the original image when available and capture a precise citation.","Write exactly what the record establishes, then identify what still needs proof."],watch:"Indexes, compiled trees, and memorial pages can be useful discovery tools, but do not automatically prove the relationship."},
  "Census Research":{what:"Census research works best when you compare the same household and surrounding community across multiple census years.",steps:["Identify the likely county, township, district, and census year.","Search spelling variants, initials, and approximate ages.","Inspect the image and record household members, relationships, occupations, birthplaces, and neighbors.","Build a timeline across every available census and note changes instead of silently correcting them.","Use census evidence to generate hypotheses, then seek vital, probate, land, church, or other records for stronger proof."],watch:"Census ages and birthplaces can be wrong, and indexers can misread names. Never reject a candidate on one field alone."},
  "Probate & Deeds":{what:"Land and probate records can expose family relationships through heirs, witnesses, administrators, guardians, and property transfers.",steps:["Identify the county where the land or estate was handled and check boundary changes.","Search grantor/grantee indexes, deed books, wills, estates, guardianships, and court minutes.","Read the original record and capture names, dates, witnesses, relationships, and legal roles.","Follow every named heir, witness, administrator, and adjoining landowner as a possible research lead.","Compare the result with census, church, marriage, and tax records before concluding that two people are related."],watch:"A surname match in a deed or probate index is not enough. The legal relationship must be interpreted from the actual record."},
  "Military Research":{what:"Military records can connect a person to a unit, residence, relatives, and later pension testimony.",steps:["Start with the person's full name, approximate age, residence, and likely conflict.","Identify the unit and inspect service records, muster rolls, rosters, casualty lists, and pension records where available.","Compare enlistment location, occupation, residence, physical description, relatives, and service dates to other records.","Read pension affidavits carefully because witnesses may identify spouses, children, parents, or residences.","Document the exact record and explain why it belongs to your person rather than another person with the same name."],watch:"Military indexes and unit lists can contain multiple men with the same name. Identity resolution is mandatory before attaching service to a family tree."},
  "Newspaper Research":{what:"Historical newspapers can reveal events, relationships, residences, occupations, and community connections that formal records miss.",steps:["Search the person's full name, initials, surname variants, spouse, children, and locality.","Search nearby towns and county names because notices may appear outside the person's residence.","Inspect the newspaper image and record publication, date, page, and article context.","Use obituaries, marriage notices, legal notices, social columns, and estate notices as separate evidence types.","Verify important claims against contemporary civil, church, land, probate, or military records."],watch:"Newspapers can repeat rumors or family-supplied information. Treat an article as evidence whose reliability depends on context."},
  "Local History":{what:"County histories, maps, church histories, and archival collections can reconstruct the community around an ancestor.",steps:["Identify the county and its parent counties for the target date.","Check historical maps, county histories, church records, local archives, court records, and manuscript collections.","Extract every named person, place, organization, and date that could be independently verified.","Use local history to understand migration routes and communities, not to automatically accept a compiled pedigree.","Follow promising leads into original or contemporary records."],watch:"Authored local histories can contain errors and undocumented family traditions. Treat them as leads until independently verified."}
};

function Research({go}:{go:(s:Section)=>void}){
 const [plan,setPlan]=useState("free");
 useEffect(()=>{try{setPlan(normalizePlan(localStorage.getItem("gg-plan")))}catch{}},[]);
 const engineUnlocked=plan==="genealogist"||plan==="family";
 const [guide,setGuide]=useState<string|null>(null);
 const closeGuide=()=>setGuide(null);
 return <section className="page findAncestorsPage">
  <div className="findHero"><div><p className="eyebrow">FIND MY ANCESTORS</p><h2>Start with someone you know. We'll help you work backward.</h2><p className="lead">Genealogy Guide turns a family-history question into a clear research path. Start with a known person, identify the missing relationship, choose the records most likely to help, and keep the evidence organized as you discover the next generation.</p></div><div className="findHeroCallout"><Search size={22}/><strong>Your goal</strong><span>Find the next ancestor and understand why the evidence supports the connection.</span></div></div>
  <div className="ancestorPath"><div><b>01</b><strong>Start with what you know</strong><span>Name, date, place, spouse, parents, records.</span></div><ArrowRight className="pathArrow" size={18}/><div><b>02</b><strong>Find the missing link</strong><span>Turn the gap into one precise question.</span></div><ArrowRight className="pathArrow" size={18}/><div><b>03</b><strong>Choose the right records</strong><span>Census, vital, land, probate, church, military and more.</span></div><ArrowRight className="pathArrow" size={18}/><div><b>04</b><strong>Prove the relationship</strong><span>Compare evidence before adding the ancestor.</span></div></div>
  <section className="findNextStep"><div className="nextStepIcon"><UserPlus size={24}/></div><div><p className="eyebrow">READY TO BEGIN?</p><h3>Who are you researching?</h3><p>Open your family tree to start with a person you already know, or use the research guides below if you need help deciding what to search first.</p></div><button className="primary" onClick={()=>go("Tree")}>Start With My Family <ArrowRight size={15}/></button></section>
  <section className="section findGuidesSection"><div className="sectionTitle"><div><p className="eyebrow">YOUR RESEARCH GUIDE</p><h3>Know what to look for before you search.</h3><p>Genealogy Guide teaches you how records work, what they can prove, and how to recognize a promising lead without mistaking it for a fact.</p></div></div><div className="toolGrid">{researchTools.map(([t,d,I,detail])=><article key={t as string}><div className="cardIcon"><I size={22}/></div><h3>{t as string}</h3><p>{d as string}</p><button onClick={()=>setGuide(t as string)}>Open Guide <ArrowRight size={15}/></button><small>{detail as string}</small></article>)}</div></section>
  <section className="recordsBox"><div><Database/><div><p className="eyebrow">RECORD DISCOVERY</p><h3>Go where the evidence lives.</h3><p>Use Genealogy Guide to understand what to search, then follow the collection to the provider. A matching name is a lead—not a proven ancestor.</p></div></div><div className="recordLinks">{recordCollections.map(([t,d,url])=><a key={t} href={url} target="_blank" rel="noreferrer"><span><strong>{t}</strong><small>{d}</small></span><ExternalLink size={16}/></a>)}</div></section>
  <section className="advancedResearchCard"><div><p className="eyebrow">ADVANCED FOR EXPERIENCED GENEALOGISTS</p><h3>Research Engine</h3><p>When a case becomes complicated, the Research Engine adds structured investigation tools for identity resolution, contradiction hunting, evidence comparison, migration analysis, and research planning.</p><div className="engineChips"><span>Identity resolution</span><span>Contradiction hunting</span><span>Evidence analysis</span><span>Research planning</span></div></div><div className="engineGate">{engineUnlocked?<><strong>Advanced tools unlocked</strong><small>Kinley Vesper investigation tools are available on the Genealogist and Family plans.</small><button className="primary" onClick={()=>document.getElementById("research-engine-workspace")?.scrollIntoView({behavior:"smooth",block:"start"})}>Open Advanced Workspace <ArrowRight size={15}/></button></>:<><strong>Optional advanced feature</strong><small>Built for serious genealogists. Genealogy Guide's core ancestor-finding and learning tools remain available without it.</small><button className="secondary" onClick={()=>window.dispatchEvent(new CustomEvent("open-plans"))}>See Genealogist plan <ArrowRight size={15}/></button></>}</div></section>
  <div id="research-engine-workspace">{engineUnlocked?<ResearchWorkspace/>:<div className="engineLockedPanel"><h3>Advanced Research Engine</h3><p>This workspace is intentionally separate from the main Genealogy Guide experience. Upgrade to Genealogist to unlock it.</p></div>}</div>
  {guide&&guideDetails[guide]&&<div className="toolModal guideModal" role="dialog" aria-modal="true"><div className="toolModalHead"><div><p className="eyebrow">RESEARCH GUIDE</p><h3>{guide}</h3></div><button type="button" onClick={closeGuide} aria-label="Close guide"><X/></button></div><p>{guideDetails[guide].what}</p><div className="toolTip">This guide is self-contained. You do not need to open the separate Tools section to follow it.</div><h4>Step-by-step</h4><ol>{guideDetails[guide].steps.map((s,i)=><li key={i}>{s}</li>)}</ol><div className="toolTip"><strong>Watch for:</strong> {guideDetails[guide].watch}</div><div className="toolActions"><button type="button" className="primary" onClick={closeGuide}>Done</button></div></div>}
 </section>
}

function Tree(){
 type Person={id:string,name:string,relation:string,status:string,birth:string,death:string,places:string,notes:string};
 type Source={id:string,personId:string,title:string,type:string,date:string,url:string,notes:string};
 type Rel={id:string,from:string,to:string,type:string};
 const [people,setPeople]=useState<Person[]>([{id:"root",name:"Your research starting point",relation:"Root",status:"Starting point",birth:"",death:"",places:"",notes:""}]);
 const [sources,setSources]=useState<Source[]>([]);
 const [relationships,setRelationships]=useState<Rel[]>([]);
 const [selected,setSelected]=useState("root");
 const [name,setName]=useState(""); const [relation,setRelation]=useState("Parent");
 const [birth,setBirth]=useState(""); const [death,setDeath]=useState(""); const [places,setPlaces]=useState("");
 const [sourceTitle,setSourceTitle]=useState(""); const [sourceType,setSourceType]=useState("Census"); const [sourceUrl,setSourceUrl]=useState(""); const [sourceNotes,setSourceNotes]=useState("");
 const [relTo,setRelTo]=useState(""); const [relType,setRelType]=useState("Parent of");
 const [loaded,setLoaded]=useState(false);

 useEffect(()=>{
   try{
     const saved=localStorage.getItem("gg-tree");
     if(saved){
       const data=JSON.parse(saved);
       if(Array.isArray(data.people))setPeople(data.people);
       if(Array.isArray(data.sources))setSources(data.sources);
       if(Array.isArray(data.relationships))setRelationships(data.relationships);
       if(Array.isArray(data.records) && !Array.isArray(data.sources)){
         setSources(data.records.map((r:any)=>({id:r.id,personId:r.personId,title:r.type,type:r.type,date:r.date,url:"",notes:""})));
       }
     }
   }catch{} finally{setLoaded(true)}
 },[]);
 useEffect(()=>{
   if(loaded)localStorage.setItem("gg-tree",JSON.stringify({people,sources,relationships,updatedAt:new Date().toISOString()}));
 },[people,sources,relationships,loaded]);

 const add=()=>{
   if(!name.trim())return;
   const id=crypto.randomUUID();
   const person={id,name:name.trim(),relation,status:"Needs sources",birth:birth.trim(),death:death.trim(),places:places.trim(),notes:""};
   setPeople(prev=>[...prev,person]);
   setName("");setBirth("");setDeath("");setPlaces("");setSelected(id);
 };
 const addRelationship=()=>{
   if(!relTo || relTo===selected)return;
   const id=crypto.randomUUID();
   setRelationships(prev=>[...prev,{id,from:selected,to:relTo,type:relType}]);
 };
 const deletePerson=()=>{
   if(!current || current.id==="root"){ setImportStatus("The starting point cannot be deleted."); return; }
   const personName=current.name;
   setPeople(prev=>prev.filter(p=>p.id!==current.id));
   setRelationships(prev=>prev.filter(r=>r.from!==current.id && r.to!==current.id));
   setSources(prev=>prev.filter(s=>s.personId!==current.id));
   setSelected(people.find(p=>p.id!==current.id)?.id || "root");
   setImportStatus(`Deleted ${personName} and its relationship/source records.`);
 };
 const deleteTree=()=>{
   if(!window.confirm("Delete the entire family tree from this device? This removes all imported people, relationships, and sources."))return;
   const root={id:"root",name:"Your research starting point",relation:"Root",status:"Starting point",birth:"",death:"",places:"",notes:""};
   setPeople([root]); setSources([]); setRelationships([]); setSelected("root");
   setImportStatus("Family tree deleted. The database is ready for a fresh import.");
 };
 const addSource=()=>{
   if(!sourceTitle.trim())return;
   setSources(prev=>[...prev,{id:crypto.randomUUID(),personId:selected,title:sourceTitle.trim(),type:sourceType,date:new Date().toLocaleDateString(),url:sourceUrl.trim(),notes:sourceNotes.trim()}]);
   setSourceTitle("");setSourceUrl("");setSourceNotes("");
   setPeople(prev=>prev.map(p=>p.id===selected && p.status==="Needs sources"?{...p,status:"Research in progress"}:p));
 };
 const [importStatus,setImportStatus]=useState("");
 const importInputRef=useRef<HTMLInputElement>(null);

 const mergeImportedTree=(data:any)=>{
   const importedPeople=Array.isArray(data?.people)?data.people:[];
   const importedRelationships=Array.isArray(data?.relationships)?data.relationships:[];
   const importedSources=Array.isArray(data?.sources)?data.sources:(Array.isArray(data?.records)?data.records:[]);
   if(!importedPeople.length) throw new Error("No people were found. Export a GEDCOM file from Ancestry or FamilySearch first.");
   const existingByKey=new Map(people.map(p=>[p.name.trim().toLowerCase()+"|"+(p.birth||"").trim(),p.id]));
   const idMap=new Map<string,string>();
   const additions=importedPeople.map((p:any)=>{
     const oldId=String(p.id ?? crypto.randomUUID());
     const key=String(p.name||"").trim().toLowerCase()+"|"+String(p.birth||"").trim();
     const existing=existingByKey.get(key);
     if(existing){idMap.set(oldId,existing);return null;}
     const id=crypto.randomUUID(); idMap.set(oldId,id);
     return {
       id,
       name:String(p.name||"Unnamed person"),
       relation:String(p.relation||"Imported"),
       status:String(p.status||"Imported — needs review"),
       birth:String(p.birth||""),
       death:String(p.death||""),
       places:String(p.places||p.place||""),
       notes:String(p.notes||"Imported from genealogy tree")
     };
   }).filter(Boolean);
   const newRels=importedRelationships.map((r:any)=>({
     id:crypto.randomUUID(),
     from:idMap.get(String(r.from))||String(r.from),
     to:idMap.get(String(r.to))||String(r.to),
     type:String(r.type||"Associated with")
   })).filter((r:any)=>{
     const fromExists=people.some(p=>p.id===r.from)||additions.some((p:any)=>p.id===r.from);
     const toExists=people.some(p=>p.id===r.to)||additions.some((p:any)=>p.id===r.to);
     return r.from!==r.to && fromExists && toExists;
   });
   const newSources=importedSources.map((s:any)=>({
     id:crypto.randomUUID(),
     personId:idMap.get(String(s.personId))||String(s.personId||""),
     title:String(s.title||s.type||"Imported source"),
     type:String(s.type||"Imported"),
     date:String(s.date||""),
     url:String(s.url||""),
     notes:String(s.notes||"Imported with tree")
   })).filter((s:any)=>s.personId);
   setPeople(prev=>[...prev,...additions]);
   setRelationships(prev=>[...prev,...newRels]);
   setSources(prev=>[...prev,...newSources]);
   const importedIds=new Set(additions.map((p:any)=>p.id));
   const importedCandidates=[...additions];
   const bestImported=importedCandidates.sort((a:any,b:any)=>{
     const degree=(id:string)=>newRels.filter((r:any)=>r.from===id||r.to===id).length;
     return degree(b.id)-degree(a.id);
   })[0];
   setSelected(bestImported?.id || additions[0]?.id || selected);
   setImportStatus(`Imported ${importedPeople.length} people and automatically connected ${newRels.length} relationships. Existing matching people were merged; imported entries are marked for review.`);
 };

 const importTreeFile=async(e:React.ChangeEvent<HTMLInputElement>)=>{
   const file=e.target.files?.[0]; if(!file)return;
   setImportStatus("");
   try{
     const lower=file.name.toLowerCase();

     if(lower.endsWith(".json")){
       mergeImportedTree(JSON.parse(await file.text()));
     }else if(lower.endsWith(".ged") || lower.endsWith(".gedcom")){
       mergeImportedTree(parseGEDCOM(await file.text()));
     }else if(lower.endsWith(".zip")){
       // Ancestry delivers downloaded GEDCOMs inside a ZIP archive.
       // Open the archive locally and find the actual family-tree file.
       const bytes=new Uint8Array(await file.arrayBuffer());
       const archive=unzipSync(bytes);
       const gedEntry=Object.entries(archive).find(([name])=>{
         const n=name.toLowerCase();
         return n.endsWith(".ged") || n.endsWith(".gedcom");
       });
       if(!gedEntry){
         throw new Error("This ZIP does not contain a .ged or .gedcom family tree file. Make sure it is the Ancestry tree download, not a DNA or account-data download.");
       }
       mergeImportedTree(parseGEDCOM(strFromU8(gedEntry[1])));
     }else{
       throw new Error("Please choose the Ancestry ZIP download, a .ged/.gedcom file, or a Genealogy Guide .json export.");
     }
   }catch(err){
     setImportStatus(err instanceof Error?err.message:"Could not import that tree.");
   }finally{e.target.value="";}
 };

 const parseGEDCOM=(text:string)=>{
   // Ancestry exports standard GEDCOM records such as:
   // 0 @I1@ INDI / 1 NAME / 1 BIRT / 2 DATE / 1 FAMS @F1@
   // 0 @F1@ FAM / 1 HUSB @I1@ / 1 WIFE @I2@ / 1 CHIL @I3@
   const normalized=text.replace(/^\uFEFF/,"");
   const lines=normalized.split(/\r?\n/);
   const people:any[]=[];
   const relationships:any[]=[];
   const sources:any[]=[];
   const byId=new Map<string,any>();
   const families:any[]=[];
   const personFamilyRefs=new Map<string,{familiesAsChild:string[];familiesAsSpouse:string[]}>();
   let currentPerson:any=null;
   let currentFamily:any=null;
   let currentEvent="";

   for(const raw of lines){
     const line=raw.trimEnd();
     if(!line)continue;

     // GEDCOM: level, optional @xref@, tag, optional value.
     const match=line.match(/^(\d+) (?:(@[^@]+@) )?([^ ]+)(?: (.*))?$/);
     if(!match)continue;

     const level=Number(match[1]);
     const xref=(match[2]||"").replace(/^@|@$/g,"");
     const tag=match[3];
     const value=match[4]||"";

     if(level===0){
       currentPerson=null;
       currentFamily=null;
       currentEvent="";

       if(xref && (tag==="INDI" || tag==="PERSON")){
         currentPerson={
           id:xref,
           name:"Unnamed person",
           relation:"Imported",
           status:"Imported — needs review",
           birth:"",
           death:"",
           places:"",
           notes:""
         };
         byId.set(xref,currentPerson);
         people.push(currentPerson);
       }else if(xref && tag==="FAM"){
         currentFamily={id:xref,husb:"",wife:"",children:[]};
         families.push(currentFamily);
       }
       continue;
     }

     // Family links occur inside a FAM record.
     if(currentFamily && level===1){
       const linkedId=value.trim().replace(/^@|@$/g,"");
       if(tag==="HUSB"){currentFamily.husb=linkedId;continue;}
       if(tag==="WIFE"){currentFamily.wife=linkedId;continue;}
       if(tag==="CHIL"){if(linkedId)currentFamily.children.push(linkedId);continue;}
     }

     if(!currentPerson)continue;

     if(level===1){
       if(tag==="FAMS" || tag==="FAMC"){
         const familyId=value.trim().replace(/^@|@$/g,"");
         if(familyId){
           const refs=personFamilyRefs.get(currentPerson.id)||{familiesAsChild:[],familiesAsSpouse:[]};
           if(tag==="FAMS")refs.familiesAsSpouse.push(familyId); else refs.familiesAsChild.push(familyId);
           personFamilyRefs.set(currentPerson.id,refs);
         }
         currentEvent="";
         continue;
       }
       if(tag==="NAME"){
         const cleaned=value.replaceAll("/","").replace(/\s+/g," ").trim();
         if(cleaned)currentPerson.name=cleaned;
         currentEvent="";
         continue;
       }
       if(tag==="BIRT"){currentEvent="BIRT";continue;}
       if(tag==="DEAT"){currentEvent="DEAT";continue;}
       if(tag==="NOTE"){currentPerson.notes=value;continue;}
       currentEvent="";
     }

     if(level>=2 && tag==="DATE"){
       if(currentEvent==="BIRT")currentPerson.birth=value;
       if(currentEvent==="DEAT")currentPerson.death=value;
       continue;
     }

     if(level>=2 && tag==="PLAC"){
       currentPerson.places=currentPerson.places
         ? currentPerson.places+"; "+value
         : value;
       continue;
     }

     if(level>=2 && tag==="CONT" && currentPerson.notes){
       currentPerson.notes+="\\n"+value;
     }
   }

   const has=(id:string)=>Boolean(id && byId.has(id));

   const relationshipKeys=new Set<string>();
   const addParsedRelationship=(from:string,to:string,type:string)=>{
     if(!from || !to || from===to || !has(from) || !has(to))return;
     const key=from+"|"+to+"|"+type;
     if(relationshipKeys.has(key))return;
     relationshipKeys.add(key);
     relationships.push({id:crypto.randomUUID(),from,to,type});
   };

   for(const family of families){
     addParsedRelationship(family.husb,family.wife,"Spouse of");
     for(const child of family.children){
       addParsedRelationship(family.husb,child,"Parent of");
       addParsedRelationship(family.wife,child,"Parent of");
     }
   }

   const familyById=new Map(families.map(f=>[f.id,f]));
   for(const [personId,refs] of personFamilyRefs){
     for(const familyId of refs.familiesAsChild){
       const family=familyById.get(familyId);
       if(!family)continue;
       addParsedRelationship(family.husb,personId,"Parent of");
       addParsedRelationship(family.wife,personId,"Parent of");
     }
     for(const familyId of refs.familiesAsSpouse){
       const family=familyById.get(familyId);
       if(!family)continue;
       if(family.husb===personId)addParsedRelationship(personId,family.wife,"Spouse of");
       if(family.wife===personId)addParsedRelationship(personId,family.husb,"Spouse of");
     }
   }

   if(!people.length){
     throw new Error("The GEDCOM file was read, but no individual records were found. Make sure you exported the actual family tree as a GEDCOM file from Ancestry.");
   }

   return {people,relationships,sources};
 };

 const exportTree=()=>{
   const blob=new Blob([JSON.stringify({people,sources,relationships,exportedAt:new Date().toISOString()},null,2)],{type:"application/json"});
   const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="genealogy-guide-tree.json";a.click();URL.revokeObjectURL(a.href);
 };
 const current=people.find(p=>p.id===selected)||people[0];
 const currentSources=sources.filter(s=>s.personId===current.id);
 const currentRels=relationships.filter(r=>r.from===current.id || r.to===current.id);
 const migrationStops=parseMigrationStops(people,relationships,sources);
 const migrationStates=Array.from(new Set(migrationStops.map(s=>s.state)));
 const migrationReady=migrationStops.length>=2 && migrationStates.length>=2;
 const openMigration=()=>{if(migrationReady)window.location.href="/migration-map?from=tree";};
 const otherPeople=people.filter(p=>p.id!==current.id);
 const currentHasSources=currentSources.length>0;
 const sourceHint= !currentHasSources ? {
   title:"Need help finding a source?",
   text: current.birth ? "Start with census, birth/baptism, marriage, death, land, probate, church, military, or newspaper records that match this person's place and date." : "Add an estimated date and location first. Genealogy Guide can then suggest the record types most likely to help.",
   steps:["Define exactly what you are trying to prove.","Search the strongest record type for that question.","Save the original record or a precise citation.","Write down what the record actually establishes."]
 } : null;

 return <section className="page">
  <p className="eyebrow">MY FAMILY TREE</p><h2>Your research database.</h2>
  <p className="lead">This is now a structured local genealogy database: people, life details, relationships, sources, and research notes stay together in your browser.</p>
  <div className="treeToolbar">
   <button className="primary" onClick={()=>document.getElementById("tree-person-name")?.focus()}><UserPlus size={17}/> Add person</button>
   <button className="secondary light" onClick={()=>importInputRef.current?.click()}><Upload size={16}/> Import tree</button>
   <input ref={importInputRef} type="file" accept=".ged,.gedcom,.json,.zip" hidden onChange={importTreeFile}/>
   <button className="secondary light" onClick={exportTree}><Download size={16}/> Export tree</button>
   <button className="dangerButton" onClick={deletePerson} disabled={current.id==="root"}>Delete person</button>
   <button className="dangerButton" onClick={deleteTree}>Delete tree</button>
   <span><ShieldCheck size={16}/> Stored locally on this device</span>
  </div>
  <div className="treeLayout">
   <div className="treePanel">
    <FamilyTreeCanvas people={people} relationships={relationships} selectedId={selected} onSelect={setSelected}/>
    <div className="addPerson" id="add-person">
      <input id="tree-person-name" value={name} onChange={e=>setName(e.target.value)} placeholder="Person's name"/>
      <select value={relation} onChange={e=>setRelation(e.target.value)}><option>Parent</option><option>Grandparent</option><option>Child</option><option>Spouse</option><option>Sibling</option><option>Other</option></select>
      <input value={birth} onChange={e=>setBirth(e.target.value)} placeholder="Birth (e.g. 1842)"/>
      <input value={death} onChange={e=>setDeath(e.target.value)} placeholder="Death (e.g. 1922)"/>
      <input value={places} onChange={e=>setPlaces(e.target.value)} placeholder="Places / counties / states"/>
      <button onClick={add}><Plus size={18}/> Add Person</button>
    </div>
    <div className="treeSectionBox">
      <h4>Connect a relationship</h4>
      <div className="treeFormRow">
       <select value={relType} onChange={e=>setRelType(e.target.value)}><option>Parent of</option><option>Child of</option><option>Spouse of</option><option>Sibling of</option><option>Associated with</option></select>
       <select value={relTo} onChange={e=>setRelTo(e.target.value)}><option value="">Choose person</option>{otherPeople.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select>
       <button className="secondary light" onClick={addRelationship}>Connect</button>
      </div>
    </div>
   </div>
   <div className="personPanel">
    <p className="eyebrow">SELECTED PERSON</p><h3>{current.name}</h3>
    <p><MapPin size={15}/> Relationship: {current.relation}</p>
    <div className="statusBadge">{current.status}</div>
    {(current.birth||current.death||current.places)&&<div className="personFacts personLifeFacts">
      {current.birth&&<span><strong>Birth date / place</strong><small>{current.birth}</small></span>}
      {current.death&&<span><strong>Death date / place</strong><small>{current.death}</small></span>}
      {current.places&&<span className="personResidence"><strong>Residence / places lived</strong><small>{current.places}</small></span>}
    </div>}
    <h4>Relationships</h4>
    {currentRels.length===0?<p className="empty">No relationship links recorded yet.</p>:currentRels.map(r=>{const id=r.from===current.id?r.to:r.from;const p=people.find(x=>x.id===id);return <button className="attached relationshipItem" key={r.id} onClick={()=>setSelected(id)}><GitBranch size={15}/><span>{r.type}<small>{p?.name||"Unknown person"}</small></span></button>})}
    {sourceHint&&<div className="sourceHint"><div className="sourceHintIcon"><Search size={18}/></div><div><p className="eyebrow">SOURCE HELPER</p><h4>{sourceHint.title}</h4><p>{sourceHint.text}</p><ol>{sourceHint.steps.map(s=><li key={s}>{s}</li>)}</ol><button type="button" className="secondary light" onClick={()=>document.querySelector(".wideInput")?.scrollIntoView({behavior:"smooth",block:"center"})}>Start adding evidence <ArrowRight size={14}/></button></div></div>}
    <h4>Add a source</h4>
    <input className="wideInput" value={sourceTitle} onChange={e=>setSourceTitle(e.target.value)} placeholder="Source title / record description"/>
    <div className="treeFormRow"><select value={sourceType} onChange={e=>setSourceType(e.target.value)}><option>Census</option><option>Birth / baptism</option><option>Marriage</option><option>Death / burial</option><option>Probate</option><option>Deed / land</option><option>Military</option><option>Church</option><option>Newspaper</option><option>DNA</option><option>Other</option></select><input value={sourceUrl} onChange={e=>setSourceUrl(e.target.value)} placeholder="Record URL (optional)"/></div>
    <textarea className="wideTextarea" value={sourceNotes} onChange={e=>setSourceNotes(e.target.value)} placeholder="What does this source actually say? Include page, image, certificate, archive, or collection details."/>
    <button className="primary full" onClick={addSource}><Plus size={16}/> Attach source to {current.name}</button>
    <h4>Attached sources</h4>
    {currentSources.length===0?<p className="empty">No sources attached yet.</p>:currentSources.map(s=><div className="sourceCard" key={s.id}><div><strong>{s.title}</strong><small>{s.type} • Added {s.date}</small>{s.notes&&<span>{s.notes}</span>}{s.url&&<a href={s.url} target="_blank" rel="noreferrer">Open record</a>}</div></div>)}
   </div>
  </div>
  {importStatus&&<div className="treeImportStatus"><strong>Tree import:</strong> {importStatus}<small>Supported: Ancestry ZIP/GEDCOM (.zip/.ged/.gedcom) and Genealogy Guide JSON. Ancestry ZIP downloads are opened locally in your browser and the GEDCOM inside is imported. The app does not access your Ancestry account.</small></div>}
  {migrationReady&&<div className="migrationUnlock">
   <div className="migrationUnlockIcon"><MapPinned size={23}/></div>
   <div className="migrationUnlockCopy"><p className="eyebrow">MIGRATION MAP UNLOCKED</p><h3>Your tree shows movement across states.</h3><p>Genealogy Guide found {migrationStops.length} location points across {migrationStates.length} states in your tree. Open the map to watch the ancestor locations in chronological order.</p><small>Only locations found in your tree are used. A connecting line shows chronological evidence, not an exact travel route.</small></div>
   <button className="primary" onClick={openMigration}><MapPinned size={17}/> View Migration Map <ArrowRight size={15}/></button>
  </div>}
  <div className="notice"><ShieldCheck/><span><strong>Evidence reminder:</strong> the database stores claims and sources; it does not automatically prove a relationship. Kinley can use this structured tree context to identify missing evidence, conflicts, and better next records.</span></div>
 </section>
}
function Tools(){const [open,setOpen]=useState<ToolKey>(null),[text,setText]=useState(""),[saved,setSaved]=useState<string[]>([]),[guide,setGuide]=useState("");const [panel,setPanel]=useState<string|null>(null);const tools:[Exclude<ToolKey,null>,string][]=[["Evidence Checker","Rate a claim using evidence instead of intuition."],["Research Log","Record searches, repositories, findings, and next steps."],["Name Variants","Track spelling changes, aliases, initials, and indexing errors."],["Timeline Builder","Put events in chronological order to expose conflicts."],["Relationship Analyzer","Test whether two records could refer to the same person."],["Brick Wall Planner","Turn an unknown parent or missing generation into a targeted plan."]];const openTool=(t:Exclude<ToolKey,null>)=>{setOpen(t);setText(localStorage.getItem("gg-tool-"+t)||"");setGuide(toolDetails[t])};const closeTool=()=>{setOpen(null);setText("")};const saveTool=()=>{if(!open)return;localStorage.setItem("gg-tool-"+open,text);setSaved(x=>[...x.filter(v=>v!==open),open])};return <section className="page"><p className="eyebrow">RESEARCH TOOLS</p><h2>Tools built around evidence.</h2><p className="lead">Every tool is designed to keep hypotheses, source evidence, and conclusions separate.</p><div className="toolGrid">{tools.map(([t,d])=><article key={t}><div className="cardIcon"><Wrench size={22}/></div><h3>{t}</h3><p>{d}</p><button type="button" className="toolOpenButton" onClick={()=>openTool(t)}>Open Tool <ArrowRight size={15}/></button></article>)}</div><div className="toolGrid upgradeTools">{[["Research Dashboard","See people needing evidence, unresolved relationships, and unfinished searches.","Dashboard"],["Citation Generator","Turn record details into a consistent genealogy citation.","Citation"],["Source Quality","Warn when weak/user-created sources are treated as proof.","Source"],["Research Gaps","Flag unsupported parents, spouses, and major life events.","Gaps"],["Duplicate Detector","Compare names, dates, places, spouses, parents, and timelines.","Duplicates"],["GEDCOM Conflict Report","Review conflicting names, dates, parents, spouses, and imported facts.","GEDCOM"]].map(([t,d,k])=><article key={t}><div className="cardIcon"><Search size={22}/></div><h3>{t}</h3><p>{d}</p><button className="toolOpenButton" onClick={()=>setPanel(k)}>Open <ArrowRight size={15}/></button></article>)}</div>{panel&&<div className="upgradePanel"><div className="upgradePanelHead"><div><p className="eyebrow">{panel}</p><h3>{panel==="Dashboard"?"Research Dashboard":panel==="Citation"?"Citation Generator":panel==="Source"?"Source Quality":panel==="Gaps"?"Research-Gap Detector":panel==="Duplicates"?"Duplicate-Person Detector":"GEDCOM Conflict Report"}</h3></div><button onClick={()=>setPanel(null)}><X/></button></div>{panel==="Citation"&&<CitationPanel/>}{panel==="Dashboard"&&<DashboardPanel/>}{panel==="Source"&&<SourceQualityPanel/>}{panel==="Gaps"&&<GapPanel/>}{panel==="Duplicates"&&<DuplicatePanel/>}{panel==="GEDCOM"&&<GedcomPanel/>}</div>}<div className="upgradePanel"><p className="eyebrow">CASE TEMPLATES</p><h3>Start with a research question</h3><div className="templateGrid">{CASE_TEMPLATES.map(t=><button key={t.id} onClick={()=>{localStorage.setItem("gg-case-question",t.question);localStorage.setItem("gg-case-template",t.id)}}><strong>{t.name}</strong><small>{t.records.join(" • ")}</small></button>)}</div></div><ResearchCommandCenter/><ResearchWorkspace/><div className="evidence"><h3>Evidence labels</h3><div>{["Supported","Probable","Possible","Unverified","Disproved"].map(x=><span key={x}>{x}</span>)}</div></div>{saved.length>0&&<div className="toolSaved"><CheckCircle2 size={16}/> Saved locally: {saved.join(", ")}</div>}{open&&<div className="modalBack" onClick={closeTool}><div className="toolModal" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}><div className="toolModalHead"><div><p className="eyebrow">TOOL</p><h3>{open}</h3></div><button type="button" onClick={closeTool}><X/></button></div><p>{guide}</p><div className="toolTip">Tip: write the question as a claim you can test, then record the source and what it directly establishes.</div><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Enter your research question, claim, or notes here..."/><div className="toolActions"><button type="button" className="primary" onClick={saveTool}><CheckCircle2 size={16}/> Save locally</button><button type="button" className="secondary light" onClick={closeTool}>Close</button></div></div></div>}</section>}
function CitationPanel(){const [v,setV]=useState<Record<string,string>>({creator:"",title:"",collection:"",repository:"",date:"",url:""});const out=(v.creator||"[Creator]")+" ("+(v.date||"n.d.")+"). "+(v.title||"[Record title]")+". "+(v.collection?v.collection+". ":"")+(v.repository||"[Repository]")+(v.url?" — "+v.url:"")+".";return <div><div className="citationGrid">{Object.keys(v).map(k=><input key={k} placeholder={k} value={v[k]} onChange={e=>setV({...v,[k]:e.target.value})}/>)}</div><div className="citationOutput">{out}</div></div>}
function DashboardPanel(){return <div className="dashboardStats"><div><b>Local</b><span>Research data stays on this device</span></div><div><b>Review</b><span>Use evidence labels for relationships</span></div><div><b>Offline</b><span>Core workspace remains available</span></div></div>}
function SourceQualityPanel(){return <div className="qualityList"><p><b>Primary:</b> contemporary original record or direct image.</p><p><b>Derivative:</b> index, transcription, or abstract.</p><p><b>Secondary:</b> authored history or compiled work.</p><p><b>Tertiary:</b> unsourced online tree or copied summary — lead, not proof.</p></div>}
function GapPanel(){return <div className="qualityList"><p><b>Flag:</b> parent, spouse, or major event with no attached source.</p><p><b>Flag:</b> relationship labeled supported without documentary evidence.</p><p><b>Flag:</b> source does not actually establish the claimed relationship.</p></div>}
function DuplicatePanel(){return <div className="qualityList"><p>Compare name variants, birth/death dates, places, spouses, parents, occupations, and overlapping timelines.</p><p><b>Never auto-merge.</b> Review identity evidence first.</p></div>}
function GedcomPanel(){return <div className="qualityList"><p>Review imported names, dates, parents, spouses, and family links for conflicts before accepting them.</p><p>Imported data should remain marked for review until validated.</p></div>}
function DNA(){return <section className="page"><p className="eyebrow">GENETIC GENEALOGY</p><h2>Use DNA as evidence—not a shortcut.</h2><p className="lead">DNA can support or challenge documentary research, but a DNA match does not automatically identify an exact ancestor.</p><div className="dnaCards">{[["Autosomal DNA","Best for recent generations and cousin matching across many branches."],["Y-DNA","Follows the direct paternal line and can be especially useful for surname-line research."],["mtDNA","Follows the direct maternal line and can investigate deep maternal ancestry."],["Triangulation","Compare shared matches and segments to strengthen a genetic relationship hypothesis."]].map(([t,d])=><article key={t}><Dna/><h3>{t}</h3><p>{d}</p><button className="textButton" onClick={()=>window.alert(t+" research guide: "+d)}>Open guide <ArrowRight size={14}/></button></article>)}</div><div className="notice"><Microscope/><span><strong>Kinley rule:</strong> DNA results should be interpreted alongside documented relationships, geography, chronology, and source evidence.</span></div></section>}

function Kinley({close,go}:{close:()=>void,go:(s:Section)=>void}){ return <KinleyDesk close={close}/> }
function InstallHelp({close}:{close:()=>void}){return <div className="modalBack" onClick={close}><div className="modal" onClick={e=>e.stopPropagation()}><button className="close" onClick={close}><X/></button><Smartphone className="installIcon"/><p className="eyebrow">APP INSTALLATION</p><h2>Install Genealogy Guide</h2><p>On supported browsers, use your browser's <strong>Install</strong> or <strong>Add to Home Screen</strong> option. The app is being prepared as a Progressive Web App so it can launch like an app without needing a separate browser tab.</p><button className="primary full" onClick={close}><CheckCircle2 size={16}/> Got it</button></div></div>}
