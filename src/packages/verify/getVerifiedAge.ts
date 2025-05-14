import { jwtDecode } from "jwt-decode";
import { VERIFICATION_COOKIE_KEY } from "../constants";
import { getCookie } from "../utils/cookies";
import type { DecodedToken } from "../types";

export function getVerifiedAge(): number | null {
  try {
    const token = getCookie(VERIFICATION_COOKIE_KEY);
    if (!token) return null;

    const decoded = jwtDecode<DecodedToken>(token);

    const now = Math.floor(Date.now() / 1000);
    const isTokenValid = decoded.exp >= now;
    const isVerified = decoded.aldersverificeringdk_verification_result;

    if (isTokenValid && isVerified) {
      return decoded.aldersverificeringdk_verification_age;
    }

    return null;
  } catch (err) {
    console.warn("[UNQVerify] Failed to extract verified age from token:", err);
    return null;
  }
}
