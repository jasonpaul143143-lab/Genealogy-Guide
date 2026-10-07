"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ClipboardCheck, Download, FileSearch, Plus, Search, ShieldCheck,
  Sparkles, Trash2, X, CheckCircle2, AlertTriangle, Clock3, Database
} from "lucide-react";

type EvidenceLevel = "Supported"|"Probable"|"Possible"|"Unverified"|"Disproved";
type Tab = "Case"|"Evidence"|"Search Plan"|"Timeline"|"QA";

type Evidence = {
  id:string; claim:string; person:string; sourceTitle:string; sourceType:string;
  level:EvidenceLevel; notes:string; date:string;
};
type SearchItem = {
  id:string; question:string; repository:string; collection:string;
  terms:string; dateRange:string; result:string; nextStep:string; done:boolean;
};
type EventItem = { id:string; person:string; date:string; event:string; place:string; source:string };

const levels:EvidenceLevel[]=["Supported","Probable","Possible","Unverified","Disproved"];
const repositories=["FamilySearch","Ancestry","National Archives","Library of Congress","Chronicling America","County/State Archive","Church Archive","Local Library","Other"];

function load<T>(key:string,fallback:T):T{
  try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch{return fallback}
}

export default function ResearchWorkspace(){
  const [tab,setTab]=useState<Tab>("Case");
  const [caseQuestion,setCaseQuestion]=useState("");
  const [hypothesis,setHypothesis]=useState("");
  const [knownFacts,setKnownFacts]=useState("");
  const [evidence,setEvidence]=useState<Evidence[]>([]);
  const [searches,setSearches]=useState<SearchItem[]>([]);
  const [events,setEvents]=useState<EventItem[]>([]);
  const [sourceClass,setSourceClass]=useState("Primary");
  const [claim,setClaim]=useState("");
  const [person,setPerson]=useState("");
  const [sourceTitle,setSourceTitle]=useState("");
  const [sourceType,setSourceType]=useState("Census");
  const [level,setLevel]=useState<EvidenceLevel>("Unverified");
  const [notes,setNotes]=useState("");
  const [question,setQuestion]=useState("");
  const [repository,setRepository]=useState("FamilySearch");
  const [collection,setCollection]=useState("");
  const [terms,setTerms]=useState("");
  const [dateRange,setDateRange]=useState("");
  const [result,setResult]=useState("");
  const [nextStep,setNextStep]=useState("");
  const [eventPerson,setEventPerson]=useState("");
  const [eventDate,setEventDate]=useState("");
  const [eventName,setEventName]=useState("");
  const [eventPlace,setEventPlace]=useState("");
  const [eventSource,setEventSource]=useState("");
  const [ready,setReady]=useState(false);

  useEffect(()=>{
    setCaseQuestion(localStorage.getItem("gg-case-question")||"");
    setHypothesis(localStorage.getItem("gg-case-hypothesis")||"");
    setKnownFacts(localStorage.getItem("gg-case-facts")||"");
    setEvidence(load<Evidence[]>("gg-workspace-evidence",[]));
    setSearches(load<SearchItem[]>("gg-workspace-searches",[]));
    setEvents(load<EventItem[]>("gg-workspace-events",[]));
    setReady(true);
  },[]);

  useEffect(()=>{if(!ready)return;localStorage.setItem("gg-case-question",caseQuestion);localStorage.setItem("gg-case-hypothesis",hypothesis);localStorage.setItem("gg-case-facts",knownFacts)},[ready,caseQuestion,hypothesis,knownFacts]);
  useEffect(()=>{if(ready)localStorage.setItem("gg-workspace-evidence",JSON.stringify(evidence))},[evidence,ready]);
  useEffect(()=>{if(ready)localStorage.setItem("gg-workspace-searches",JSON.stringify(searches))},[searches,ready]);
  useEffect(()=>{if(ready)localStorage.setItem("gg-workspace-events",JSON.stringify(events))},[events,ready]);

  const tree=useMemo(()=>load<any>("gg-tree",{}),[ready,evidence.length,searches.length,events.length]);
  const people=Array.isArray(tree?.people)?tree.people:[];
  const contradictions=useMemo(()=>{
    const byPerson=new Map<string,EventItem[]>();
    for(const e of events){const arr=byPerson.get(e.person.toLowerCase())||[];arr.push(e);byPerson.set(e.person.toLowerCase(),arr)}
    const out:string[]=[];
    for(const [name,arr] of byPerson){
      const dates=arr.map(x=>x.date.trim()).filter(Boolean);
      if(new Set(dates).size<dates.length) continue;
      if(dates.length>1) out.push(name);
    }
    return out;
  },[events]);

  const addEvidence=()=>{
    if(!claim.trim()||!sourceTitle.trim())return;
    setEvidence(p=>[...p,{id:"EVID-"+String(p.length+1).padStart(4,"0"),claim:claim.trim(),person:person.trim(),sourceTitle:sourceTitle.trim(),sourceType:sourceType+" • "+sourceClass,level,notes:notes.trim(),date:new Date().toLocaleDateString()}]);
    setClaim("");setPerson("");setSourceTitle("");setNotes("");setLevel("Unverified");
  };
  const addSearch=()=>{
    if(!question.trim())return;
    setSearches(p=>[...p,{id:crypto.randomUUID(),question:question.trim(),repository,collection:collection.trim(),terms:terms.trim(),dateRange:dateRange.trim(),result:result.trim(),nextStep:nextStep.trim(),done:false}]);
    setQuestion("");setCollection("");setTerms("");setDateRange("");setResult("");setNextStep("");
  };
  const addEvent=()=>{
    if(!eventPerson.trim()||!eventDate.trim()||!eventName.trim())return;
    setEvents(p=>[...p,{id:crypto.randomUUID(),person:eventPerson.trim(),date:eventDate.trim(),event:eventName.trim(),place:eventPlace.trim(),source:eventSource.trim()}]);
    setEventPerson("");setEventDate("");setEventName("");setEventPlace("");setEventSource("");
  };
  const exportWorkspace=()=>{
    const payload={exportedAt:new Date().toISOString(),case:{question:caseQuestion,hypothesis,knownFacts},evidence,searches,events,treeSnapshot:tree};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="genealogy-guide-research-workspace.json";a.click();URL.revokeObjectURL(a.href);
  };
  const resetWorkspace=()=>{
    if(!confirm("Clear this research workspace? Your family tree is not deleted."))return;
    setCaseQuestion("");setHypothesis("");setKnownFacts("");setEvidence([]);setSearches([]);setEvents([]);
  };

  const recordLinks=[
    ["FamilySearch","Search FamilySearch records","https://www.familysearch.org/search/"],
    ["Ancestry","Search Ancestry records","https://www.ancestry.com/search/"],
    ["National Archives","U.S. federal records and research","https://www.archives.gov/research"],
    ["Chronicling America","Historical U.S. newspapers","https://chroniclingamerica.loc.gov/"],
    ["Library of Congress","Digital collections and newspapers","https://www.loc.gov/"]
  ];

  return <section className="researchWorkspace">
    <div className="workspaceHeader">
      <div><p className="eyebrow">RESEARCH WORKSPACE</p><h3>Run a real genealogy investigation.</h3><p>Keep the question, hypothesis, searches, evidence, contradictions, and conclusion in one case file.</p></div>
      <div className="workspaceActions"><button className="secondary light" onClick={exportWorkspace}><Download size={15}/> Export case</button><button className="secondary light" onClick={resetWorkspace}><Trash2 size={15}/> Clear case</button></div>
    </div>
    <div className="workspaceTabs">{(["Case","Evidence","Search Plan","Timeline","QA"] as Tab[]).map(t=><button key={t} className={tab===t?"active":""} onClick={()=>setTab(t)}>{t}</button>)}</div>

    {tab==="Case"&&<div className="workspaceGrid">
      <label>Research question<textarea value={caseQuestion} onChange={e=>setCaseQuestion(e.target.value)} placeholder="Who was the father of John Scoggins, born about 1822 in Georgia?"/></label>
      <label>Working hypothesis<textarea value={hypothesis} onChange={e=>setHypothesis(e.target.value)} placeholder="State a candidate relationship, but keep it explicitly as a hypothesis until proved."/></label>
      <label className="wide">Known facts and constraints<textarea value={knownFacts} onChange={e=>setKnownFacts(e.target.value)} placeholder="Dates, places, spouses, children, records already located, contradictions, and jurisdictions."/></label>
      <div className="caseChecklist"><strong>Investigation standard</strong><span>Primary record first</span><span>Identity before relationship</span><span>Record negative searches</span><span>Never fill a gap by resemblance</span></div>
      <div className="recordSearchBox"><div><FileSearch/><div><strong>Open a record search</strong><small>Genealogy Guide does not copy protected record images. Use the provider's original search and bring the citation/evidence back here.</small></div></div><div className="recordSearchLinks">{recordLinks.map(([name,label,url])=><a key={name} href={url} target="_blank" rel="noreferrer"><span>{name}<small>{label}</small></span><Search size={14}/></a>)}</div></div>
    </div>}

    {tab==="Evidence"&&<div>
      <div className="workspaceForm">
        <input value={claim} onChange={e=>setClaim(e.target.value)} placeholder="Claim this evidence addresses"/>
        <input value={person} onChange={e=>setPerson(e.target.value)} placeholder="Person / relationship"/>
        <input value={sourceTitle} onChange={e=>setSourceTitle(e.target.value)} placeholder="Source title / citation"/>
        <select value={sourceType} onChange={e=>setSourceType(e.target.value)}><option>Census</option><option>Birth / baptism</option><option>Marriage</option><option>Death / burial</option><option>Probate</option><option>Deed / land</option><option>Military</option><option>Church</option><option>Newspaper</option><option>DNA</option><option>Other</option></select>
        <select value={sourceClass} onChange={e=>setSourceClass(e.target.value)}><option>Primary</option><option>Derivative</option><option>Secondary</option><option>Tertiary</option></select>
        <select value={level} onChange={e=>setLevel(e.target.value as EvidenceLevel)}>{levels.map(x=><option key={x}>{x}</option>)}</select>
        <textarea className="wide" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="What does the source actually establish? Who created it, when, why, and what information did they know?"/>
        <button className="primary" onClick={addEvidence}><Plus size={15}/> Add evidence</button>
      </div>
      <div className="workspaceList">{evidence.length===0?<div className="workspaceEmpty"><Database/>No evidence entered yet.</div>:evidence.map(e=><article className={"evidenceRow level-"+e.level.toLowerCase()} key={e.id}><div><strong>{e.id} · {e.claim}</strong><small>{e.person||"Person not specified"} • {e.sourceType} • {e.date}</small><p>{e.sourceTitle}</p>{e.notes&&<span>{e.notes}</span>}</div><b>{e.level}</b></article>)}</div>
    </div>}

    {tab==="Search Plan"&&<div>
      <div className="workspaceForm searchForm">
        <input className="wide" value={question} onChange={e=>setQuestion(e.target.value)} placeholder="What are you trying to prove?"/>
        <select value={repository} onChange={e=>setRepository(e.target.value)}>{repositories.map(x=><option key={x}>{x}</option>)}</select>
        <input value={collection} onChange={e=>setCollection(e.target.value)} placeholder="Collection / record group"/>
        <input value={terms} onChange={e=>setTerms(e.target.value)} placeholder="Names, variants, places, keywords"/>
        <input value={dateRange} onChange={e=>setDateRange(e.target.value)} placeholder="Date range"/>
        <textarea className="wide" value={result} onChange={e=>setResult(e.target.value)} placeholder="Result — include negative searches and what you actually found."/>
        <textarea className="wide" value={nextStep} onChange={e=>setNextStep(e.target.value)} placeholder="Next step"/>
        <button className="primary" onClick={addSearch}><Plus size={15}/> Add search</button>
      </div>
      <div className="workspaceList">{searches.length===0?<div className="workspaceEmpty"><Search/>No searches logged yet.</div>:searches.map(s=><article className={"searchRow "+(s.done?"done":"")} key={s.id}><div><strong>{s.question}</strong><small>{s.repository}{s.collection&&" • "+s.collection}{s.dateRange&&" • "+s.dateRange}</small><p>{s.terms||"No search terms recorded."}</p>{s.result&&<span><b>Result:</b> {s.result}</span>}{s.nextStep&&<span><b>Next:</b> {s.nextStep}</span>}</div><button onClick={()=>setSearches(p=>p.map(x=>x.id===s.id?{...x,done:!x.done}:x))}>{s.done?<CheckCircle2/>:<Clock3/>}</button></article>)}</div>
    </div>}

    {tab==="Timeline"&&<div>
      <div className="workspaceForm timelineForm">
        <input value={eventPerson} onChange={e=>setEventPerson(e.target.value)} placeholder="Person"/>
        <input value={eventDate} onChange={e=>setEventDate(e.target.value)} placeholder="Date / year"/>
        <input value={eventName} onChange={e=>setEventName(e.target.value)} placeholder="Event"/>
        <input value={eventPlace} onChange={e=>setEventPlace(e.target.value)} placeholder="Place"/>
        <input className="wide" value={eventSource} onChange={e=>setEventSource(e.target.value)} placeholder="Source / citation"/>
        <button className="primary" onClick={addEvent}><Plus size={15}/> Add event</button>
      </div>
      {contradictions.length>0&&<div className="workspaceAlert"><AlertTriangle/><span><strong>Review possible timeline conflicts:</strong> {contradictions.join(", ")} have multiple distinct event dates recorded. That is a review flag, not proof of an error.</span></div>}
      <div className="timelineRows">{events.length===0?<div className="workspaceEmpty"><Clock3/>No events entered yet.</div>:[...events].sort((a,b)=>a.date.localeCompare(b.date)).map(e=><article key={e.id}><time>{e.date}</time><div><strong>{e.event}</strong><span>{e.person}{e.place&&" • "+e.place}</span>{e.source&&<small>{e.source}</small>}</div><button onClick={()=>setEvents(p=>p.filter(x=>x.id!==e.id))}><X size={15}/></button></article>)}</div>
    </div>}

    {tab==="QA"&&<div className="qaGrid">
      <article><ShieldCheck/><strong>Evidence coverage</strong><b>{evidence.filter(e=>e.level==="Supported").length} supported</b><small>{evidence.length} total evidence items</small></article>
      <article><ClipboardCheck/><strong>Research progress</strong><b>{searches.filter(s=>s.done).length}/{searches.length || 0} searches complete</b><small>Log negative searches too.</small></article>
      <article><AlertTriangle/><strong>Timeline review</strong><b>{contradictions.length ? contradictions.length+" possible conflicts" : "No flags"}</b><small>Flags require human review.</small></article>
      <article><Database/><strong>Tree data</strong><b>{people.length} people</b><small>{Array.isArray(tree?.relationships)?tree.relationships.length:0} relationships currently stored.</small></article>
      <article><Sparkles/><strong>Kinley readiness</strong><b>{caseQuestion.trim()?"Context ready":"Add a research question"}</b><small>The AI can use this case structure when the API is connected.</small></article>
      <article><CheckCircle2/><strong>Local persistence</strong><b>Enabled</b><small>Case data is stored in this browser until you clear it.</small></article>
    </div>}
  </section>
}
