import { setConfig } from "./state";
import { startVerificationFlow } from "./start/start";
import type { UnqVerifyConfig } from "./types";

export function init(config: UnqVerifyConfig) {
  setConfig(config);
}

export function start() {
  return startVerificationFlow();
}

export { startWithPopup } from "./start/start";

export { resetVerification } from "./verify/resetVerification";

export { isVerified } from "./verify/isVerified";

export { handleRedirectResult } from "./verify/handleRedirectResult";
