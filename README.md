# trace-shuttle

`trace-shuttle` is a small toolkit for connecting specs in markdown to
implementation and tests in code with `@trace[...]` annotations.

Current packages:

- `@trace-shuttle/core`: parser, index builder, graph, validation
- `@trace-shuttle/review`: CLI and report formatting
- `@trace-shuttle/eslint-plugin`: lint rules and `createShuttleConfig()`

This repository is currently `v0.1.0` and not published to npm yet.

## Annotation Syntax

Markdown:

```md
<!-- @trace[requirement id=REQ-001 category=pricing] -->
<!-- @trace[spec id=SPEC-001 req=REQ-001] -->
```

TypeScript / JavaScript:

```ts
/* @trace[impl spec=SPEC-001] */
/* @trace[test spec=SPEC-001] */
/* @trace[needs-review] */
```

## Example Scenarios

The repository includes three example sets under [`examples/scenarios`](/Users/kazunori_kitazume@partners.tailor.tech/.superset/worktrees/spec-shuttle/kitazzz/poc/examples/scenarios):

- `simple`: small happy-path example
- `complex`: multiple docs, nested source layout, mixed coverage states
- `broken-links`: missing requirements and orphan impl/test references

## Local Usage

Install dependencies:

```bash
pnpm install
pnpm -r run build
```

Run tests and lint:

```bash
pnpm test
pnpm lint
```

## CLI

The CLI package is `@trace-shuttle/review`. In this repo you can run it with:

```bash
node packages/review/dist/cli-entry.js review --docs examples/scenarios/simple/docs --src examples/scenarios/simple/src examples/scenarios/simple/tests
```

Other commands:

```bash
node packages/review/dist/cli-entry.js list specs --docs examples/scenarios/complex/docs --src examples/scenarios/complex/src examples/scenarios/complex/tests
node packages/review/dist/cli-entry.js find spec SPEC-CHECKOUT-EXPRESS --docs examples/scenarios/complex/docs --src examples/scenarios/complex/src examples/scenarios/complex/tests
node packages/review/dist/cli-entry.js find file examples/scenarios/complex/src/checkout/flows/shipping.ts --docs examples/scenarios/complex/docs --src examples/scenarios/complex/src examples/scenarios/complex/tests
node packages/review/dist/cli-entry.js validate --docs examples/scenarios/broken-links/docs --src examples/scenarios/broken-links/src examples/scenarios/broken-links/tests
```

## ESLint

Use `createShuttleConfig()` from `@trace-shuttle/eslint-plugin`.

```js
// eslint.config.mjs
import { createShuttleConfig } from "@trace-shuttle/eslint-plugin";

export default await createShuttleConfig({
  files: ["src/**/*.ts"],
  docsDir: "docs",
  srcDirs: ["src", "tests"],
});
```

Current rules:

- `trace-shuttle/require-spec-ref-on-business-branch`
- `trace-shuttle/spec-ref-must-exist`
- `trace-shuttle/test-ref-must-exist`
- `trace-shuttle/effect-must-be-anchored`

## Core API

```ts
import { getSpecIndex, SpecGraph, validateSpecIndex } from "@trace-shuttle/core";

const index = await getSpecIndex("docs", ["src", "tests"]);
const issues = validateSpecIndex(index);
const graph = new SpecGraph(index);
const links = graph.buildLinks();
```

## Publish Status

The package names and exports are prepared for publishing, but npm publishing
has not been done yet. Until then, use the repository as a workspace or create
tarballs with `pnpm pack`.
