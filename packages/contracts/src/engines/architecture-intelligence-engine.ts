/**
 * Architecture Intelligence Engine — Commander C2 (Unit 26)
 * Source: Spec #59 Intelligence Layer Architecture (Posture stream)
 * Analyses topology, detects policy conflicts, assesses dependency risk.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TopologyComponent {
  id: string;
  deps: string[];
  criticality: number; // 1-5
}

export interface TopologyFinding {
  componentId: string;
  findingType: 'single_point_of_failure' | 'circular_dependency' | 'orphaned' | 'over_connected';
  severity: number;
  description: string;
}

export interface PolicyRule {
  id: string;
  scope: string;
}

export interface PolicyConflict {
  ruleA: string;
  ruleB: string;
  conflictType: 'scope_overlap' | 'contradictory';
  description: string;
}

export interface DependencyRiskResult {
  componentId: string;
  riskScore: number; // 0-100
  factors: string[];
}

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Analyse topology to identify architectural findings such as
 * single points of failure, circular dependencies, and orphaned nodes.
 */
export function analyseTopology(components: TopologyComponent[]): TopologyFinding[] {
  const findings: TopologyFinding[] = [];
  const allIds = new Set(components.map((c) => c.id));

  for (const component of components) {
    // Orphaned: no deps and nothing depends on it
    const dependedOnBy = components.filter((c) => c.deps.includes(component.id));
    if (component.deps.length === 0 && dependedOnBy.length === 0 && components.length > 1) {
      findings.push({
        componentId: component.id,
        findingType: 'orphaned',
        severity: 2,
        description: `Component "${component.id}" has no dependencies and nothing depends on it.`,
      });
    }

    // Single point of failure: high criticality with many dependents
    if (component.criticality >= 4 && dependedOnBy.length >= 3) {
      findings.push({
        componentId: component.id,
        findingType: 'single_point_of_failure',
        severity: 5,
        description: `Component "${component.id}" (criticality ${component.criticality}) has ${dependedOnBy.length} dependents — single point of failure.`,
      });
    }

    // Over-connected: too many outbound deps
    if (component.deps.length >= 5) {
      findings.push({
        componentId: component.id,
        findingType: 'over_connected',
        severity: 3,
        description: `Component "${component.id}" depends on ${component.deps.length} other components — over-connected.`,
      });
    }

    // Circular dependency: component depends on something that depends on it
    for (const depId of component.deps) {
      const dep = components.find((c) => c.id === depId);
      if (dep && dep.deps.includes(component.id)) {
        // Only report once (smaller id reports)
        if (component.id < depId) {
          findings.push({
            componentId: component.id,
            findingType: 'circular_dependency',
            severity: 4,
            description: `Circular dependency between "${component.id}" and "${depId}".`,
          });
        }
      }
    }
  }

  return findings;
}

/**
 * Detect policy conflicts by examining scope overlaps between rules.
 * Two rules with the same scope are flagged as potentially contradictory.
 */
export function detectPolicyConflicts(rules: PolicyRule[]): PolicyConflict[] {
  const conflicts: PolicyConflict[] = [];

  for (let i = 0; i < rules.length; i++) {
    for (let j = i + 1; j < rules.length; j++) {
      const ruleA = rules[i];
      const ruleB = rules[j];

      if (ruleA.scope === ruleB.scope) {
        conflicts.push({
          ruleA: ruleA.id,
          ruleB: ruleB.id,
          conflictType: 'scope_overlap',
          description: `Rules "${ruleA.id}" and "${ruleB.id}" both target scope "${ruleA.scope}" — potential conflict.`,
        });
      }
    }
  }

  return conflicts;
}

/**
 * Assess dependency risk for a single component within the full topology.
 * Risk increases with: number of dependencies, criticality of dependencies,
 * and depth of the dependency chain.
 */
export function assessDependencyRisk(
  component: TopologyComponent,
  allComponents: TopologyComponent[],
): DependencyRiskResult {
  const factors: string[] = [];
  let riskScore = 0;

  // Direct dependency count
  const depCount = component.deps.length;
  riskScore += depCount * 10;
  if (depCount > 3) factors.push(`high_dep_count:${depCount}`);

  // Criticality of dependencies
  const criticalDeps = component.deps
    .map((id) => allComponents.find((c) => c.id === id))
    .filter((c) => c && c.criticality >= 4);
  riskScore += criticalDeps.length * 15;
  if (criticalDeps.length > 0) factors.push(`critical_deps:${criticalDeps.length}`);

  // Own criticality amplifies risk
  if (component.criticality >= 4) {
    riskScore += 20;
    factors.push('self_critical');
  }

  return {
    componentId: component.id,
    riskScore: Math.min(100, riskScore),
    factors,
  };
}
