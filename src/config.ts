import * as path from "node:path";

// NOTE: This module currently relies on CommonJS globals (`require`, `__dirname`).
// When migrating to TS 7 + ESM ("type": "module" + verbatimModuleSyntax), replace
// `require`/`require.resolve` with `createRequire` from "node:module" or `import.meta`.

function addConfigPath(allPaths: string[], configPath: string): void {
  if (allPaths.indexOf(configPath) < 0) allPaths.push(configPath);
}

export function initConfig(): void {
  const allPaths: string[] = [];

  // Define config paths
  const package_path = path.join(path.dirname(require.resolve("../package.json")), "config");
  const runtime_path = path.normalize(path.join(process.cwd(), "config"));
  const file_path = path.join(path.dirname(process.argv[2] ?? ""), "config");
  addConfigPath(allPaths, package_path);
  addConfigPath(allPaths, runtime_path);
  addConfigPath(allPaths, file_path);

  // Set NODE_CONFIG_DIR
  process.env["NODE_CONFIG_DIR"] = allPaths.join(path.delimiter);

  // Force node-config to re-read with updated NODE_CONFIG_DIR
  const _config = require("config"); // eslint-disable-line @typescript-eslint/no-require-imports
  // console.log(
  //   "Config dir:",
  //   process.env["NODE_ENV"],
  //   process.env["NODE_CONFIG_DIR"],
  //   _config.util.getConfigSources().map((config: any) => config.name),
  //   _config.get("version"),
  // );
}

export default initConfig;
