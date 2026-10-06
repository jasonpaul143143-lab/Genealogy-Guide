export type PlanId = "free" | "researcher" | "genealogist" | "family";

export type KinleyMode = "quick" | "deep" | "expert";

export type Capability =
  | "basicKinley"
  | "webResearch"
  | "deepResearch"
  | "evidenceVault"
  | "contradictionHunter"
  | "identityResolution"
  | "advancedTree"
  | "sharedResearch";

export type PlanConfig = {
  name: string;
  kinleyName: string;
  tierLabel: string;
  price: string;
  mode: KinleyMode;
  model: string;
  reasoning: "low" | "medium" | "high";
  capabilities: Capability[];
  description: string;
  accent: "sage" | "gold" | "violet" | "midnight";
};

export const PLAN_CONFIG: Record<PlanId, PlanConfig> = {
  free: {
    name: "Free",
    kinleyName: "Kinley Nova",
    tierLabel: "Essential",
    price: "$0",
    mode: "quick",
    model: "gpt-6-luna",
    reasoning: "low",
    capabilities: ["basicKinley", "advancedTree"],
    description: "A fast starting point for building your family tree and learning genealogy.",
    accent: "sage"
  },
  researcher: {
    name: "Researcher",
    kinleyName: "Kinley Vela",
    tierLabel: "Research",
    price: "$4.99/mo",
    mode: "deep",
    model: "gpt-6-luna",
    reasoning: "medium",
    capabilities: ["basicKinley", "webResearch", "deepResearch", "evidenceVault", "advancedTree"],
    description: "Broader research, evidence organization, and deeper Kinley reasoning.",
    accent: "gold"
  },
  genealogist: {
    name: "Genealogist",
    kinleyName: "Kinley Vesper",
    tierLabel: "Investigation",
    price: "$9.99/mo",
    mode: "expert",
    model: "gpt-6.1-sol",
    reasoning: "high",
    capabilities: ["basicKinley", "webResearch", "deepResearch", "evidenceVault", "contradictionHunter", "identityResolution", "advancedTree"],
    description: "Serious genealogical investigation with identity resolution and contradiction analysis.",
    accent: "violet"
  },
  family: {
    name: "Family",
    kinleyName: "Kinley Astra",
    tierLabel: "Collaboration",
    price: "$14.99/mo",
    mode: "expert",
    model: "gpt-6.1-sol",
    reasoning: "high",
    capabilities: ["basicKinley", "webResearch", "deepResearch", "evidenceVault", "contradictionHunter", "identityResolution", "advancedTree", "sharedResearch"],
    description: "Advanced research plus a shared workspace for families researching together.",
    accent: "midnight"
  }
};

export const KINLEY_FLAGSHIP = {
  name: "Kinley Zenith",
  label: "Future flagship",
  description: "Maximum-depth genealogy intelligence, reserved for a future flagship tier."
};

export function normalizePlan(value: unknown): PlanId {
  return value === "researcher" || value === "genealogist" || value === "family" ? value : "free";
}

export function canUse(plan: PlanId, capability: Capability): boolean {
  return PLAN_CONFIG[plan].capabilities.includes(capability);
}
