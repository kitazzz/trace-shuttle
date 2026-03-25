import { createShuttleConfig } from "@kitazzz/trace-shuttle-eslint-plugin";

export default await createShuttleConfig({
  files: ["examples/scenarios/simple/src/**/*.ts"],
  docsDir: "examples/scenarios/simple/docs",
  srcDirs: ["examples/scenarios/simple/src"],
});
