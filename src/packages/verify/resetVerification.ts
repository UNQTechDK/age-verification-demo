import { deleteCookie } from "../utils/cookies";
import { VERIFICATION_COOKIE_KEY } from "../constants";

export function resetVerification(): void {
  deleteCookie(VERIFICATION_COOKIE_KEY);
  console.info("[UNQVerify] Verification token cleared");
}
