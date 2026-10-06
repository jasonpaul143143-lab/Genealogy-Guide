"use client";

import { useMemo, type CSSProperties } from "react";
import { ChevronDown, ChevronUp, GitBranch, Heart, Users } from "lucide-react";

type Person = {
  id: string;
  name: string;
  relation: string;
  status: string;
  birth: string;
  death: string;
  places: string;
  notes: string;
};

type Rel = {
  id: string;
  from: string;
  to: string;
  type: string;
};

type Props = {
  people: Person[];
  relationships: Rel[];
  selectedId: string;
  onSelect: (id: string) => void;
};

function shortName(name: string) {
  const clean = name.trim() || "Unnamed person";
  if (clean.length <= 28) return clean;
  return clean.slice(0, 27).trimEnd() + "…";
}

function PersonCard({
  person,
  selected,
  onSelect,
  compact = false,
}: {
  person?: Person;
  selected: boolean;
  onSelect: (id: string) => void;
  compact?: boolean;
}) {
  if (!person) {
    return (
      <div className={"familyTreeCard emptyTreeCard" + (compact ? " compact" : "")}>
        <span className="emptyTreeAvatar">?</span>
        <span className="emptyTreeText">Add person</span>
      </div>
    );
  }

  const hasDates = Boolean(person.birth || person.death);
  const hasPlace = Boolean(person.places);

  return (
    <button
      type="button"
      className={"familyTreeCard" + (selected ? " isSelected" : "") + (compact ? " compact" : "")}
      onClick={() => onSelect(person.id)}
      title={person.name}
      aria-pressed={selected}
    >
      <span className="familyTreeAvatar">
        <GitBranch size={compact ? 13 : 15} />
      </span>
      <span className="familyTreeCardBody">
        <strong>{shortName(person.name)}</strong>
        {hasDates && <span className="familyTreeDates">{person.birth || "?"} – {person.death || "?"}</span>}
        {!hasDates && <span className="familyTreeDates">{person.status}</span>}
        {hasPlace && <span className="familyTreePlace">{person.places.split(";")[0].trim()}</span>}
      </span>
      {selected && <span className="familyTreeSelectedDot" aria-hidden="true" />}
    </button>
  );
}

function RelationshipLine({ label }: { label: string }) {
  return <div className="familyTreeLine"><span>{label}</span></div>;
}

