import type { TraceNode, IndexedSpecIndex } from "../model/types.js";
import { emptyIndexedSpecIndex } from "../model/types.js";
import {
  traceNodeToRequirement,
  traceNodeToSpec,
  traceNodeToImplRef,
  traceNodeToTestRef,
} from "./trace-to-model.js";

/**
 * Build an IndexedSpecIndex from an array of TraceNodes.
 * All nodes (including needs-review) are retained in allNodes and refsByFile.
 */
export function buildIndexedSpecIndex(nodes: TraceNode[]): IndexedSpecIndex {
  const index = emptyIndexedSpecIndex();
  index.allNodes = nodes;

  for (const node of nodes) {
    // refsByFile — all node kinds
    const fileNodes = index.refsByFile.get(node.filePath);
    if (fileNodes) {
      fileNodes.push(node);
    } else {
      index.refsByFile.set(node.filePath, [node]);
    }

    switch (node.kind) {
      case "requirement": {
        const req = traceNodeToRequirement(node);
        if (req) index.requirements.set(req.id, req);
        break;
      }
      case "spec": {
        const spec = traceNodeToSpec(node);
        if (spec) {
          index.specs.set(spec.id, spec);
          const existing = index.specsByRequirement.get(spec.requirementId);
          if (existing) {
            existing.push(spec);
          } else {
            index.specsByRequirement.set(spec.requirementId, [spec]);
          }
        }
        break;
      }
      case "impl": {
        const impl = traceNodeToImplRef(node);
        if (impl) {
          const existing = index.implsBySpec.get(impl.specId);
          if (existing) {
            existing.push(impl);
          } else {
            index.implsBySpec.set(impl.specId, [impl]);
          }
        }
        break;
      }
      case "test": {
        const testRef = traceNodeToTestRef(node);
        if (testRef) {
          const existing = index.testsBySpec.get(testRef.specId);
          if (existing) {
            existing.push(testRef);
          } else {
            index.testsBySpec.set(testRef.specId, [testRef]);
          }
        }
        break;
      }
      // needs-review: already in allNodes and refsByFile
    }
  }

  return index;
}
