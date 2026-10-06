import { NextResponse } from "next/server";

type Provider = "openai" | "xai";

const SYSTEM = `You are Kinley, an evidence-first genealogy research investigator. Never invent ancestors or treat a surname, matching name, unsourced tree, or geographic coincidence as proof. Separate documented facts, reasonable hypotheses, and unknowns. For research questions, search broadly but expand geography only when records justify it. Start with the surname's documented historical origin and nearby regions when surname context is supplied. Prioritize original records, archives, government records, church records, probate, deeds, tax, military and newspapers. Treat commercial genealogy trees as leads, not proof. Give a concise research conclusion, evidence found, contradictions, confidence label (Supported, Probable, Possible, Unverified, or Disproved), and specific next records to seek. Cite URLs when the provider returns sources.`;

function extractText(data:any){
  if(typeof data?.output_text==="string") return data.output_text;
  const parts=data?.output?.flatMap((item:any)=>item?.content||[])||[];
  return parts.filter((p:any)=>typeof p?.text==="string").map((p:any)=>p.text).join("\n");
}

export async function POST(req:Request){
 try{
  const body=await req.json();
  const provider=(body.provider||process.env.KINLEY_PROVIDER||"openai") as Provider;
  const question=String(body.question||"").trim();
  if(!question)return NextResponse.json({error:"Enter a research question."},{status:400});
  const surname=String(body.surname||"").trim();
  const focus=body.focus?JSON.stringify(body.focus):"No surname focus supplied.";
  const history=Array.isArray(body.history)?body.history.slice(-4):[];
  const prompt=`${SYSTEM}

Surname intelligence:
${surname||"None"}
${focus}

Previous Kinley conversation:
${history.map((h:any)=>"Q: "+h.q+"\nA: "+h.a).join("\n\n")||"None"}

Current research question:
${question}`;

  if(provider==="xai"){
    if(!process.env.XAI_API_KEY)return NextResponse.json({error:"xAI is not connected yet. Add XAI_API_KEY to the Vercel project environment variables."},{status:503});
    const r=await fetch("https://api.x.ai/v1/responses",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${process.env.XAI_API_KEY}`},body:JSON.stringify({model:process.env.XAI_MODEL||"grok-4.7",input:prompt,tools:[{type:"web_search"}]})});
    const data=await r.json(); if(!r.ok)return NextResponse.json({error:data?.error?.message||"xAI request failed."},{status:502});
    return NextResponse.json({answer:extractText(data),provider:"xai"});
  }

  if(!process.env.OPENAI_API_KEY)return NextResponse.json({error:"OpenAI is not connected yet. Add OPENAI_API_KEY to the Vercel project environment variables."},{status:503});
  const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${process.env.OPENAI_API_KEY}`},body:JSON.stringify({model:process.env.OPENAI_MODEL||"gpt-5.6-luna",tools:[{type:"web_search"}],input:prompt})});
  const data=await r.json(); if(!r.ok)return NextResponse.json({error:data?.error?.message||"OpenAI request failed."},{status:502});
  return NextResponse.json({answer:extractText(data),provider:"openai"});
 }catch(error){return NextResponse.json({error:"Kinley could not complete the research request."},{status:500})}
}