export default function FamilyTreeCanvas({ people, relationships, selectedId, onSelect }: Props) {
  const byId = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);

  const parentIds = useMemo(() => {
    const ids = relationships
      .filter((r) => r.type.toLowerCase().includes("parent") && r.to === selectedId)
      .map((r) => r.from);
    return Array.from(new Set(ids));
  }, [relationships, selectedId]);

  const childIds = useMemo(() => {
    const ids = relationships
      .filter((r) => r.type.toLowerCase().includes("parent") && r.from === selectedId)
      .map((r) => r.to);
    return Array.from(new Set(ids));
  }, [relationships, selectedId]);

  const spouseIds = useMemo(() => {
    const ids = relationships
      .filter((r) => r.type.toLowerCase().includes("spouse") && (r.from === selectedId || r.to === selectedId))
      .map((r) => r.from === selectedId ? r.to : r.from);
    return Array.from(new Set(ids));
  }, [relationships, selectedId]);

  const siblingIds = useMemo(() => {
    const siblingSet = new Set<string>();
    for (const parentId of parentIds) {
      relationships.forEach((r) => {
        if (r.type.toLowerCase().includes("parent") && r.from === parentId && r.to !== selectedId) {
          siblingSet.add(r.to);
        }
      });
    }
    return Array.from(siblingSet);
  }, [relationships, parentIds, selectedId]);

  const grandparentIds = useMemo(() => {
    const ids = relationships
      .filter((r) => r.type.toLowerCase().includes("parent") && parentIds.includes(r.to))
      .map((r) => r.from);
    return Array.from(new Set(ids));
  }, [relationships, parentIds]);

  const grandparents = grandparentIds.map((id) => byId.get(id)).filter(Boolean) as Person[];
  const parents = parentIds.map((id) => byId.get(id)).filter(Boolean) as Person[];
  const spouses = spouseIds.map((id) => byId.get(id)).filter(Boolean) as Person[];
  const siblings = siblingIds.map((id) => byId.get(id)).filter(Boolean) as Person[];
  const children = childIds.map((id) => byId.get(id)).filter(Boolean) as Person[];
  const selected = byId.get(selectedId) || people[0];

  const totalConnected = parents.length + grandparents.length + spouses.length + siblings.length + children.length;
  const scale = Math.min(1.16, 1 + Math.max(0, people.length - 1) * 0.012);

  return (
    <div className="familyTreeShell">
      <div className="familyTreeHeader">
        <div>
          <p className="eyebrow">FAMILY TREE VIEW</p>
          <h3>Pedigree & family connections</h3>
          <span>Click any person to center the tree on them. Add relationships to make the branches connect.</span>
        </div>
        <div className="familyTreeStats">
          <span><Users size={15} /> {people.length} people</span>
          <span><GitBranch size={15} /> {relationships.length} links</span>
        </div>
      </div>

      <div className="familyTreeCanvas" style={{ "--tree-scale": scale } as CSSProperties}>
        <div className="familyTreeGeneration grandparentGeneration">
          <div className="generationLabel"><ChevronUp size={14} /> Grandparents</div>
          <div className="familyTreeCards">{grandparents.length ? grandparents.map((p) => <PersonCard key={p.id} person={p} selected={p.id === selectedId} onSelect={onSelect} compact />) : <div className="treeEmptyHint">Add parent links to reveal earlier generations</div>}</div>
        </div>

        <RelationshipLine label={grandparents.length ? "Parent of" : "Earlier generation"} />

        <div className="familyTreeGeneration parentGeneration">
          <div className="generationLabel"><ChevronUp size={14} /> Parents</div>
          <div className="familyTreeCards">{parents.length ? parents.map((p) => <PersonCard key={p.id} person={p} selected={p.id === selectedId} onSelect={onSelect} />) : <div className="treeEmptyHint">Your parents will appear here</div>}</div>
        </div>

        <div className="familyTreeTrunk">
          <span className="treeTrunkGlow" />
          <span className="treeTrunkCore" />
        </div>

        <div className="familyTreeGeneration focusGeneration">
          <div className="generationLabel">Selected person</div>
          <div className="familyTreeFocusRow">
            <PersonCard person={selected} selected={true} onSelect={onSelect} />
            {spouses.length > 0 && <div className="spouseCluster"><Heart size={15} /><span className="relationshipConnector" />{spouses.map((p) => <PersonCard key={p.id} person={p} selected={p.id === selectedId} onSelect={onSelect} compact />)}</div>}
          </div>
        </div>

        <RelationshipLine label={children.length ? "Parent of" : "Descendants"} />

        <div className="familyTreeGeneration childGeneration">
          <div className="generationLabel"><ChevronDown size={14} /> Children</div>
          <div className="familyTreeCards">{children.length ? children.map((p) => <PersonCard key={p.id} person={p} selected={p.id === selectedId} onSelect={onSelect} />) : <div className="treeEmptyHint">Children appear here when you connect them</div>}</div>
        </div>

        {siblings.length > 0 && (
          <div className="familyTreeSiblings">
            <div className="generationLabel"><Users size={14} /> Siblings</div>
            <div className="familyTreeCards">{siblings.map((p) => <PersonCard key={p.id} person={p} selected={p.id === selectedId} onSelect={onSelect} compact />)}</div>
          </div>
        )}

        <div className="familyTreeGrowth">
          <div className="growthCanopy" style={{ transform: `scale(${Math.max(0.72, Math.min(1.18, scale))})` }}>
            <span /><span /><span /><span /><span />
          </div>
          <div className="growthTrunk" />
          <div className="growthRoots"><i /><i /></div>
          <strong>{people.length === 1 ? "Start your tree" : people.length < 5 ? "Your tree is growing" : "Your family tree is taking shape"}</strong>
          <small>{totalConnected} connected relationships • {people.length} people</small>
        </div>
      </div>

      <div className="familyTreeLegend">
        <span><i className="legendDot selected" /> Selected person</span>
        <span><i className="legendDot connected" /> Connected family</span>
        <span><i className="legendDot empty" /> Open branch</span>
        <span>Tip: relationship links control where people appear.</span>
      </div>
    </div>
  );
}
