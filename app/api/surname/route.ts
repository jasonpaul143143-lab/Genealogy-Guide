import { NextResponse } from "next/server";

export async function POST(req:Request){
 try{
  const {surname,provider="openai"}=await req.json();
  const name=String(surname||"").trim();
  if(!name)return NextResponse.json({error:"Enter a surname."},{status:400});
  const prompt=`Research the surname "${name}" as a genealogy starting-point only. Use authoritative surname/etymology references when available, prioritizing Oxford Reference/Oxford family-name resources and reputable academic or archival sources. Do not claim this is the user's ancestry. Return JSON with exactly these fields: origin, primaryRegion, localFocus, variants, strategy. Focus on where the surname is documented to have originated and nearby geographic areas. If a local place is not supported by sources, use an empty string. Do not invent a place. The strategy must say that records, not etymology alone, determine migration and ancestry.`;
  const key=provider==="xai"?process.env.XAI_API_KEY:process.env.OPENAI_API_KEY;
  if(!key)return NextResponse.json({error:`${provider==="xai"?"xAI":"OpenAI"} is not connected yet.`},{status:503});
  const url=provider==="xai"?"https://api.x.ai/v1/responses":"https://api.openai.com/v1/responses";
  const model=provider==="xai"?(process.env.XAI_MODEL||"grok-4.7"):(process.env.OPENAI_MODEL||"gpt-5.6-luna");
  const tools=[{type:"web_search"}];
  const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json","Authorization:`Bearer ${key}`},body:JSON.stringify({model,tools,input:prompt})});
  const data=await r.json();if(!r.ok)return NextResponse.json({error:"Surname research request failed."},{status:502});
  const text=typeof data.output_text==="string"?data.output_text:(data.output||[]).flatMap((x:any)=>x.content||[]).map((x:any)=>x.text||"").join("");
  const cleaned=text.replace(/^\s*\`\`\`json\s*/,"").replace(/\s*\`\`\`\s*$/,"");
  try{return NextResponse.json(JSON.parse(cleaned))}catch{return NextResponse.json({origin:"See research result",primaryRegion:"",localFocus:"",variants:"",strategy:text})}
 }catch{return NextResponse.json({error:"Surname intelligence could not run."},{status:500})}
}
