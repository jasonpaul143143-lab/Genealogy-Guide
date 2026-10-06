"use client";

import {
  BookOpen, Search, GitBranch, Dna, Sparkles, ShieldCheck, Home as HomeIcon, Wrench,
  FileText, Landmark, ScrollText, Newspaper, Users, Map, ClipboardList,
  CheckCircle2, ArrowRight, ChevronRight, Plus, X, Menu, GraduationCap,
  Microscope, HelpCircle
} from "lucide-react";
import { useState } from "react";

type Section = "Home"|"Learn"|"Research"|"Tree"|"Tools"|"DNA"|"Kinley";

const lessons = [
  {n:"01",title:"Genealogy Foundations",desc:"What genealogy is, how family trees work, and how to separate family tradition from documented evidence."},
  {n:"02",title:"Start With What You Know",desc:"Build a reliable starting point from yourself, parents, grandparents, certificates, photographs, and family interviews."},
  {n:"03",title:"Census Records",desc:"Learn household structure, ages, occupations, relationships, migration clues, and common census pitfalls."},
  {n:"04",title:"Birth, Marriage & Death Records",desc:"Use vital records to establish identities and relationships, while understanding indexes versus original records."},
  {n:"05",title:"Church & Cemetery Records",desc:"Use baptisms, burials, church minutes, cemetery records, and memorial evidence appropriately."},
  {n:"06",title:"Land, Deeds & Probate",desc:"Follow property transfers, wills, estates, guardianships, and witnesses to reconstruct families."},
  {n:"07",title:"Military Records",desc:"Trace service, pensions, draft registrations, units, residences, and identity evidence."},
  {n:"08",title:"Newspapers & Local History",desc:"Extract obituaries, marriage notices, community news, and local context without treating every mention as proof."},
  {n:"09",title:"Evidence & Source Quality",desc:"Distinguish original, derivative, authored, primary, secondary, and tertiary sources."},
  {n:"10",title:"Resolving Conflicts",desc:"Compare dates, places, relationships, and records systematically when sources disagree."},
  {n:"11",title:"DNA & Genetic Genealogy",desc:"Understand autosomal DNA, Y-DNA, mtDNA, matches, triangulation, and limitations."},
  {n:"12",title:"Brick-Wall Research",desc:"Turn an unknown parent or missing generation into a focused research question and record plan."},
];

const researchTools = [
  ["Record Guide","Learn what each record type can prove and where to look.",FileText],
  ["Census Research","Understand every U.S. federal census and its genealogical value.",Users],
  ["Probate & Deeds","Follow estates, land, heirs, witnesses, and neighbors.",ScrollText],
  ["Military Research","Research service records, pensions, units, and veterans.",ShieldCheck],
  ["Newspaper Research","Use historical newspapers to identify people and relationships.",Newspaper],
  ["Local History","Use county histories, church records, maps, and archives.",Landmark],
];

function Logo(){return <div className="logo" aria-label="Genealogy Guide logo"><span/><span/><span/><i/></div>}

export default function HomePage(){
  const [section,setSection]=useState<Section>("Home");
  const [lesson,setLesson]=useState<number|null>(null);
  const [showKinley,setShowKinley]=useState(false);
  const [people,setPeople]=useState<string[]>(["You"]);
  const [person,setPerson]=useState("");
  
  const go=(s:Section)=>{setSection(s);setLesson(null);window.scrollTo({top:0,behavior:"smooth"})};

  return <main>
    <header>
      <button className="brand brandButton" onClick={()=>go("Home")}><Logo/><div><h1>Genealogy Guide</h1><p>Learn. Research. Prove.</p></div></button>
      <button className="kinley" onClick={()=>setShowKinley(true)}><Sparkles size={17}/> Kinley</button>
    </header>

    {section==="Home" && <HomeSection go={go} setShowKinley={setShowKinley}/>}
    {section==="Learn" && <Learn lessons={lessons} lesson={lesson} setLesson={setLesson}/>}
    {section==="Research" && <Research go={go}/>}
    {section==="Tree" && <Tree people={people} person={person} setPerson={setPerson} add={()=>{if(person.trim()){setPeople([...people,person.trim()]);setPerson("")}}}/>}
    {section==="Tools" && <Tools/>}
    {section==="DNA" && <DNA/>}
    
    {showKinley && <Kinley close={()=>setShowKinley(false)} go={go}/>}
    
    <nav>
      {[
        ["Home",HomeIcon, "Home"],["Learn",BookOpen,"Learn"],["Research",Search,"Research"],
        ["Tree",GitBranch,"Tree"],["Tools",Wrench,"Tools"]
      ].map(([name,Icon,key])=><button className={section===key?"active":""} onClick={()=>go(key as Section)} key={key as string}><Icon size={19}/><span>{name as string}</span></button>)}
    </nav>
  </main>
}

