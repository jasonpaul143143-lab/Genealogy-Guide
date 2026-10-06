"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Copy, FileText, Plus, Search, Send, Sparkles, X, Clock } from "lucide-react";

type ChatMessage = {
  role: "user" | "kinley";
  text: string;
};

const STORAGE = "gg-kinley-chat";

const starterPrompts = [
  "Help me find the parents of a specific ancestor.",
  "Build a research plan for a genealogy brick wall.",
  "Compare conflicting records for the same person.",
  "Help me determine which records I should search next."
];

export default function KinleyDesk({close}:{close:()=>void}){
  const [input,setInput] = useState("");
  const [messages,setMessages] = useState<ChatMessage[]>([]);
  const [researching,setResearching] = useState(false);
  const [elapsed,setElapsed] = useState(0);
  const [error,setError] = useState("");
  const startedAt = useRef<number | null>(null);

  useEffect(()=>{
    try{
      const saved = JSON.parse(localStorage.getItem(STORAGE) || "[]");
      if(Array.isArray(saved)) setMessages(saved);
    }catch{}
  },[]);

  useEffect(()=>{
    localStorage.setItem(STORAGE, JSON.stringify(messages));
  },[messages]);

  useEffect(()=>{
    if(!researching) return;
    const tick=()=>{
      if(startedAt.current !== null){
        setElapsed(Math.max(0,(Date.now()-startedAt.current)/1000));
      }
    };
    tick();
    const timer=window.setInterval(tick,100);
    return ()=>window.clearInterval(timer);
  },[researching]);

  const submit = async () => {
    const text = input.trim();
    if(!text || researching) return;

    const nextMessages=[...messages,{role:"user" as const,text}];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setResearching(true);
    startedAt.current=Date.now();
    setElapsed(0);
    setMessages(prev=>[...prev,{role:"kinley",text:""}]);

    try{
      const response=await fetch("/api/kinley",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({messages:nextMessages})
      });

      if(!response.ok || !response.body){
        const data=await response.json().catch(()=>null);
        throw new Error(data?.error || "Kinley could not connect to the research engine.");
      }

      const reader=response.body.getReader();
      const decoder=new TextDecoder();
      let answer="";

      while(true){
        const {value,done}=await reader.read();
        if(done) break;
        answer+=decoder.decode(value,{stream:true});
        setMessages(prev=>{
          const copy=[...prev];
          const last=copy.length-1;
          if(last>=0 && copy[last].role==="kinley") copy[last]={...copy[last],text:answer};
          return copy;
        });
      }

      answer+=decoder.decode();
      setMessages(prev=>{
        const copy=[...prev];
        const last=copy.length-1;
        if(last>=0 && copy[last].role==="kinley") copy[last]={...copy[last],text:answer.trim() || "I wasn't able to produce a response. Please try again."};
        return copy;
      });
    }catch(err){
      const message=err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      setMessages(prev=>prev.filter((m,i)=>!(i===prev.length-1 && m.role==="kinley" && !m.text)));
    }finally{
      setResearching(false);
      if(startedAt.current !== null){
        setElapsed((Date.now()-startedAt.current)/1000);
      }
      startedAt.current=null;
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError("");
    localStorage.removeItem(STORAGE);
  };

  const copyText=(text:string)=>navigator.clipboard?.writeText(text);

  return <div className="modalBack kinleyBack" onClick={close}>
    <div className="kinleyChat" onClick={e=>e.stopPropagation()}>
      <header className="kinleyChatHeader">
        <div className="kinleyIdentity">
          <div className="kinleyAvatar"><Sparkles size={19}/></div>
          <div>
            <strong>Kinley</strong>
            <span>Genealogy Research Assistant</span>
          </div>
        </div>
        <div className="kinleyHeaderActions">
          <button title="New conversation" onClick={clearChat}><Plus size={18}/></button>
          <button title="Close Kinley" onClick={close}><X size={19}/></button>
        </div>
      </header>

      <div className="kinleyChatBody">
        {messages.length === 0 ? (
          <div className="kinleyWelcome">
            <div className="kinleyWelcomeIcon"><Sparkles size={27}/></div>
            <h2>How can I help with your family tree?</h2>
            <p>
              Talk to me normally. Ask a quick question, work through a difficult
              ancestor, or investigate a genealogy brick wall. When the question
              needs research, I’ll switch into evidence-first mode.
            </p>

            <div className="kinleyStarterGrid">
              {starterPrompts.map(prompt =>
                <button key={prompt} onClick={()=>setInput(prompt)}>
                  <span>{prompt}</span>
                  <Search size={15}/>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="kinleyMessages">
            {messages.map((message,i)=>
              <div className={message.role==="user" ? "kinleyMessage user" : "kinleyMessage assistant"} key={i}>
                {message.role==="kinley" && <div className="messageAvatar"><Sparkles size={14}/></div>}
                <div className="messageBubble">
                  {message.role==="kinley" && <div className="messageMeta"><span className="messageLabel">Kinley</span>{i===messages.length-1 && elapsed>0 && <span className="workedFor"><Clock size={11}/> Worked for {elapsed.toFixed(1)} seconds</span>}</div>}
                  <p>{message.text || (researching && i===messages.length-1 ? "Researching…" : "")}</p>
                  {message.role==="kinley" && message.text && <button className="messageCopy" onClick={()=>copyText(message.text)}><Copy size={12}/> Copy</button>}
                </div>
              </div>
            )}
            {researching && messages[messages.length-1]?.role==="user" && <div className="kinleyMessage assistant">
              <div className="messageAvatar"><Sparkles size={14}/></div>
              <div className="messageBubble typing"><span/><span/><span/></div>
            </div>}
            {error && <div className="kinleyError">{error}</div>}
          </div>
        )}
      </div>

      <div className="kinleyComposerArea">
        <div className="kinleyComposer">
          <textarea
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter" && !e.shiftKey){e.preventDefault();submit()}}}
            placeholder="Ask Kinley anything about genealogy..."
            rows={1}
            disabled={researching}
          />
          <button className="kinleySend" onClick={submit} disabled={!input.trim() || researching} aria-label="Send message">
            <Send size={17}/>
          </button>
        </div>
        <div className="kinleyComposerFooter">
          <span><FileText size={13}/> Evidence first</span>
          <span><BookOpen size={13}/> Learn how to verify</span>
          <button onClick={()=>navigator.clipboard?.writeText(input)} disabled={!input.trim()}><Copy size={13}/> Copy question</button>
        </div>
        <small>Kinley is a helper, not a replacement for the underlying records. It will tell you when evidence is missing or conflicting.</small>
      </div>
    </div>
  </div>
}
