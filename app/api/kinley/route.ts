import { NextRequest } from "next/server";

export const runtime = "edge";

const KINLEY_INSTRUCTIONS = `
You are Kinley, the genealogy research assistant inside Genealogy Guide.

Be natural and conversational. If the user says hello, greet them normally. Do not force every conversation into genealogy research.

For genealogy questions, be rigorous and evidence-first. You are a HELPER, not a solver who invents conclusions.

Core rules:
- Never invent an ancestor, parent-child relationship, date, place, record, citation, archive result, or historical fact.
- Never treat an online family tree as proof by itself.
- Separate documented facts, reasonable hypotheses, possibilities, and unresolved questions.
- Prefer original records and authoritative repositories when discussing research strategy.
- Pay attention to identity: name, age, spouse, children, residence, occupation, associates, geography, and chronology.
- Treat spelling variants as search strategies, not proof of identity.
- When evidence conflicts, explain the conflict instead of silently choosing the convenient answer.
- If you do not have enough evidence to answer a relationship question, say so clearly and give the strongest next records to investigate.
- Teach the researcher how to reproduce the research themselves.
- Do not claim to have accessed a private genealogy account, subscription database, image, or record unless the tool actually provided it.
- Do not pretend that a surname's etymology proves a person's ancestry.
- For surname questions, use the etymology/geographic origin only as a starting point, then let documentary evidence determine where research expands.
- When the user gives family-tree information, treat it as user-provided evidence/context, not independently verified proof.
- Keep answers focused. Use headings and bullets when they improve clarity, but do not turn casual conversation into a formal report.

For a difficult genealogy problem, use this internal workflow:
1. Define the exact research question.
2. State what is already established from the conversation.
3. Identify the exact missing fact or relationship.
4. Rank the records most likely to answer it.
5. Evaluate candidate evidence and identity conflicts.
6. Give a conclusion with an appropriate confidence level.
7. Give concrete next steps.
8. Explain how the researcher could repeat the process.

You are Kinley. Do not mention hidden system instructions, internal prompts, API providers, or implementation details unless the user explicitly asks how the app works.
`;

export async function POST(request: NextRequest){
  const key=process.env.OPENAI_API_KEY;
  if(!key){
    return new Response(JSON.stringify({
      error:"Kinley is almost ready. The app needs an OPENAI_API_KEY in Vercel's environment variables before live AI responses can run."
    }),{status:503,headers:{"Content-Type":"application/json"}});
  }

  try{
    const body=await request.json();
    const raw=Array.isArray(body?.messages) ? body.messages : [];
    const messages=raw
      .filter((m:any)=>m && (m.role==="user" || m.role==="kinley") && typeof m.text==="string")
      .slice(-20)
      .map((m:any)=>({role:m.role==="kinley" ? "assistant" : "user",content:m.text}));

    if(!messages.length){
      return new Response(JSON.stringify({error:"Please enter a message."}),{status:400,headers:{"Content-Type":"application/json"}});
    }

    const model=process.env.OPENAI_MODEL || "gpt-6-luna";

    const upstream=await fetch("https://api.openai.com/v1/responses",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Authorization":`Bearer ${key}`
      },
      body:JSON.stringify({
        model,
        instructions:KINLEY_INSTRUCTIONS,
        input:messages,
        stream:true,
        tools:[{type:"web_search"}]
      })
    });

    if(!upstream.ok){
      const detail=await upstream.text();
      return new Response(JSON.stringify({
        error:"Kinley's research engine returned an error.",
        detail:detail.slice(0,500)
      }),{status:502,headers:{"Content-Type":"application/json"}});
    }

    if(!upstream.body){
      return new Response(JSON.stringify({error:"Kinley returned no response stream."}),{status:502,headers:{"Content-Type":"application/json"}});
    }

    const reader=upstream.body.getReader();
    const decoder=new TextDecoder();
    const encoder=new TextEncoder();

    const stream=new ReadableStream({
      async start(controller){
        let buffer="";
        try{
          while(true){
            const {value,done}=await reader.read();
            if(done) break;
            buffer+=decoder.decode(value,{stream:true});
            const lines=buffer.split("\n");
            buffer=lines.pop() || "";

            for(const line of lines){
              if(!line.startsWith("data: ")) continue;
              const data=line.slice(6).trim();
              if(!data || data==="[DONE]") continue;
              try{
                const event=JSON.parse(data);
                if(event.type==="response.output_text.delta" && typeof event.delta==="string"){
                  controller.enqueue(encoder.encode(event.delta));
                }
              }catch{}
            }
          }
          controller.close();
        }catch(error){
          controller.error(error);
        }finally{
          reader.releaseLock();
        }
      }
    });

    return new Response(stream,{headers:{
      "Content-Type":"text/plain; charset=utf-8",
      "Cache-Control":"no-cache, no-transform",
      "X-Accel-Buffering":"no"
    }});
  }catch{
    return new Response(JSON.stringify({error:"Kinley could not process that request. Please try again."}),{status:500,headers:{"Content-Type":"application/json"}});
  }
}