function HomeSection({go,setShowKinley}:{go:(s:Section)=>void,setShowKinley:(v:boolean)=>void}){
 return <><section className="hero"><div><p className="eyebrow">THE GENEALOGY GUIDE</p><h2>Build a family tree you can actually prove.</h2><p>Go beyond names and dates. Learn how to find records, evaluate evidence, solve difficult relationships, use DNA responsibly, and document every discovery.</p><div className="heroActions"><button className="primary" onClick={()=>go("Learn")}>Start Learning <ArrowRight size={17}/></button><button className="secondary" onClick={()=>go("Research")}>Research Tools</button></div></div><div className="principle"><ShieldCheck size={27}/><strong>The Kinley Principle</strong><span>Never invent an ancestor to fill a gap. A blank generation is better than a false one.</span><small>Evidence first • Sources matter • Conflicts get investigated</small></div></section>
 <section className="stats"><div><b>12</b><span>Core lessons</span></div><div><b>6</b><span>Research guides</span></div><div><b>5</b><span>Evidence levels</span></div><div><b>1</b><span>Rule: prove it</span></div></section>
 <section className="section"><div className="sectionTitle"><div><p className="eyebrow">EXPLORE</p><h3>Everything you need to research smarter</h3><p>Start anywhere. Genealogy Guide is designed to grow with you from your first family interview to advanced documentary research.</p></div></div>
 <div className="grid">{[
  ["Learn Genealogy","A structured path from absolute beginner to confident researcher.",BookOpen,"Learn"],
  ["Research Records","Know what census, vital, probate, land, military, church, and newspaper records can tell you.",Search,"Research"],
  ["Build Your Tree","Keep people and relationships organized while leaving unsupported gaps open.",GitBranch,"Tree"],
  ["DNA & Genetics","Understand autosomal DNA, Y-DNA, mtDNA, matches, and genetic genealogy.",Dna,"DNA"]
 ].map(([t,d,I,k])=><article key={t as string} onClick={()=>go(k as Section)}><div className="cardIcon"><I size={22}/></div><h4>{t as string}</h4><p>{d as string}</p><button onClick={(e)=>{e.stopPropagation();go(k as Section)}}>Explore <ArrowRight size={15}/></button></article>)}</div></section>
 <section className="feature"><div><p className="eyebrow">YOUR RESEARCH WORKFLOW</p><h3>Question → Record → Evidence → Conclusion</h3><p>Good genealogy is not about collecting the most names. It is about building defensible relationships from the records.</p></div><div className="workflow"><span><b>1</b>Ask a specific question</span><span><b>2</b>Find the best available record</span><span><b>3</b>Evaluate the source</span><span><b>4</b>Write the conclusion</span></div></section>
 <section className="lessons"><div className="sectionTitle compact"><p className="eyebrow">LEARNING PATH</p><h3>Start here</h3></div>{lessons.slice(0,4).map(l=><button className="lesson" key={l.n} onClick={()=>go("Learn")}><b>{l.n}</b><div><strong>{l.title}</strong><span>{l.desc}</span></div><ChevronRight/></button>)}</section>
 </>;
}

function Learn({lessons,lesson,setLesson}:{lessons:any[],lesson:number|null,setLesson:(n:number|null)=>void}){
 return <section className="page"><p className="eyebrow">LEARN GENEALOGY</p><h2>From first search to serious researcher.</h2><p className="lead">Work through the lessons in order or jump directly to the skill you need.</p><div className="progress"><span style={{width:"8%"}}/><b>1 of 12 lessons started</b></div><div className="lessonList">{lessons.map((l,i)=><button className="lesson" key={l.n} onClick={()=>setLesson(lesson===i?null:i)}><b>{l.n}</b><div><strong>{l.title}</strong><span>{l.desc}</span>{lesson===i&&<em>Lesson overview: begin by collecting the evidence you already have, then identify the exact question the records need to answer. Avoid attaching people solely because names, dates, or locations look similar.</em>}</div><ChevronRight/></button>)}</div></section>
}

