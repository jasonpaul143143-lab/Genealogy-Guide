"use client";

import {
  BookOpen, Search, GitBranch, Dna, Sparkles, ShieldCheck, Home as HomeIcon, Wrench,
  FileText, Landmark, ScrollText, Newspaper, Users, ClipboardList, ArrowRight,
  ChevronRight, Plus, X, GraduationCap, Microscope, ExternalLink, Database,
  CheckCircle2, Clock3, MapPin, UserPlus, Link2, Download, Smartphone, Send, Loader2, Save, Upload
} from "lucide-react";
import { useEffect, useState } from "react";
import KinleyDesk from "./components/KinleyDesk";

type Section = "Home"|"Learn"|"Research"|"Tree"|"Tools"|"DNA";
type ToolKey = "Evidence Checker"|"Research Log"|"Name Variants"|"Timeline Builder"|"Relationship Analyzer"|"Brick Wall Planner"|null;

const lessons = [
  ["01","Genealogy Foundations","How family trees work, what evidence means, and why a plausible connection is not automatically a proven one."],
  ["02","Start With What You Know","Build a reliable starting point from yourself, relatives, certificates, photographs, and interviews."],
  ["03","Census Records","Use household structure, ages, occupations, relationships, neighbors, and migration clues."],
  ["04","Birth, Marriage & Death","Use vital records to establish identities and relationships while understanding indexes versus originals."],
  ["05","Church & Cemetery Records","Use baptisms, burials, church minutes, cemetery records, and memorial evidence appropriately."],
  ["06","Land, Deeds & Probate","Follow property transfers, wills, estates, guardianships, heirs, and witnesses."],
  ["07","Military Records","Trace service, pensions, units, residences, and identity evidence."],
  ["08","Newspapers & Local History","Use obituaries, marriage notices, community news, county histories, and archives."],
  ["09","Evidence & Source Quality","Distinguish original, derivative, authored, primary, secondary, and tertiary sources."],
  ["10","Resolving Conflicts","Compare dates, places, relationships, and records systematically when sources disagree."],
  ["11","DNA & Genetic Genealogy","Understand autosomal DNA, Y-DNA, mtDNA, matches, triangulation, and limitations."],
  ["12","Brick-Wall Research","Turn an unknown parent or missing generation into a focused research question and record plan."]
];

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

const recordCollections = [
  ["Ancestry record search","Search Ancestry's record collections for a person or family. The app links you to Ancestry rather than copying protected record images.","https://www.ancestry.com/search/"],
  ["Ancestry census collections","Explore U.S. census collections available through Ancestry.","https://www.ancestry.com/search/categories/us_census/"],
  ["Ancestry vital records","Search Ancestry's birth, marriage, and death record collections.","https://www.ancestry.com/search/categories/bmd_birth/"],
  ["Ancestry military records","Search military collections and service-related records on Ancestry.","https://www.ancestry.com/search/categories/military/"]
];

function Logo(){return <div className="logo" aria-label="Genealogy Guide logo"><span/><span/><span/><i/></div>}

export default function HomePage(){
  const [section,setSection]=useState<Section>("Home");
  const [lesson,setLesson]=useState<number|null>(null);
  const [showKinley,setShowKinley]=useState(false);
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
    <header>
      <button className="brand brandButton" onClick={()=>go("Home")}><Logo/><div><h1>Genealogy Guide</h1><p>Learn. Research. Prove.</p></div></button>
      <div className="headerActions"><button className="installButton" onClick={install}><Smartphone size={16}/> Install</button><button className="kinley" onClick={()=>setShowKinley(true)}><Sparkles size={17}/> Kinley</button></div>
    </header>

    {section==="Home" && <HomeSection go={go} setShowKinley={setShowKinley} setLesson={setLesson}/>}
    {section==="Learn" && <Learn lessons={lessons} lesson={lesson} setLesson={setLesson}/>}
    {section==="Research" && <Research go={go}/>}
    {section==="Tree" && <Tree/>}
    {section==="Tools" && <Tools/>}
    {section==="DNA" && <DNA/>}

    {showKinley && <Kinley close={()=>setShowKinley(false)} go={go}/>}
    {showInstall && !installEvent && <InstallHelp close={()=>setShowInstall(false)}/>}

    <nav>
      {[
        ["Home",HomeIcon,"Home"],["Learn",BookOpen,"Learn"],["Research",Search,"Research"],
        ["Tree",GitBranch,"Tree"],["Tools",Wrench,"Tools"]
      ].map(([name,Icon,key])=><button className={section===key?"active":""} onClick={()=>go(key as Section)} key={key as string}><Icon size={19}/><span>{name as string}</span></button>)}
    </nav>
  </main>
}

