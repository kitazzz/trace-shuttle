/** A high-level requirement extracted from a markdown doc comment */
export interface Requirement {
  id: string;
  category: string;
  filePath: string;
  line: number;
  rawText: string;
}

/** A detailed specification tied to a requirement */
export interface Spec {
  id: string;
  requirementId: string;
  filePath: string;
  line: number;
  rawText: string;
}

/** An implementation reference found in source code */
export interface ImplRef {
  specId: string;
  filePath: string;
  line: number;
  nodeDescription: string;
}

/** A test reference found in test code */
export interface TestRef {
  specId: string;
  filePath: string;
  line: number;
  testName: string;
}

/** Coverage info for a single spec */
export interface SpecCoverage {
  hasImplementation: boolean;
  hasTest: boolean;
}

/** A fully resolved link between a spec and its related artifacts */
export interface SpecLink {
  spec: Spec;
  requirement: Requirement | null;
  implementations: ImplRef[];
  tests: TestRef[];
  coverage: SpecCoverage;
}

/** A single @trace[...] annotation node */
export interface TraceNode {
  kind: "requirement" | "spec" | "impl" | "test" | "needs-review";
  attrs: Record<string, string>;
  filePath: string;
  line: number;
}

/** Map-based indexed spec index for O(1) lookups */
export interface IndexedSpecIndex {
  requirements: Map<string, Requirement>;
  specs: Map<string, Spec>;
  specsByRequirement: Map<string, Spec[]>;
  implsBySpec: Map<string, ImplRef[]>;
  testsBySpec: Map<string, TestRef[]>;
  refsByFile: Map<string, TraceNode[]>;
  allNodes: TraceNode[];
}

/** Creates an empty IndexedSpecIndex */
export function emptyIndexedSpecIndex(): IndexedSpecIndex {
  return {
    requirements: new Map(),
    specs: new Map(),
    specsByRequirement: new Map(),
    implsBySpec: new Map(),
    testsBySpec: new Map(),
    refsByFile: new Map(),
    allNodes: [],
  };
}