function Research({go}:{go:(s:Section)=>void}){
 return <section className="page"><p className="eyebrow">RESEARCH CENTER</p><h2>Choose the record type that answers your question.</h2><p className="lead">Don't search randomly. Start with the relationship or fact you need to establish, then choose the strongest record likely to contain it.</p><div className="researchBanner"><ClipboardList/><div><strong>Research checklist</strong><span>Question → Person → Place → Date → Record → Source → Evidence → Conclusion</span></div></div><div className="toolGrid">{researchTools.map(([t,d,I])=><article key={t as string}><div className="cardIcon"><I size={22}/></div><h3>{t as string}</h3><p>{d as string}</p><button onClick={()=>go("Tools")}>Open Guide <ArrowRight size={15}/></button></article>)}</div></section>
}

function Tree({people,person,setPerson,add}:{people:string[],person:string,setPerson:(s:string)=>void,add:()=>void}){
 return <section className="page"><p className="eyebrow">MY FAMILY TREE</p><h2>Your research workspace.</h2><p className="lead">This starter workspace lets you organize the people you're researching. Future versions can add relationships, sources, citations, photos, and cloud sync.</p><div className="treePanel"><div className="treeTop"><div className="treeNode mainNode"><span>You</span></div></div><div className="branches">{people.slice(1).map((p,i)=><div className="treeNode" key={i}><GitBranch size={15}/><span>{p}</span><small>Person added</small></div>)}</div><div className="addPerson"><input value={person} onChange={e=>setPerson(e.target.value)} placeholder="Enter a person to research"/><button onClick={add}><Plus size={18}/> Add Person</button></div></div><div className="notice"><ShieldCheck/><span><strong>Evidence reminder:</strong> adding a person to your workspace does not prove a relationship. Attach sources before treating a connection as established.</span></div></section>
}

function Tools(){
 const tools=[["Evidence Checker","Rate a claim using Supported, Probable, Possible, Unverified, or Disproved."],["Research Log","Record searches, repositories checked, dates, findings, and next steps."],["Name Variants","Track spelling changes, aliases, initials, translations, and indexing errors."],["Timeline Builder","Put events in chronological order to expose impossible dates and identity conflicts."],["Relationship Analyzer","Test whether two records could refer to the same person before connecting them."],["Brick Wall Planner","Turn an unknown parent or missing generation into a targeted research plan."]];
 return <section className="page"><p className="eyebrow">RESEARCH TOOLS</p><h2>Tools built around evidence.</h2><p className="lead">These tools are designed to prevent one of the biggest genealogy mistakes: turning a plausible story into a documented fact.</p><div className="toolGrid">{tools.map(([t,d])=><article key={t}><div className="cardIcon"><Wrench size={22}/></div><h3>{t}</h3><p>{d}</p><button>Open Tool <ArrowRight size={15}/></button></article>)}</div><div className="evidence"><h3>Evidence labels</h3><div>{["Supported","Probable","Possible","Unverified","Disproved"].map(x=><span key={x}>{x}</span>)}</div></div></section>
}

function DNA(){return <section className="page"><p className="eyebrow">GENETIC GENEALOGY</p><h2>Use DNA as evidence—not a shortcut.</h2><p className="lead">DNA can support or challenge documentary research, but a DNA match does not automatically identify an exact ancestor.</p><div className="dnaCards">{[["Autosomal DNA","Best for recent generations and cousin matching across many branches."],["Y-DNA","Follows the direct paternal line and can be especially useful for surname-line research."],["mtDNA","Follows the direct maternal line and can investigate deep maternal ancestry."],["Triangulation","Compare shared matches and segments to strengthen a genetic relationship hypothesis."]].map(([t,d])=><article key={t}><Dna/><h3>{t}</h3><p>{d}</p></article>)}</div><div className="notice"><Microscope/><span><strong>Kinley rule:</strong> DNA results should be interpreted alongside documented relationships, geography, chronology, and source evidence.</span></div></section>
}

function Kinley({close,go}:{close:()=>void,go:(s:Section)=>void}){
 return <div className="modalBack" onClick={close}><div className="modal" onClick={e=>e.stopPropagation()}><button className="close" onClick={close}><X/></button><div className="kinleyBig"><Sparkles size={25}/></div><p className="eyebrow">KINLEY • AI RESEARCH ASSISTANT</p><h2>Research with an evidence-first mindset.</h2><p>Kinley is designed to help you ask better questions, evaluate sources, build research plans, analyze contradictions, and avoid inventing ancestors to close a gap.</p><div className="kinleyActions"><button onClick={()=>{close();go("Research")}}><Search/> Build a research plan</button><button onClick={()=>{close();go("Tools")}}><ShieldCheck/> Check evidence</button><button onClick={()=>{close();go("Learn")}}><BookOpen/> Learn research methods</button></div><small>AI assistance can organize and analyze evidence, but original records remain the authority.</small></div></div>
}