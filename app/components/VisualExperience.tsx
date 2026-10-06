"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, FileSearch, GitBranch, Sparkles } from "lucide-react";

export default function VisualExperience({ onResearch, onTree, onKinley }: { onResearch:()=>void; onTree:()=>void; onKinley:()=>void }) {
  const [active, setActive] = useState(0);
  const discoveries = [
    { icon: FileSearch, title: "Find the strongest record", text: "Turn an unknown into a focused search instead of guessing.", action: "Open Research", run: onResearch },
    { icon: GitBranch, title: "Grow the documented tree", text: "Branches expand only when relationships are actually recorded.", action: "Open Tree", run: onTree },
    { icon: Sparkles, title: "Ask Kinley", text: "Audit a hypothesis, compare candidates, or plan the next search.", action: "Meet Kinley", run: onKinley }
  ];

  useEffect(() => {
    const timer = window.setInterval(() => setActive(v => (v + 1) % discoveries.length), 4200);
    return () => window.clearInterval(timer);
  }, []);

  const item = discoveries[active];
  const Icon = item.icon;

  return (
    <section className="visualExperience" aria-label="Genealogy Guide highlights">
      <div className="experienceGlow" />
      <div className="experienceHeader">
        <div>
          <p className="eyebrow">RESEARCH, IN MOTION</p>
          <h3>Every discovery leaves a trail.</h3>
          <p>Genealogy Guide turns research progress into something you can see, follow, and prove.</p>
        </div>
        <div className="liveBadge"><span /> Research engine ready</div>
      </div>

      <div className="experienceStage">
        <div className="orbitScene" aria-hidden="true">
          <div className="orbit orbitOne" />
          <div className="orbit orbitTwo" />
          <div className="orbitCore"><GitBranch size={28}/></div>
          <span className="orbitDot dotA" /><span className="orbitDot dotB" /><span className="orbitDot dotC" />
        </div>

        <div className="discoveryCard" key={active}>
          <div className="discoveryIcon"><Icon size={21}/></div>
          <div className="discoveryCopy">
            <span className="discoveryKicker">NEXT MOVE {String(active + 1).padStart(2, "0")}</span>
            <h4>{item.title}</h4>
            <p>{item.text}</p>
            <button onClick={item.run}>{item.action} <ArrowRight size={15}/></button>
          </div>
          <div className="discoveryCheck"><CheckCircle2 size={17}/></div>
        </div>
      </div>

      <div className="experienceDots" aria-label="Highlights">
        {discoveries.map((d, i) => <button key={d.title} className={i === active ? "active" : ""} onClick={() => setActive(i)} aria-label={d.title} />)}
      </div>
    </section>
  );
}