function HomeSection({go,setShowKinley,setLesson}:{go:(s:Section)=>void,setShowKinley:(v:boolean)=>void,setLesson:(n:number|null)=>void}){
 return <>
 <section className="hero"><div><p className="eyebrow">THE GENEALOGY GUIDE</p><h2>Build a family tree you can actually prove.</h2><p>Go beyond names and dates. Learn how to find records, evaluate evidence, solve difficult relationships, use DNA responsibly, and document every discovery.</p><div className="heroActions"><button className="primary" onClick={()=>go("Learn")}>Start Learning <ArrowRight size={17}/></button><button className="secondary" onClick={()=>go("Research")}>Research Center</button></div></div><div className="principle"><ShieldCheck size={27}/><strong>The Kinley Principle</strong><span>Never invent an ancestor to fill a gap. A blank generation is better than a false one.</span><small>Evidence first • Sources matter • Conflicts get investigated</small></div></section>
 <section className="stats"><div><b>12</b><span>Core lessons</span></div><div><b>6</b><span>Research guides</span></div><div><b>5</b><span>Evidence levels</span></div><div><b>∞</b><span>Research questions</span></div></section>
 <section className="section"><div className="sectionTitle"><div><p className="eyebrow">EXPLORE</p><h3>Everything you need to research smarter</h3><p>Start anywhere. Genealogy Guide is designed to grow from a first family interview into advanced documentary and genetic research.</p></div></div>
 <div className="grid">{[
  ["Learn Genealogy","A structured path from absolute beginner to confident researcher.",BookOpen,"Learn"],
  ["Research Records","Know what census, vital, probate, land, military, church, and newspaper records can tell you.",Search,"Research"],
  ["Build Your Tree","Organize people, relationships, sources, and research status without hiding unsupported gaps.",GitBranch,"Tree"],
  ["DNA & Genetics","Understand autosomal DNA, Y-DNA, mtDNA, matches, and genetic genealogy.",Dna,"DNA"]
 ].map(([t,d,I,k])=><article key={t as string} onClick={()=>go(k as Section)}><div className="cardIcon"><I size={22}/></div><h4>{t as string}</h4><p>{d as string}</p><button onClick={(e)=>{e.stopPropagation();go(k as Section)}}>Explore <ArrowRight size={15}/></button></article>)}</div></section>
 <section className="feature"><div><p className="eyebrow">YOUR RESEARCH WORKFLOW</p><h3>Question → Record → Evidence → Conclusion</h3><p>Good genealogy is not about collecting the most names. It is about building defensible relationships from the records.</p></div><div className="workflow"><span><b>1</b>Ask a specific question</span><span><b>2</b>Find the best available record</span><span><b>3</b>Evaluate the source</span><span><b>4</b>Write the conclusion</span></div></section>
 <section className="lessons"><div className="sectionTitle compact"><p className="eyebrow">LEARNING PATH</p><h3>Start here</h3></div>{lessons.slice(0,4).map((l,i)=><button className="lesson" key={l[0]} onClick={()=>{go("Learn");setTimeout(()=>setLesson(i),50)}}><b>{l[0]}</b><div><strong>{l[1]}</strong><span>{l[2]}</span></div><ChevronRight/></button>)}</section>
 </>;
}

function Learn({lessons,lesson,setLesson}:{lessons:string[][],lesson:number|null,setLesson:(n:number|null)=>void}){
 return <section className="page"><p className="eyebrow">LEARN GENEALOGY</p><h2>From first search to serious researcher.</h2><p className="lead">Work through the lessons in order or open the skill you need right now.</p><div className="progress"><span style={{width:"8%"}}/><b>1 of 12 lessons started</b></div><div className="lessonList">{lessons.map((l,i)=><button className="lesson" key={l[0]} onClick={()=>setLesson(lesson===i?null:i)}><b>{l[0]}</b><div><strong>{l[1]}</strong><span>{l[2]}</span>{lesson===i&&<em><CheckCircle2 size={16}/> <span><strong>Lesson objective:</strong> learn to separate a research hypothesis from a documented conclusion. Start with the strongest available sources, write down what each source actually says, and record unresolved questions.</span></em>}</div><ChevronRight/></button>)}</div></section>
}

