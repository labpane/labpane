import { readFile } from "node:fs/promises";

export const json = (value) => JSON.stringify(value, null, 2) + "\n";
export const targets = ["web", "desktop", "pwa"];

export function validateConfig(config) {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new Error("Config must be a JSON object.");
  }
  const known = [
    "$schema",
    "version",
    "name",
    "directory",
    "template",
    "targets",
  ];
  for (const key of Object.keys(config)) {
    if (!known.includes(key)) throw new Error(`Unknown config field: ${key}`);
  }
  if (config.$schema !== undefined && typeof config.$schema !== "string")
    throw new Error("$schema must be a string.");
  if (config.version !== 1) throw new Error("Config version must be 1.");
  if (
    typeof config.name !== "string" ||
    !/^[a-z][a-z0-9-]{0,63}$/.test(config.name) ||
    /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/.test(config.name)
  ) {
    throw new Error(
      "Name must start with a lowercase letter and contain only lowercase letters, numbers, or hyphens (maximum 64 characters; no Windows reserved names).",
    );
  }
  if (config.template !== "react-ts")
    throw new Error('Template must be "react-ts".');
  if (
    typeof config.directory !== "string" ||
    !config.directory.trim() ||
    [...config.directory].some((char) => char.charCodeAt(0) < 32)
  ) {
    throw new Error("Directory must be a nonempty path.");
  }
  if (
    !Array.isArray(config.targets) ||
    !config.targets.length ||
    config.targets.some((target) => !targets.includes(target)) ||
    new Set(config.targets).size !== config.targets.length
  ) {
    throw new Error(
      "Targets must be a nonempty list of unique values: web, desktop, pwa.",
    );
  }
  return config;
}

export async function readJson(path) {
  let content;
  try {
    content = await readFile(path, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") throw new Error(`File not found: ${path}`);
    throw error;
  }
  try {
    return JSON.parse(content.replace(/^\uFEFF/, ""));
  } catch {
    throw new Error(`Invalid JSON: ${path}`);
  }
}
