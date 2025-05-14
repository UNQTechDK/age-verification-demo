import { getCookie } from "../utils/cookies";
import { VERIFICATION_COOKIE_KEY } from "../constants";
import { jwtDecode } from "jwt-decode";
import type { DecodedToken } from "../types";

export function isVerified(): boolean {
  try {
    const token = getCookie(VERIFICATION_COOKIE_KEY);
    if (!token) return false;

    const decoded = jwtDecode<DecodedToken>(token);
    if (!decoded.aldersverificeringdk_verification_result) return false;

    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) return false;

    return true;
  } catch (err) {
    console.warn("[UNQVerify] Failed to parse verification token:", err);
    return false;
  }
}
