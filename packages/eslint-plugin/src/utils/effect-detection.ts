import type { TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";

/** Default method/function names that are considered side-effectful */
const DEFAULT_EFFECT_PATTERNS = new Set([
  // DB
  "save",
  "insert",
  "update",
  "delete",
  "create",
  "upsert",
  "remove",
  "destroy",
  // HTTP
  "fetch",
  "post",
  "put",
  "send",
  "emit",
  "patch",
  // I/O
  "write",
  "writeFile",
  "writeFileSync",
  "appendFile",
  // State
  "setState",
  "dispatch",
  "commit",
  "mutate",
]);

export interface EffectDetectionOptions {
  effectPatterns?: string[];
}

/**
 * Determine whether a CallExpression is a side-effectful call.
 */
export function isEffectfulCall(
  node: TSESTree.CallExpression,
  options: EffectDetectionOptions = {},
): boolean {
  const patterns = options.effectPatterns
    ? new Set(options.effectPatterns)
    : DEFAULT_EFFECT_PATTERNS;

  const name = getCallName(node);
  return name !== null && patterns.has(name);
}

/**
 * Extract the function/method name from a CallExpression.
 */
function getCallName(node: TSESTree.CallExpression): string | null {
  if (node.callee.type === AST_NODE_TYPES.Identifier) {
    return node.callee.name;
  }
  if (
    node.callee.type === AST_NODE_TYPES.MemberExpression &&
    node.callee.property.type === AST_NODE_TYPES.Identifier
  ) {
    return node.callee.property.name;
  }
  return null;
}

/**
 * Get a description of a side-effectful call for error messages.
 */
export function describeEffect(node: TSESTree.CallExpression): string {
  const name = getCallName(node);
  return name ? `${name}(...)` : "<unknown call>";
}
