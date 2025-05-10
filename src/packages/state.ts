import type { UnqVerifyConfig } from "./types";

let config: UnqVerifyConfig | null = null;

export function setConfig(c: UnqVerifyConfig) {
  config = c;
}

export function getConfig(): UnqVerifyConfig {
  if (!config) throw new Error("[UNQVerify] SDK not initialized");
  return config;
}
