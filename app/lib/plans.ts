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

export const PLAN_CONFIG: Record<PlanId, {
  name: string;
  price: string;
  mode: KinleyMode;
  model: string;
  reasoning: "low" | "medium" | "high";
  capabilities: Capability[];
  description: string;
}> = {
  free: {
    name: "Free",
    price: "$0",
    mode: "quick",
    model: "gpt-6-luna",
    reasoning: "low",
    capabilities: ["basicKinley", "advancedTree"],
    description: "Build your tree and use Kinley for quick genealogy help."
  },
  researcher: {
    name: "Researcher",
    price: "$4.99/mo",
    mode: "deep",
    model: "gpt-6-luna",
    reasoning: "medium",
    capabilities: ["basicKinley", "webResearch", "deepResearch", "evidenceVault", "advancedTree"],
    description: "Deeper research and evidence organization."
  },
  genealogist: {
    name: "Genealogist",
    price: "$9.99/mo",
    mode: "expert",
    model: "gpt-6.1-sol",
    reasoning: "high",
    capabilities: ["basicKinley", "webResearch", "deepResearch", "evidenceVault", "contradictionHunter", "identityResolution", "advancedTree"],
    description: "Expert-level genealogy investigation."
  },
  family: {
    name: "Family",
    price: "$14.99/mo",
    mode: "expert",
    model: "gpt-6.1-sol",
    reasoning: "high",
    capabilities: ["basicKinley", "webResearch", "deepResearch", "evidenceVault", "contradictionHunter", "identityResolution", "advancedTree", "sharedResearch"],
    description: "Expert research plus family collaboration."
  }
};

export function normalizePlan(value: unknown): PlanId {
  return value === "researcher" || value === "genealogist" || value === "family" ? value : "free";
}

export function canUse(plan: PlanId, capability: Capability): boolean {
  return PLAN_CONFIG[plan].capabilities.includes(capability);
}