function Research({go}:{go:(s:Section)=>void}){
 return <section className="page"><p className="eyebrow">RESEARCH CENTER</p><h2>Choose the record type that answers your question.</h2><p className="lead">Don't search randomly. Start with the relationship or fact you need to establish, then choose the strongest record likely to contain it.</p><div className="researchBanner"><ClipboardList/><div><strong>Research checklist</strong><span>Question → Person → Place → Date → Record → Source → Evidence → Conclusion</span></div></div><div className="toolGrid">{researchTools.map(([t,d,I,detail])=><article key={t as string}><div className="cardIcon"><I size={22}/></div><h3>{t as string}</h3><p>{d as string}</p><button onClick={()=>go("Tools")}>Open Guide <ArrowRight size={15}/></button><small>{detail as string}</small></article>)}</div><div className="recordsBox"><div><Database/><div><p className="eyebrow">EXTERNAL RECORD COLLECTIONS</p><h3>Use the original provider when available</h3><p>Genealogy Guide can point you to record collections. It does not copy Ancestry's protected record images or database content.</p></div></div><div className="recordLinks">{recordCollections.map(([t,d,url])=><a key={t} href={url} target="_blank" rel="noreferrer"><span><strong>{t}</strong><small>{d}</small></span><ExternalLink size={16}/></a>)}</div></div></section>
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
 const addSource=()=>{
   if(!sourceTitle.trim())return;
   setSources(prev=>[...prev,{id:crypto.randomUUID(),personId:selected,title:sourceTitle.trim(),type:sourceType,date:new Date().toLocaleDateString(),url:sourceUrl.trim(),notes:sourceNotes.trim()}]);
   setSourceTitle("");setSourceUrl("");setSourceNotes("");
   setPeople(prev=>prev.map(p=>p.id===selected && p.status==="Needs sources"?{...p,status:"Research in progress"}:p));
 };
 const exportTree=()=>{
   const blob=new Blob([JSON.stringify({people,sources,relationships,exportedAt:new Date().toISOString()},null,2)],{type:"application/json"});
   const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="genealogy-guide-tree.json";a.click();URL.revokeObjectURL(a.href);
 };
 const current=people.find(p=>p.id===selected)||people[0];
 const currentSources=sources.filter(s=>s.personId===current.id);
 const currentRels=relationships.filter(r=>r.from===current.id || r.to===current.id);
 const otherPeople=people.filter(p=>p.id!==current.id);

 return <section className="page">
  <p className="eyebrow">MY FAMILY TREE</p><h2>Your research database.</h2>
  <p className="lead">This is now a structured local genealogy database: people, life details, relationships, sources, and research notes stay together in your browser.</p>
  <div className="treeToolbar">
   <button className="primary" onClick={()=>document.getElementById("tree-person-name")?.focus()}><UserPlus size={17}/> Add person</button>
   <button className="secondary light" onClick={exportTree}><Download size={16}/> Export tree</button>
   <span><ShieldCheck size={16}/> Stored locally on this device</span>
  </div>
  <div className="treeLayout">
   <div className="treePanel">
    <div className="treeTop"><div className="treeNode mainNode"><GitBranch size={17}/><span>{people[0].name}</span><small>Root</small></div></div>
    <div className="branches">{people.slice(1).map(p=><button className={selected===p.id?"treeNode selected":"treeNode"} key={p.id} onClick={()=>setSelected(p.id)}><GitBranch size={15}/><span>{p.name}</span><small>{p.relation} • {p.status}</small></button>)}</div>
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
    {(current.birth||current.death||current.places)&&<div className="personFacts">
      {current.birth&&<span><strong>Birth</strong>{current.birth}</span>}
      {current.death&&<span><strong>Death</strong>{current.death}</span>}
      {current.places&&<span><strong>Places</strong>{current.places}</span>}
    </div>}
    <h4>Relationships</h4>
    {currentRels.length===0?<p className="empty">No relationship links recorded yet.</p>:currentRels.map(r=>{const id=r.from===current.id?r.to:r.from;const p=people.find(x=>x.id===id);return <button className="attached relationshipItem" key={r.id} onClick={()=>setSelected(id)}><GitBranch size={15}/><span>{r.type}<small>{p?.name||"Unknown person"}</small></span></button>})}
    <h4>Add a source</h4>
    <input className="wideInput" value={sourceTitle} onChange={e=>setSourceTitle(e.target.value)} placeholder="Source title / record description"/>
    <div className="treeFormRow"><select value={sourceType} onChange={e=>setSourceType(e.target.value)}><option>Census</option><option>Birth / baptism</option><option>Marriage</option><option>Death / burial</option><option>Probate</option><option>Deed / land</option><option>Military</option><option>Church</option><option>Newspaper</option><option>DNA</option><option>Other</option></select><input value={sourceUrl} onChange={e=>setSourceUrl(e.target.value)} placeholder="Record URL (optional)"/></div>
    <textarea className="wideTextarea" value={sourceNotes} onChange={e=>setSourceNotes(e.target.value)} placeholder="What does this source actually say? Include page, image, certificate, archive, or collection details."/>
    <button className="primary full" onClick={addSource}><Plus size={16}/> Attach source to {current.name}</button>
    <h4>Attached sources</h4>
    {currentSources.length===0?<p className="empty">No sources attached yet.</p>:currentSources.map(s=><div className="sourceCard" key={s.id}><div><strong>{s.title}</strong><small>{s.type} • Added {s.date}</small>{s.notes&&<span>{s.notes}</span>}{s.url&&<a href={s.url} target="_blank" rel="noreferrer">Open record</a>}</div></div>)}
   </div>
  </div>
  <div className="notice"><ShieldCheck/><span><strong>Evidence reminder:</strong> the database stores claims and sources; it does not automatically prove a relationship. Kinley can use this structured tree context to identify missing evidence, conflicts, and better next records.</span></div>
 </section>
}
function Tools(){
 const [open,setOpen]=useState<ToolKey>(null);
 const tools:[Exclude<ToolKey,null>,string][]=[
 ["Evidence Checker","Rate a claim using evidence instead of intuition."],["Research Log","Record searches, repositories, findings, and next steps."],["Name Variants","Track spelling changes, aliases, initials, and indexing errors."],["Timeline Builder","Put events in chronological order to expose conflicts."],["Relationship Analyzer","Test whether two records could refer to the same person."],["Brick Wall Planner","Turn an unknown parent or missing generation into a targeted plan."]
 ];
 return <section className="page"><p className="eyebrow">RESEARCH TOOLS</p><h2>Tools built around evidence.</h2><p className="lead">Every tool is designed to keep hypotheses, source evidence, and conclusions separate.</p><div className="toolGrid">{tools.map(([t,d])=><article key={t}><div className="cardIcon"><Wrench size={22}/></div><h3>{t}</h3><p>{d}</p><button onClick={()=>setOpen(t)}>Open Tool <ArrowRight size={15}/></button></article>)}</div><div className="evidence"><h3>Evidence labels</h3><div>{["Supported","Probable","Possible","Unverified","Disproved"].map(x=><span key={x}>{x}</span>)}</div></div>{open&&<div className="toolModal"><div className="toolModalHead"><div><p className="eyebrow">TOOL</p><h3>{open}</h3></div><button onClick={()=>setOpen(null)}><X/></button></div><p>{toolDetails[open]}</p><textarea placeholder="Enter your research question, claim, or notes here..."/><div className="toolActions"><button className="primary" onClick={()=>setOpen(null)}><CheckCircle2 size={16}/> Save locally</button><button className="secondary light" onClick={()=>setOpen(null)}>Close</button></div></div>}</section>
}

