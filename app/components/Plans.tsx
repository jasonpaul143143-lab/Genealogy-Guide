"use client";

import { Check, X, Sparkles, CreditCard } from "lucide-react";
import { useState } from "react";

const plans = [
  {id:"researcher",name:"Researcher",price:"$4.99",period:"/month",desc:"For people ready to go beyond basic family-tree building.",features:["Expanded research tools","More Kinley assistance","Larger research workspace","Research logs and evidence tracking"]},
  {id:"genealogist",name:"Genealogist",price:"$9.99",period:"/month",desc:"For serious genealogy research and difficult family questions.",features:["Everything in Researcher","Advanced research workflows","Priority Kinley assistance","Deeper evidence analysis"]},
  {id:"family",name:"Family",price:"$14.99",period:"/month",desc:"For families researching together.",features:["Everything in Genealogist","Shared family research space","Multiple family members","Family research organization"]},
];

export default function Plans({close}:{close:()=>void}){
 const [loading,setLoading]=useState("");
 const [message,setMessage]=useState("");
 const checkout=async(id:string)=>{
   setLoading(id);setMessage("");
   try{
    const r=await fetch("/api/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({plan:id})});
    const data=await r.json();
    if(data.url) window.location.href=data.url;
    else setMessage(data.error||"Checkout is not configured yet.");
   }catch{setMessage("Could not start checkout. Please try again.");}
   finally{setLoading("");}
 };
 return <div className="modalBack plansBack" onClick={close}><div className="plansModal" onClick={e=>e.stopPropagation()}>
  <div className="plansHead"><div><p className="eyebrow">GENEALOGY GUIDE PLUS</p><h2>Choose your research level.</h2><p>Keep the core genealogy experience free. Paid plans unlock advanced research features.</p></div><button className="close" onClick={close}><X/></button></div>
  <div className="freePlan"><div><strong>Free</strong><span>Build your tree, learn genealogy, use evidence labels, and start researching.</span></div><b>$0</b></div>
  <div className="plansGrid">{plans.map((p,i)=><article className={i===1?"planCard featured":"planCard"} key={p.id}>{i===1&&<div className="planPopular"><Sparkles size={13}/> MOST POPULAR</div>}<h3>{p.name}</h3><p>{p.desc}</p><div className="planPrice"><strong>{p.price}</strong><span>{p.period}</span></div><ul>{p.features.map(f=><li key={f}><Check size={15}/>{f}</li>)}</ul><button className="primary full" disabled={loading===p.id} onClick={()=>checkout(p.id)}><CreditCard size={15}/>{loading===p.id?"Opening checkout...":"Choose "+p.name}</button></article>)}</div>
  {message&&<div className="checkoutNotice">{message}<small>Live payments require a properly configured Stripe account and secure server environment variables.</small></div>}
  <small className="plansFine">Prices are proposed Genealogy Guide pricing, not a charge. Checkout will remain disabled until the app owner connects a payment provider.</small>
 </div></div>
}
