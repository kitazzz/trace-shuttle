# trace-shuttle

`trace-shuttle` is a small toolkit for connecting specs in markdown to
implementation and tests in code with `@trace[...]` annotations.

Current packages:

- `@kitazzz/trace-shuttle-core`: parser, index builder, graph, validation
- `@kitazzz/trace-shuttle-cli`: CLI and report formatting
- `@kitazzz/trace-shuttle-eslint-plugin`: lint rules and `createShuttleConfig()`

This repository is currently `v0.1.0` and not published to npm yet.

## Quick Start

The fastest way to try `trace-shuttle` today is to clone this repository and
use the included examples.

```bash
git clone https://github.com/kitazzz/trace-shuttle.git
cd trace-shuttle
pnpm install
pnpm -r run build
node packages/cli/dist/cli-entry.js review --docs examples/scenarios/simple/docs --src examples/scenarios/simple/src examples/scenarios/simple/tests
```

If you want to see richer behavior immediately:

```bash
node packages/cli/dist/cli-entry.js review --docs examples/scenarios/complex/docs --src examples/scenarios/complex/src examples/scenarios/complex/tests
node packages/cli/dist/cli-entry.js validate --docs examples/scenarios/broken-links/docs --src examples/scenarios/broken-links/src examples/scenarios/broken-links/tests
```

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

## Try It From Another Project

Until npm publishing is in place, the easiest integration path is to install
packages from local tarballs.

Create tarballs:

```bash
pnpm -r run build
(cd packages/core && pnpm pack)
(cd packages/cli && pnpm pack)
(cd packages/eslint-plugin && pnpm pack)
```

Then, in another project, install the generated `.tgz` files:

```bash
pnpm add /path/to/trace-shuttle/packages/core/kitazzz-trace-shuttle-core-0.1.0.tgz
pnpm add -D /path/to/trace-shuttle/packages/eslint-plugin/kitazzz-trace-shuttle-eslint-plugin-0.1.0.tgz
```

For the CLI package:

```bash
pnpm add -D /path/to/trace-shuttle/packages/cli/kitazzz-trace-shuttle-cli-0.1.0.tgz
pnpm exec trace-shuttle --help
```

## CLI

The CLI package is `@kitazzz/trace-shuttle-cli`. In this repo you can run it with:

```bash
node packages/cli/dist/cli-entry.js review --docs examples/scenarios/simple/docs --src examples/scenarios/simple/src examples/scenarios/simple/tests
```

Other commands:

```bash
node packages/cli/dist/cli-entry.js list specs --docs examples/scenarios/complex/docs --src examples/scenarios/complex/src examples/scenarios/complex/tests
node packages/cli/dist/cli-entry.js find spec SPEC-CHECKOUT-EXPRESS --docs examples/scenarios/complex/docs --src examples/scenarios/complex/src examples/scenarios/complex/tests
node packages/cli/dist/cli-entry.js find file examples/scenarios/complex/src/checkout/flows/shipping.ts --docs examples/scenarios/complex/docs --src examples/scenarios/complex/src examples/scenarios/complex/tests
node packages/cli/dist/cli-entry.js validate --docs examples/scenarios/broken-links/docs --src examples/scenarios/broken-links/src examples/scenarios/broken-links/tests
```

## ESLint

Use `createShuttleConfig()` from `@kitazzz/trace-shuttle-eslint-plugin`.

```js
// eslint.config.mjs
import { createShuttleConfig } from "@kitazzz/trace-shuttle-eslint-plugin";

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
import {
  getSpecIndex,
  SpecGraph,
  validateSpecIndex,
} from "@kitazzz/trace-shuttle-core";

const index = await getSpecIndex("docs", ["src", "tests"]);
const issues = validateSpecIndex(index);
const graph = new SpecGraph(index);
const links = graph.buildLinks();
```

## Publish Status

The package names and exports are prepared for publishing, but npm publishing
has not been done yet.

For now, the recommended ways to try it are:

- clone this repository and run the built CLI against the included examples
- use the repository as a workspace
- create tarballs with `pnpm pack` and install those into another project
