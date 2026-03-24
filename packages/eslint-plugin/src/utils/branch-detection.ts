import type { TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";

/** Default property names that suggest business logic */
const DEFAULT_BUSINESS_PROPERTIES = new Set([
  "role",
  "status",
  "tier",
  "type",
  "category",
  "plan",
  "level",
  "permission",
  "membership",
  "subscription",
  "access",
  "grade",
  "rank",
  "priority",
]);

/** Default identifier prefixes that suggest business predicates */
const DEFAULT_BUSINESS_PREFIXES = [
  "is",
  "has",
  "can",
  "eligible",
  "should",
  "allowed",
  "requires",
];

export interface BranchDetectionOptions {
  businessProperties?: string[];
  businessPrefixes?: string[];
}

/**
 * Determine whether a condition expression appears to be business logic.
 */
export function isBusinessLikeCondition(
  node: TSESTree.Expression,
  options: BranchDetectionOptions = {},
): boolean {
  const props = new Set(
    options.businessProperties ?? DEFAULT_BUSINESS_PROPERTIES,
  );
  const prefixes = options.businessPrefixes ?? DEFAULT_BUSINESS_PREFIXES;

  return checkNode(node, props, prefixes);
}

function checkNode(
  node: TSESTree.Node,
  props: Set<string>,
  prefixes: string[],
): boolean {
  switch (node.type) {
    case AST_NODE_TYPES.MemberExpression:
      if (
        node.property.type === AST_NODE_TYPES.Identifier &&
        props.has(node.property.name)
      ) {
        return true;
      }
      return false;

    case AST_NODE_TYPES.BinaryExpression:
      return (
        checkNode(node.left, props, prefixes) ||
        checkNode(node.right, props, prefixes)
      );

    case AST_NODE_TYPES.LogicalExpression:
      return (
        checkNode(node.left, props, prefixes) ||
        checkNode(node.right, props, prefixes)
      );

    case AST_NODE_TYPES.UnaryExpression:
      return checkNode(node.argument, props, prefixes);

    case AST_NODE_TYPES.CallExpression:
      if (node.callee.type === AST_NODE_TYPES.Identifier) {
        return matchesBusinessPrefix(node.callee.name, prefixes);
      }
      if (
        node.callee.type === AST_NODE_TYPES.MemberExpression &&
        node.callee.property.type === AST_NODE_TYPES.Identifier
      ) {
        return matchesBusinessPrefix(node.callee.property.name, prefixes);
      }
      return false;

    case AST_NODE_TYPES.Identifier:
      return matchesBusinessPrefix(node.name, prefixes);

    default:
      return false;
  }
}

function matchesBusinessPrefix(name: string, prefixes: string[]): boolean {
  const lower = name.toLowerCase();
  return prefixes.some(
    (p) =>
      lower.startsWith(p.toLowerCase()) &&
      (name.length === p.length ||
        name[p.length] === name[p.length].toUpperCase()),
  );
}

/**
 * Get a short textual description of a condition for error messages.
 */
export function describeCondition(node: TSESTree.Expression): string {
  switch (node.type) {
    case AST_NODE_TYPES.MemberExpression:
      if (node.property.type === AST_NODE_TYPES.Identifier) {
        if (node.object.type === AST_NODE_TYPES.Identifier) {
          return `${node.object.name}.${node.property.name}`;
        }
        return `*.${node.property.name}`;
      }
      return "<member expression>";
    case AST_NODE_TYPES.BinaryExpression:
      return `${describeCondition(node.left as TSESTree.Expression)} ${node.operator} ...`;
    case AST_NODE_TYPES.CallExpression:
      if (node.callee.type === AST_NODE_TYPES.Identifier) {
        return `${node.callee.name}(...)`;
      }
      return "<call expression>";
    case AST_NODE_TYPES.Identifier:
      return node.name;
    default:
      return "<expression>";
  }
}
