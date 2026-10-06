"use client";

import { useEffect, useMemo, useState } from "react";
import { Camera, CheckCircle2, ExternalLink, FileText, ImagePlus, Info, ShieldCheck, Sparkles, Upload, X } from "lucide-react";

type PhotoStatus="verified"|"review"|"document"|"none"|"ai";
type Photo={id:string;person:string;status:PhotoStatus;title:string;source:string;url:string;notes:string;data?:string};

const labels:Record<PhotoStatus,string>={verified:"Verified photograph","review":"Historical image — review","document":"Document / record","none":"No verified photograph",ai:"AI reconstruction — labeled"};
const colors:Record<PhotoStatus,string>={verified:"photoVerified",review:"photoReview",document:"photoDocument",none:"photoNone",ai:"photoAi"};

export default function AncestorGallery(){
 const [photos,setPhotos]=useState<Photo[]>([]);
 const [person,setPerson]=useState(""); const [status,setStatus]=useState<PhotoStatus>("verified");
 const [title,setTitle]=useState(""); const [source,setSource]=useState(""); const [url,setUrl]=useState(""); const [notes,setNotes]=useState("");
 const [open,setOpen]=useState(false);
 useEffect(()=>{try{const x=localStorage.getItem("gg-photo-gallery");if(x)setPhotos(JSON.parse(x))}catch{}},[]);
 useEffect(()=>{try{localStorage.setItem("gg-photo-gallery",JSON.stringify(photos))}catch{}},[photos]);

 const counts=useMemo(()=>({verified:photos.filter(p=>p.status==="verified").length,review:photos.filter(p=>p.status==="review").length,docs:photos.filter(p=>p.status==="document").length,none:photos.filter(p=>p.status==="none").length,ai:photos.filter(p=>p.status==="ai").length}),[photos]);

 const add=async(e:React.ChangeEvent<HTMLInputElement>)=>{
   const file=e.target.files?.[0]; if(!file)return;
   const reader=new FileReader(); reader.onload=()=>{setPhotos(p=>[{id:crypto.randomUUID(),person:person.trim()||"Unassigned ancestor",status,title:title.trim()||file.name,source:source.trim()||"User upload",url:url.trim(),notes:notes.trim(),data:String(reader.result)},...p]);setPerson("");setTitle("");setSource("");setUrl("");setNotes("");setOpen(false)}; reader.readAsDataURL(file);
 };
 const addRemote=()=>{if(!person.trim()||!url.trim())return;setPhotos(p=>[{id:crypto.randomUUID(),person:person.trim(),status,title:title.trim()||"Historical image",source:source.trim()||"External collection",url,notes:notes.trim()},...p]);setPerson("");setTitle("");setSource("");setUrl("");setNotes("");setOpen(false)};
 return <section className="ancestorGallery">
   <div className="galleryHeader"><div><p className="eyebrow">ANCESTOR GALLERY</p><h3>Real people. Real evidence.</h3><p>Keep verified photographs separate from historical images, documents, and AI reconstructions.</p></div><button className="primary" onClick={()=>setOpen(true)}><ImagePlus size={16}/> Add image</button></div>
   <div className="photoStats"><span><b>{counts.verified}</b> verified</span><span><b>{counts.review}</b> review</span><span><b>{counts.docs}</b> documents</span><span><b>{counts.ai}</b> AI labeled</span></div>
   <div className="photoPrinciple"><ShieldCheck size={18}/><div><strong>Photo Evidence Rule</strong><span>Genealogy Guide never presents an AI-generated face as a historical photograph. If no verified portrait exists, it says so.</span></div></div>
   {photos.length===0?<div className="photoEmpty"><Camera size={28}/><strong>No ancestor images yet</strong><span>Add a family photograph, a sourced historical image, or a document. Every image keeps its evidence status.</span></div>:
   <div className="photoGrid">{photos.map(p=><article className="photoCard" key={p.id}>
     <div className="photoFrame">{p.data?<img src={p.data} alt={p.title}/>:<div className="remotePlaceholder"><ExternalLink size={22}/><span>External image</span></div>}<span className={"photoStatus "+colors[p.status]}>{labels[p.status]}</span></div>
     <div className="photoBody"><span className="photoPerson">{p.person}</span><h4>{p.title}</h4><p>{p.notes||"No additional notes."}</p>{p.source&&<small>Source: {p.source}</small>}{p.url&&<a href={p.url} target="_blank" rel="noreferrer">View source <ExternalLink size={13}/></a>}
     <button className="photoDelete" onClick={()=>setPhotos(v=>v.filter(x=>x.id!==p.id))}><X size={13}/> Remove</button></div>
   </article>)}</div>}
   {open&&<div className="toolModal" role="dialog" aria-modal="true"><div className="toolModalHead"><div><p className="eyebrow">PHOTO EVIDENCE</p><h3>Add ancestor image</h3></div><button onClick={()=>setOpen(false)}><X/></button></div>
    <label>Ancestor<input value={person} onChange={e=>setPerson(e.target.value)} placeholder="e.g. John Scoggins"/></label>
    <label>Evidence status<select value={status} onChange={e=>setStatus(e.target.value as PhotoStatus)}>{Object.entries(labels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
    <label>Title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Portrait, census page, newspaper clipping…"/></label>
    <label>Source / collection<input value={source} onChange={e=>setSource(e.target.value)} placeholder="Archive, family collection, newspaper…"/></label>
    <label>Source URL (optional)<input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://…"/></label>
    <label>Notes<textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Why does this image belong to this person?"/></label>
    <div className="toolActions"><label className="uploadButton"><Upload size={15}/> Upload image<input type="file" accept="image/*" onChange={add}/></label><button className="secondary" onClick={addRemote}>Add source image</button></div>
    <div className="toolTip"><Info size={15}/> For AI reconstructions, always select the AI-labeled status. Never use them as evidence of what the ancestor actually looked like.</div>
   </div>}
 </section>
}
