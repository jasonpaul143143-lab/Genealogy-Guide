"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, FileCheck2, GraduationCap, ClipboardCheck, RotateCcw, Sparkles, Search, BookOpen } from "lucide-react";

type Investigator = {
  id: string;
  name: string;
  role: string;
  url: string;
  note: string;
};

const investigators: Investigator[] = [
  { id:"i1", name:"FamilySearch AI", role:"Record discovery & historical records", url:"https://www.familysearch.org/", note:"Use for record discovery, full-text historical record searching, and AI-assisted research." },
  { id:"i2", name:"MyHeritage AI", role:"Documents, photos & record clues", url:"https://www.myheritage.com/", note:"Especially useful when a document, photograph, gravestone, or historical image needs transcription or interpretation." },
  { id:"i3", name:"Ancestry AI", role:"Tree context & record-based clues", url:"https://www.ancestry.com/", note:"Use the AI features available with your Ancestry account to inspect records, timelines, and research suggestions." },
  { id:"i4", name:"Goldie May", role:"Methodical genealogy research", url:"https://www.goldiemay.com/", note:"Useful for research logs, timelines, source evaluation, and searches across genealogy websites." },
  { id:"i5", name:"AncestorIQ", role:"Multi-archive research & citations", url:"https://ancestoriq.com/", note:"Use as an independent research pass and compare its cited findings against the other investigators." },
  { id:"i6", name:"General AI Researcher", role:"Reasoning, source analysis & research planning", url:"https://chatgpt.com/", note:"Use a free AI chat service for an independent reasoning pass. It is a helper, not a source of genealogical proof." }
];

const STORAGE="gg-kinley-investigators";

function makePrompt(q:string,surname:string){
  return `You are one of six independent genealogy investigators. Research this question without inventing ancestors.

Question: ${q}
Surname context: ${surname||"None"}

Return:
1. Findings
2. Exact sources or URLs you actually used
3. What each source directly establishes
4. Contradictions or identity problems
5. What remains unknown
6. The next record(s) a human researcher should inspect

Do not treat agreement with another AI as proof. Prioritize original records and authoritative archives. Keep surname etymology as geographic starting context only; records must justify geographic expansion.`;
}

