"use client";

import { useMemo } from "react";
import { GitBranch, Heart, Users, Sparkles } from "lucide-react";

type Person={id:string;name:string;relation:string;status:string;birth:string;death:string;places:string;notes:string};
type Rel={id:string;from:string;to:string;type:string};
type Props={people:Person[];relationships:Rel[];selectedId:string;onSelect:(id:string)=>void};

function shortName(name:string){const n=(name||"Unnamed person").trim();return n.length>24?n.slice(0,23).trimEnd()+"…":n}

export default function FamilyTreeCanvas({people,relationships,selectedId,onSelect}:Props){
 const byId=useMemo(()=>new Map(people.map(p=>[p.id,p])),[people]);
 const parentMap=useMemo(()=>{const m=new Map<string,string[]>();for(const r of relationships){if(!r.type.toLowerCase().includes("parent"))continue;if(!m.has(r.to))m.set(r.to,[]);m.get(r.to)!.push(r.from)}return m},[relationships]);
 const children=useMemo(()=>relationships.filter(r=>r.type.toLowerCase().includes("parent")&&r.from===selectedId).map(r=>byId.get(r.to)).filter(Boolean) as Person[],[relationships,selectedId,byId]);
 const spouses=useMemo(()=>relationships.filter(r=>r.type.toLowerCase().includes("spouse")&&(r.from===selectedId||r.to===selectedId)).map(r=>byId.get(r.from===selectedId?r.to:r.from)).filter(Boolean) as Person[],[relationships,selectedId,byId]);
 const generations=useMemo(()=>{const levels:Person[][]=[];let current=[selectedId];const seen=new Set([selectedId]);for(let depth=0;depth<6;depth++){const next:string[]=[];for(const id of current){for(const pid of parentMap.get(id)||[]){if(!seen.has(pid)&&byId.has(pid)){seen.add(pid);next.push(pid)}}}if(!next.length)break;levels.push(next.map(id=>byId.get(id)!).filter(Boolean));current=next}return levels},[selectedId,parentMap,byId]);
 const ancestorCount=generations.reduce((n,g)=>n+g.length,0);
 const rootSpread=150+Math.min(430,ancestorCount*24),svgW=Math.max(760,rootSpread*2+180),svgH=620,cx=svgW/2;
 const selected=byId.get(selectedId)||people[0];
 const rootNodes=generations.flatMap((level,gi)=>level.map((p,i)=>({p,gi,i,x:cx+(level.length===1?0:(i-(level.length-1)/2)*(Math.min(150,rootSpread/(level.length+1)))),y:360+gi*72})));
 const rootPaths=rootNodes.map((n,idx)=>{const endX=n.x,startX=cx+((idx%Math.max(4,Math.min(24,ancestorCount+4)))-((Math.max(4,Math.min(24,ancestorCount+4))-1)/2)*3);const startY=350,midY=startY+30+n.gi*8;return <path key={"root-"+n.p.id} d={`M ${startX} ${startY} C ${startX-18} ${midY}, ${endX+(endX<cx?55:-55)} ${midY+10}, ${endX} ${n.y}`} className="genealogyRootPath"/>});
 const canopyPaths=Array.from({length:Math.max(5,Math.min(13,people.length+2))},(_,i)=>{const side=i%2===0?-1:1,level=Math.floor(i/2)+1,x2=cx+side*(45+level*42),y2=105-level*13;return <path key={i} d={`M ${cx} 225 C ${cx+side*18} 185, ${cx+side*48} 150, ${x2} ${y2}`} className="genealogyCanopyPath"/>});
 return <div className="familyTreeShell genealogyTreeShell">
  <div className="familyTreeHeader genealogyTreeHeader"><div><p className="eyebrow">FAMILY TREE</p><h3>Your ancestry, growing from the evidence</h3><span>The tree is 2D and evidence-driven. Every ancestor branch appears only when a parent relationship is recorded.</span></div><div className="familyTreeStats"><span><Users size={15}/>{people.length} people</span><span><GitBranch size={15}/>{relationships.length} links</span><span className="ancestorStat"><Sparkles size={14}/>{ancestorCount} ancestors found</span></div></div>
  <div className="genealogyTreeViewport">
   <div className="genealogyTreeTitle"><div><strong>{selected?.name||"Your family"}</strong><span>Ancestor roots expand as your documented family tree grows.</span></div>{ancestorCount===0&&<span className="genealogyTreeHint">Connect a parent to start growing the roots.</span>}</div>
   <div className="genealogyTreeGraphic"><svg viewBox={`0 0 ${svgW} ${svgH}`} role="img" aria-label="2D family tree showing documented ancestors">
    <g className="genealogyRoots">{rootPaths}</g><path className="genealogyMainTrunk" d={`M ${cx} 222 C ${cx-7} 270, ${cx+8} 305, ${cx} 350`}/><g className="genealogyCanopy">{canopyPaths}</g>
    <circle className="genealogyCanopyCore" cx={cx} cy="105" r="34"/><circle className="genealogyCanopyCore" cx={cx-62} cy="137" r="28"/><circle className="genealogyCanopyCore" cx={cx+62} cy="137" r="28"/><circle className="genealogyCanopyCore" cx={cx} cy="170" r="31"/><circle className="genealogyCanopyCore" cx={cx-105} cy="166" r="22"/><circle className="genealogyCanopyCore" cx={cx+105} cy="166" r="22"/>
    <g className="genealogyRootNodes">{rootNodes.map(n=><g key={n.p.id} className="genealogyPersonNode" onClick={()=>onSelect(n.p.id)}><circle cx={n.x} cy={n.y} r="25" className={n.p.id===selectedId?"nodeSelected":"nodeAncestor"}/><text x={n.x} y={n.y+4} textAnchor="middle" className="genealogyNodeInitial">{(n.p.name||"?").trim().charAt(0).toUpperCase()}</text><text x={n.x} y={n.y+40} textAnchor="middle" className="genealogyNodeLabel">{shortName(n.p.name)}</text></g>)}</g>
    <g className="genealogyFocusNode" onClick={()=>selected&&onSelect(selected.id)}><circle cx={cx} cy="225" r="34" className="focusNode"/><text x={cx} y="231" textAnchor="middle" className="genealogyNodeInitial">{(selected?.name||"?").trim().charAt(0).toUpperCase()}</text><text x={cx} y="274" textAnchor="middle" className="focusNodeLabel">{shortName(selected?.name||"Selected person")}</text></g>
   </svg></div>
   <div className="genealogyTreeMetrics"><div><strong>{ancestorCount}</strong><span>documented ancestors</span></div><div><strong>{generations.length}</strong><span>generations found</span></div><div><strong>{children.length}</strong><span>descendants connected</span></div><div><strong>{spouses.length}</strong><span>spouses connected</span></div></div>
   <div className="genealogyTreeLegend"><span><i className="treeLegendDot root"/> Ancestor branch</span><span><i className="treeLegendDot focus"/> Selected person</span><span><i className="treeLegendDot open"/> Open root = research gap</span></div>
  </div>
  <div className="genealogyTreePeople"><div className="generationLabel"><Users size={14}/> All people in this tree ({people.length})</div><div className="genealogyPeopleGrid">{people.map(p=><button key={p.id} className={`genealogyPersonChip ${p.id===selectedId?"selected":""}`} onClick={()=>onSelect(p.id)}><span>{(p.name||"?").trim().charAt(0).toUpperCase()}</span><strong>{shortName(p.name)}</strong><small>{p.birth||"Date unknown"}</small></button>)}</div></div>
  <div className="genealogyTreeFoot"><Heart size={14}/><span>Spouses and descendants stay connected to the selected person; the root system represents the documented ancestor line.</span></div>
 </div>
}