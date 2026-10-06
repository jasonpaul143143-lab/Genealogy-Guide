"use client";

import { useEffect, useState } from "react";
import { BookOpen, Clipboard, Copy, FileText, Plus, Search, Send, Sparkles, X } from "lucide-react";

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

  useEffect(()=>{
    try{
      const saved = JSON.parse(localStorage.getItem(STORAGE) || "[]");
      if(Array.isArray(saved)) setMessages(saved);
    }catch{}
  },[]);

  useEffect(()=>{
    localStorage.setItem(STORAGE, JSON.stringify(messages));
  },[messages]);

  const submit = () => {
    const text = input.trim();
    if(!text || researching) return;
    setMessages(prev => [...prev, {role:"user", text}]);
    setInput("");
    setResearching(true);

    // The research orchestration layer will connect here. This UI intentionally
    // presents Kinley as the only visible assistant.
    setTimeout(()=>{
      setMessages(prev => [...prev, {
        role:"kinley",
        text:"I have your research question. Before drawing a conclusion, I’ll organize the problem, identify the strongest records to investigate, separate evidence from hypotheses, and show you how to verify the result yourself."
      }]);
      setResearching(false);
    }, 500);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE);
  };

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
              Ask me a genealogy question, describe a brick wall, or give me a
              relationship you want to investigate. I’ll help you work through
              the evidence instead of simply handing you an answer.
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
                  {message.role==="kinley" && <span className="messageLabel">Kinley</span>}
                  <p>{message.text}</p>
                </div>
              </div>
            )}
            {researching && <div className="kinleyMessage assistant">
              <div className="messageAvatar"><Sparkles size={14}/></div>
              <div className="messageBubble typing"><span/><span/><span/></div>
            </div>}
          </div>
        )}
      </div>

      <div className="kinleyComposerArea">
        <div className="kinleyComposer">
          <textarea
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter" && !e.shiftKey){e.preventDefault();submit()}}}
            placeholder="Ask Kinley about your family tree..."
            rows={1}
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
        <small>Kinley helps you research responsibly. A confident answer is never a substitute for checking the underlying records.</small>
      </div>
    </div>
  </div>
}
