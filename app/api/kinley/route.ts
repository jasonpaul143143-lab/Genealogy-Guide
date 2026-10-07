import { NextRequest } from "next/server";
import { normalizePlan, PLAN_CONFIG, canUse, type PlanId } from "../../lib/plans";

export const runtime = "edge";

const KINLEY_INSTRUCTIONS = `
You are Kinley, the genealogy research assistant inside Genealogy Guide.

Be concise, natural, and evidence-first. Never invent ancestors, relationships, dates, places, records, citations, archive results, or historical facts.

For genealogy:
- Separate documented facts, supported conclusions, hypotheses, possibilities, and unresolved questions.
- Prefer original records and authoritative repositories.
- Resolve identity using name, age, spouse, children, residence, occupation, associates, geography, and chronology.
- Treat spelling variants as search strategies, never as proof.
- When evidence conflicts, explain the conflict.
- If evidence is insufficient, say so and identify the strongest next records.
- Treat user-provided tree data as unverified context unless independently supported.
- Never claim to have accessed a private account, subscription record, image, or source unless the tool actually provided it.
- A blank generation is better than a fabricated connection.
- Keep answers focused and reproduceable.

For difficult research use:
1. Exact question
2. Established facts
3. Missing fact
4. Best records
5. Identity/evidence conflicts
6. Confidence conclusion
7. Next actions
`;

export async function POST(request: NextRequest){
  const key=process.env.OPENAI_API_KEY;
  if(!key){
    return new Response(JSON.stringify({error:"Kinley needs an OPENAI_API_KEY in Vercel before live AI responses can run."}),{status:503,headers:{"Content-Type":"application/json"}});
  }

  try{
    const body=await request.json();
    const raw=Array.isArray(body?.messages) ? body.messages : [];
    const plan:PlanId=normalizePlan(body?.plan);
    const planConfig=PLAN_CONFIG[plan];

    // Keep each request intentionally small so Kinley feels fast without
    // repeatedly sending the entire conversation/tree back to the model.
    const messages=raw
      .filter((m:any)=>m && (m.role==="user" || m.role==="kinley") && typeof m.text==="string")
      .slice(-6)
      .map((m:any)=>({
        role:m.role==="kinley" ? "assistant" : "user",
        content:String(m.text).slice(-1200)
      }));

    if(!messages.length){
      return new Response(JSON.stringify({error:"Please enter a message."}),{status:400,headers:{"Content-Type":"application/json"}});
    }

    const tree=body?.tree;
    const lastUser=messages.filter((m:any)=>m.role==="user").at(-1)?.content?.toLowerCase() || "";
    const people=Array.isArray(tree?.people) ? tree.people : [];
    const relationships=Array.isArray(tree?.relationships) ? tree.relationships : [];
    const sources=Array.isArray(tree?.sources) ? tree.sources : [];

    // Only send a compact, relevant tree packet. This is much cheaper than
    // replaying the entire tree on every question.
    const tokens=lastUser.split(/[^a-z0-9]+/).filter((x:string)=>x.length>=3);
    const score=(item:any)=>{
      const s=JSON.stringify(item).toLowerCase();
      return tokens.reduce((n:string|number,t:string)=>Number(n)+(s.includes(t)?1:0),0);
    };
    const compactPeople=[...people].sort((a:any,b:any)=>score(b)-score(a)).slice(0,8);
    const personIds=new Set(compactPeople.map((p:any)=>p?.id).filter(Boolean));
    const compactRelationships=relationships.filter((r:any)=>personIds.has(r?.from)||personIds.has(r?.to)).slice(0,12);
    const compactSources=sources.slice(0,6);

    const treePacket=(compactPeople.length||compactRelationships.length||compactSources.length)
      ? JSON.stringify({people:compactPeople,relationships:compactRelationships,sources:compactSources})
      : "";

    const treeContext=treePacket
      ? "\nLOCAL FAMILY TREE CONTEXT (user-provided; not independently verified):\n"+treePacket
      : "";

    const researchEnabled=canUse(plan,"webResearch") || canUse(plan,"deepResearch");
    const model=process.env.OPENAI_MODEL || planConfig.model;
    const maxOutput=plan==="free" ? 320 : plan==="researcher" ? 500 : 650;
    const effort=plan==="free" ? "low" : "low";

    const instructions=KINLEY_INSTRUCTIONS + treeContext + `
ACTIVE PLAN: ${planConfig.name}
KINLEY MODEL: ${planConfig.kinleyName}
MODE: ${planConfig.mode}
REASONING: ${effort}
CAPABILITIES: ${planConfig.capabilities.join(", ")}

Research depth may change by plan, but evidence standards never change.
${researchEnabled
  ? "Use web research when the question needs current or specific historical verification. Prefer authoritative repositories and original records."
  : "Do not use web research tools for this plan. Give efficient guidance from the supplied context and established knowledge."}
`;

    const responseBody:any={
      model,
      reasoning:{effort},
      instructions,
      input:messages,
      max_output_tokens:maxOutput,
      store:false
    };

    if(researchEnabled) responseBody.tools=[{type:"web_search"}];

    const upstream=await fetch("https://api.openai.com/v1/responses",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Authorization":`Bearer ${key}`
      },
      body:JSON.stringify(responseBody)
    });

    const payload=await upstream.json().catch(()=>null);

    if(!upstream.ok){
      const detail=String(payload?.error?.message || payload?.detail || "");
      const isRateLimit=upstream.status===429 || /rate limit|tokens per min|TPM|too many requests/i.test(detail);
      if(isRateLimit){
        return new Response(JSON.stringify({
          error:"Kinley is temporarily at its research capacity.",
          detail:"The AI service is rate-limited right now. Your family-tree data was not lost. Please wait before trying the same request again.",
          code:"KINLEY_RATE_LIMIT"
        }),{status:429,headers:{"Content-Type":"application/json","Retry-After":"3600","Cache-Control":"no-store"}});
      }
      return new Response(JSON.stringify({
        error:"Kinley could not complete that research request.",
        detail:detail.slice(0,500)
      }),{status:upstream.status>=400&&upstream.status<500?upstream.status:502,headers:{"Content-Type":"application/json"}});
    }

    const answer=typeof payload?.output_text==="string"
      ? payload.output_text.trim()
      : Array.isArray(payload?.output)
        ? payload.output.flatMap((item:any)=>Array.isArray(item?.content)?item.content:[])
            .filter((part:any)=>part?.type==="output_text" && typeof part?.text==="string")
            .map((part:any)=>part.text)
            .join("")
            .trim()
        : "";

    if(!answer){
      return new Response(JSON.stringify({error:"Kinley completed the request but returned no readable text."}),{status:502,headers:{"Content-Type":"application/json"}});
    }

    return new Response(JSON.stringify({answer}),{
      headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}
    });
  }catch{
    return new Response(JSON.stringify({error:"Kinley could not process that request. Please try again."}),{status:500,headers:{"Content-Type":"application/json"}});
  }
}
