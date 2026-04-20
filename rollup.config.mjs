import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import path from "node:path";

export default {
  input: "src/plugin.ts",
  output: {
    file: "com.claudedeck.sdPlugin/bin/plugin.js",
    format: "esm",
    sourcemap: true,
  },
  plugins: [
    resolve({
      browser: false,
      exportConditions: ["node"],
    }),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: false,
      outDir: undefined,
    }),
  ],
};
