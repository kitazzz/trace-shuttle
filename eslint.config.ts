import shuttle from "@spec-shuttle/eslint-plugin";
import { resolve } from "node:path";

export default [
  {
    files: ["examples/src/**/*.ts"],
    ...shuttle.configs.recommended,
    settings: {
      "shuttle/docsDir": resolve("examples/docs"),
      "shuttle/srcDirs": [resolve("examples/src")],
    },
  },
];
