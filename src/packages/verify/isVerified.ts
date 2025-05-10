import { getCookie } from "../utils/cookies";
import { VERIFICATION_COOKIE_KEY } from "../constants";
import { jwtDecode } from "jwt-decode";

type DecodedToken = {
  ageVerified: boolean;
  exp: number;
  userId?: string;
  idbrokerdk_age_verified: string;
};

export function isVerified(): boolean {
  try {
    const token = getCookie(VERIFICATION_COOKIE_KEY);
    if (!token) return false;

    const decoded = jwtDecode<DecodedToken>(token);
    // if (!decoded.ageVerified) return false;
    if (!decoded.idbrokerdk_age_verified) return false;

    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) return false;

    return true;
  } catch (err) {
    console.warn("[UNQVerify] Failed to parse verification token:", err);
    return false;
  }
}