export default function KinleyDesk({close}:{close:()=>void}){
  const [question,setQuestion]=useState("");
  const [surname,setSurname]=useState("");
  const [reports,setReports]=useState<Record<string,string>>({});
  const [audit,setAudit]=useState<string|null>(null);
  const [active,setActive]=useState<string>("i1");

  useEffect(()=>{
    try{
      const saved=JSON.parse(localStorage.getItem(STORAGE)||"{}");
      if(saved.question)setQuestion(saved.question);
      if(saved.surname)setSurname(saved.surname);
      if(saved.reports)setReports(saved.reports);
      if(saved.audit)setAudit(saved.audit);
    }catch{}
  },[]);

  useEffect(()=>{
    localStorage.setItem(STORAGE,JSON.stringify({question,surname,reports,audit,updatedAt:new Date().toISOString()}));
  },[question,surname,reports,audit]);

  const completed=investigators.filter(x=>(reports[x.id]||"").trim()).length;

  const runAudit=()=>{
    const texts=investigators.map(x=>reports[x.id]?.trim()).filter(Boolean);
    if(texts.length<2){setAudit("Add at least two independent investigator reports before running the Final Audit.");return;}

    const all=texts.join("\n");
    const sentences=all.split(/[.!?]+/).map(x=>x.trim()).filter(x=>x.length>35);
    const normalized=new Map<string,number>();
    for(const s of sentences){
      const key=s.toLowerCase().replace(/[^a-z0-9\s]/g,"").replace(/\s+/g," ").trim();
      normalized.set(key,(normalized.get(key)||0)+1);
    }
    const repeated=[...normalized.entries()].filter(([,n])=>n>=2).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([s,n])=>`• Reported independently ${n} times: ${s}`);
    const sourceTerms=["original record","primary source","deed","probate","will","tax","church","military","pension","census","newspaper","archive","court","land"];
    const sourceHits=sourceTerms.filter(t=>all.toLowerCase().includes(t));
    const unknownTerms=["unknown","unverified","possible","cannot prove","not found","no evidence","uncertain","gap","contradiction"];
    const uncertainty=unknownTerms.filter(t=>all.toLowerCase().includes(t));
    const nextSteps=[
      "Open the cited original record or archive image yourself.",
      "Write down exactly what the record says before interpreting it.",
      "Resolve identity using time, place, age, spouse, children, occupation, and neighbors.",
      "Check the strongest record type for the relationship you are trying to prove.",
      "Keep unsupported generations blank rather than filling the gap from a copied tree."
    ];
    setAudit(`FINAL AUDIT — ${question||"Research question"}

Investigators contributing: ${texts.length}/6

WHAT MULTIPLE INVESTIGATORS REPORTED
${repeated.length?repeated.join("\n"):"No identical conclusions were detected. That is not a failure; independent wording can still describe the same evidence. Read the reports side by side."}

SOURCE / RECORD SIGNALS
${sourceHits.length?sourceHits.map(x=>"• "+x).join("\n"):"• No strong record-type terms were detected. Recheck whether the reports actually reached records."}

UNCERTAINTY SIGNALS
${uncertainty.length?uncertainty.map(x=>"• "+x).join("\n"):"• No uncertainty terms detected. Do not interpret that as proof."}

KINLEY'S EVIDENCE RULE
AI agreement is not evidence. The Final Audit does not promote a relationship merely because several investigators repeat it. A claim becomes stronger only when the underlying records independently support it.

NEXT HUMAN CHECKS
${nextSteps.map((x,i)=>`${i+1}. ${x}`).join("\n")}

HOW TO REPEAT THIS RESEARCH
1. Copy the original research question.
2. Give the same question and the same known facts to each investigator.
3. Save every source URL and record identifier.
4. Compare the six reports without choosing the most confident-sounding answer.
5. Inspect the strongest primary/original records yourself.
6. Record the conclusion, evidence label, contradictions, and next unresolved question in your research log.

STATUS: This is a research aid, not a proof generator.`);
  };

  const reset=()=>{setReports({});setAudit(null);localStorage.removeItem(STORAGE)};
  const prompt=useMemo(()=>makePrompt(question,surname),[question,surname]);

  return <div className="modalBack" onClick={close}>
    <div className="modal kinleyModal kinleyDesk" onClick={e=>e.stopPropagation()}>
      <button className="close" onClick={close}>×</button>
      <div className="kinleyBig"><Sparkles size={25}/></div>
      <p className="eyebrow">KINLEY • RESEARCH HELPER</p>
      <h2>Six independent research passes. One human-led audit.</h2>
      <p>Kinley does not solve your family tree for you. You collect independent research from six investigators, then Kinley organizes the evidence, exposes gaps, and teaches you how to repeat the process yourself.</p>

      <div className="kinleyRule"><strong>Helper, not solver.</strong><span>Six AIs agreeing does not prove an ancestor. The underlying record is what matters.</span></div>

      <div className="deskInputs">
        <label>Research question<input value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Example: Who was Samuel Michael Scroggins Sr.'s father?"/></label>
        <label>Surname / geographic starting point<input value={surname} onChange={e=>setSurname(e.target.value)} placeholder="Example: Scroggins"/></label>
      </div>

      <div className="promptBox"><div><strong>Investigator prompt</strong><span>Give this same prompt to every investigator for a fair comparison.</span></div><button onClick={()=>navigator.clipboard?.writeText(prompt)}><ClipboardCheck size={15}/> Copy prompt</button><pre>{prompt}</pre></div>

      <div className="investigatorTabs">
        {investigators.map(x=><button key={x.id} className={active===x.id?"active":""} onClick={()=>setActive(x.id)}><b>{x.id.replace("i","")}</b><span>{x.name}</span><small>{reports[x.id]?"Report saved":"No report yet"}</small></button>)}
      </div>

      {investigators.filter(x=>x.id===active).map(x=><div className="investigatorPanel" key={x.id}>
        <div className="investigatorHead"><div><p className="eyebrow">INVESTIGATOR {x.id.replace("i","")}</p><h3>{x.name}</h3><span>{x.role}</span></div><a href={x.url} target="_blank" rel="noreferrer"><Search size={15}/> Open <ExternalLink size={14}/></a></div>
        <p className="investigatorNote">{x.note}</p>
        <textarea value={reports[x.id]||""} onChange={e=>setReports({...reports,[x.id]:e.target.value})} placeholder="Paste this investigator's findings here. Keep its source URLs, record numbers, citations, contradictions, and uncertainty labels."></textarea>
        <small>Do not paste passwords, API keys, or private account credentials.</small>
      </div>)}

      <div className="auditToolbar"><span><FileCheck2 size={16}/> {completed}/6 investigator reports saved</span><button className="primary" onClick={runAudit}><ClipboardCheck size={17}/> Create Final Audit</button><button className="secondary light" onClick={reset}><RotateCcw size={16}/> Reset</button></div>

      {audit&&<div className="finalAudit"><div className="auditTitle"><GraduationCap size={22}/><div><p className="eyebrow">KINLEY FINAL AUDIT</p><h3>Now learn how to do the research yourself.</h3></div></div><pre>{audit}</pre></div>}

      <div className="kinleyActions"><button onClick={close}><BookOpen/> Keep researching</button></div>
      <small>Genealogy Guide itself does not call paid AI APIs in this workflow. The six investigators are external research tools; any limits or account requirements are controlled by those services.</small>
    </div>
  </div>
}