function DNA(){return <section className="page"><p className="eyebrow">GENETIC GENEALOGY</p><h2>Use DNA as evidence—not a shortcut.</h2><p className="lead">DNA can support or challenge documentary research, but a DNA match does not automatically identify an exact ancestor.</p><div className="dnaCards">{[["Autosomal DNA","Best for recent generations and cousin matching across many branches."],["Y-DNA","Follows the direct paternal line and can be especially useful for surname-line research."],["mtDNA","Follows the direct maternal line and can investigate deep maternal ancestry."],["Triangulation","Compare shared matches and segments to strengthen a genetic relationship hypothesis."]].map(([t,d])=><article key={t}><Dna/><h3>{t}</h3><p>{d}</p><button className="textButton" onClick={()=>window.alert(t+" research guide: "+d)}>Open guide <ArrowRight size={14}/></button></article>)}</div><div className="notice"><Microscope/><span><strong>Kinley rule:</strong> DNA results should be interpreted alongside documented relationships, geography, chronology, and source evidence.</span></div></section>}

function Kinley({close,go}:{close:()=>void,go:(s:Section)=>void}){ return <KinleyDesk close={close}/> }
function InstallHelp({close}:{close:()=>void}){return <div className="modalBack" onClick={close}><div className="modal" onClick={e=>e.stopPropagation()}><button className="close" onClick={close}><X/></button><Smartphone className="installIcon"/><p className="eyebrow">APP INSTALLATION</p><h2>Install Genealogy Guide</h2><p>On supported browsers, use your browser's <strong>Install</strong> or <strong>Add to Home Screen</strong> option. The app is being prepared as a Progressive Web App so it can launch like an app without needing a separate browser tab.</p><button className="primary full" onClick={close}><CheckCircle2 size={16}/> Got it</button></div></div>}
