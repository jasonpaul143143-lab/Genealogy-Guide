"use client";

import { Check, X, Sparkles, CreditCard, ShieldCheck, Search, Users, Brain, Database } from "lucide-react";
import { useEffect, useState } from "react";
import { KINLEY_FLAGSHIP, PLAN_CONFIG, normalizePlan, type PlanId } from "../lib/plans";

const planOrder: PlanId[] = ["free", "researcher", "genealogist", "family"];\nconst PROTOTYPE_MODE = true;

const planDetails: Record<PlanId, {
  features: string[];
  highlight?: string;
  icon: typeof Search;
}> = {
  free: {
    icon: Search,
    features: ["Family tree builder", "Basic Kinley assistance", "Genealogy learning tools", "Evidence labels & tree organization"]
  },
  researcher: {
    icon: Database,
    highlight: "Best for active research",
    features: ["Everything in Free", "Web research tools", "Deeper Kinley reasoning", "Evidence Vault workspace"]
  },
  genealogist: {
    icon: Brain,
    highlight: "Most powerful investigator",
    features: ["Everything in Researcher", "Identity resolution", "Contradiction Hunter", "Deep evidence analysis"]
  },
  family: {
    icon: Users,
    highlight: "Built for families",
    features: ["Everything in Genealogist", "Shared research workspace", "Family collaboration", "Advanced organization"]
  }
};

export default function Plans({close}:{close:()=>void}){
 const [loading,setLoading]=useState("");
 const [message,setMessage]=useState("");
 const [activePlan,setActivePlan]=useState<PlanId>("free");

 useEffect(()=>{
   try{setActivePlan(normalizePlan(localStorage.getItem("gg-plan")));}catch{}
 },[]);

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

 const choosePlan=(id:PlanId)=>{
   if(id==="free"){
     try{localStorage.setItem("gg-plan","free");}catch{}
     setActivePlan("free");
     return;
   }
   checkout(id);
 };

 return <div className="modalBack plansBack" onClick={close}>
  <div className="plansModal premiumPlansModal" onClick={e=>e.stopPropagation()}>
   <div className="plansAurora" aria-hidden="true"></div>
   <div className="plansHead premiumPlansHead">
    <div>
      <div className="plansKicker"><span className="plansSpark">✦</span> GENEALOGY GUIDE · KINLEY</div>
      <h2>Choose how deeply you want to research.</h2>
      <p>{PROTOTYPE_MODE ? "Prototype mode is enabled: every Kinley tier is available for testing while billing is not connected. The evidence standard stays the same at every level." : "Your subscription changes Kinley’s research depth, tools, and workspace. The evidence standard stays the same at every level."}</p>
    </div>
    <button className="close" onClick={close} aria-label="Close plans"><X/></button>
   </div>

   <div className="activePlanBanner">
    <div className="activePlanIcon"><Sparkles size={18}/></div>
    <div>
      <span>ACTIVE PLAN</span>
      <strong>{PLAN_CONFIG[activePlan].kinleyName}</strong>
      <small>{PLAN_CONFIG[activePlan].name} · {PLAN_CONFIG[activePlan].tierLabel}</small>
    </div>
    <div className="activePlanStatus"><ShieldCheck size={15}/> {activePlan==="free" ? "Current" : "Active"}</div>
   </div>

   <div className="plansGrid premiumPlansGrid">
    {planOrder.map((id,i)=>{
      const p=PLAN_CONFIG[id];
      const d=planDetails[id];
      const Icon=d.icon;
      const isActive=activePlan===id;
      return <article className={"planCard premiumPlanCard "+p.accent+" "+(isActive?"isActive ":"")+(id==="genealogist"?"isFeatured":"")} key={id}>
        {d.highlight && <div className="planPopular"><Sparkles size={13}/>{d.highlight}</div>}
        <div className="planCardTop">
          <div className="planIcon"><Icon size={18}/></div>
          <div><span className="planTier">{p.tierLabel}</span><h3>{p.kinleyName}</h3></div>
        </div>
        <p className="planSubtitle">{p.description}</p>
        <div className="planPrice"><strong>{p.price.replace("/mo","")}</strong><span>{p.price==="$0"?"forever":"/ month"}</span></div>
        <div className="planRule"></div>
        <ul>{d.features.map(f=><li key={f}><Check size={15}/><span>{f}</span></li>)}</ul>
        <div className="planCapability"><span>Kinley mode</span><b>{p.mode}</b><span>Reasoning</span><b>{p.reasoning}</b></div>
        <button className={"primary full planChoose "+(isActive?"activePlanButton":"")} disabled={loading===id || isActive} onClick={()=>choosePlan(id)}>
          {isActive ? <><ShieldCheck size={15}/> Current plan</> : PROTOTYPE_MODE ? <><Sparkles size={15}/> Enable for prototype</> : loading===id ? "Opening checkout..." : <><CreditCard size={15}/> Choose {p.kinleyName}</>}
        </button>
      </article>
    })}
   </div>

   <div className="zenithTeaser">
     <div className="zenithMark">✦</div>
     <div><span>COMING LATER · FLAGSHIP</span><strong>{KINLEY_FLAGSHIP.name}</strong><p>{KINLEY_FLAGSHIP.description}</p></div>
     <div className="zenithArrow">↗</div>
   </div>

   <div className="plansTrust">
     <span><ShieldCheck size={14}/> Evidence-first by design</span>
     <span><Search size={14}/> Research depth scales with your plan</span>
     <span>Billing stays separate from tree data</span>
   </div>

   {message&&<div className="checkoutNotice">{message}<small>{PROTOTYPE_MODE ? "Prototype access only — no payment provider is connected." : "Live payments require a properly configured Stripe account and secure server environment variables."}</small></div>}
   <small className="plansFine">{PROTOTYPE_MODE ? "PROTOTYPE MODE · All tiers are unlocked for testing. No charges are made and no payment is required." : "Prices shown are proposed Genealogy Guide pricing. A payment provider must be connected before real charges can occur."}</small>
  </div>
 </div>
}
