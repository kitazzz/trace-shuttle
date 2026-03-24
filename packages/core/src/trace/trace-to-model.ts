import type {
  TraceNode,
  Requirement,
  Spec,
  ImplRef,
  TestRef,
} from "../model/types.js";

export function traceNodeToRequirement(node: TraceNode): Requirement | null {
  if (node.kind !== "requirement") return null;
  const id = node.attrs["id"];
  const category = node.attrs["category"];
  if (!id || !category) return null;
  return {
    id,
    category,
    filePath: node.filePath,
    line: node.line,
    rawText: node.attrs["text"] ?? "",
  };
}

export function traceNodeToSpec(node: TraceNode): Spec | null {
  if (node.kind !== "spec") return null;
  const id = node.attrs["id"];
  const req = node.attrs["req"];
  if (!id || !req) return null;
  return {
    id,
    requirementId: req,
    filePath: node.filePath,
    line: node.line,
    rawText: node.attrs["text"] ?? "",
  };
}

export function traceNodeToImplRef(node: TraceNode): ImplRef | null {
  if (node.kind !== "impl") return null;
  const specId = node.attrs["spec"];
  if (!specId) return null;
  return {
    specId,
    filePath: node.filePath,
    line: node.line,
    nodeDescription: "",
  };
}

export function traceNodeToTestRef(node: TraceNode): TestRef | null {
  if (node.kind !== "test") return null;
  const specId = node.attrs["spec"];
  if (!specId) return null;
  return {
    specId,
    filePath: node.filePath,
    line: node.line,
    testName: "",
  };
}

export function partitionTraceNodes(nodes: TraceNode[]): {
  requirements: Requirement[];
  specs: Spec[];
  implRefs: ImplRef[];
  testRefs: TestRef[];
} {
  const requirements: Requirement[] = [];
  const specs: Spec[] = [];
  const implRefs: ImplRef[] = [];
  const testRefs: TestRef[] = [];

  for (const node of nodes) {
    switch (node.kind) {
      case "requirement": {
        const r = traceNodeToRequirement(node);
        if (r) requirements.push(r);
        break;
      }
      case "spec": {
        const s = traceNodeToSpec(node);
        if (s) specs.push(s);
        break;
      }
      case "impl": {
        const i = traceNodeToImplRef(node);
        if (i) implRefs.push(i);
        break;
      }
      case "test": {
        const t = traceNodeToTestRef(node);
        if (t) testRefs.push(t);
        break;
      }
      // needs-review nodes don't map to legacy model types
    }
  }

  return { requirements, specs, implRefs, testRefs };
}
