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

/** A decision reference found in source code */
export interface DecisionRef {
  specId: string | null;
  description: string;
  filePath: string;
  line: number;
}

/** The complete index of all spec-related annotations */
export interface SpecIndex {
  requirements: Requirement[];
  specs: Spec[];
  implRefs: ImplRef[];
  testRefs: TestRef[];
  decisionRefs: DecisionRef[];
}

/** Coverage info for a single spec */
export interface SpecCoverage {
  hasImplementation: boolean;
  hasTest: boolean;
  hasDecision: boolean;
}

/** A fully resolved link between a spec and its related artifacts */
export interface SpecLink {
  spec: Spec;
  requirement: Requirement | null;
  implementations: ImplRef[];
  tests: TestRef[];
  decisions: DecisionRef[];
  coverage: SpecCoverage;
}

/** Creates an empty SpecIndex */
export function emptySpecIndex(): SpecIndex {
  return {
    requirements: [],
    specs: [],
    implRefs: [],
    testRefs: [],
    decisionRefs: [],
  };
}
