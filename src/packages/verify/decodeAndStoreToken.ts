import { jwtVerify, createRemoteJWKSet } from "jose";
import { jwtDecode } from "jwt-decode";
import { setCookie } from "../utils/cookies";
import { VERIFICATION_COOKIE_KEY } from "../constants";

type DecodedPayload = {
  aldersverificeringdk_verification_result: boolean;
  aldersverificeringdk_verification_age: number;
  exp: number;
  iss: string;
};

function getJwksUrlFromIssuer(issuer: string): string | null {
  if (issuer === "https://devtest.aldersverificering.dk") {
    return "https://devtest.api.aldersverificering.dk/well-known/openid-configuration/jwks";
  }
  if (issuer === "https://test.aldersverificering.dk") {
    return "https://test.api.aldersverificering.dk/well-known/openid-configuration/jwks";
  }
  if (issuer === "https://aldersverificering.dk") {
    return "https://api.aldersverificering.dk/well-known/openid-configuration/jwks";
  }
  return null;
}

export async function decodeAndStoreToken(token: string): Promise<boolean> {
  try {
    // 1. Decode unverified token to get issuer
    const decoded = jwtDecode<DecodedPayload>(token);
    const jwksUrl = getJwksUrlFromIssuer(decoded.iss);

    if (!jwksUrl) {
      console.warn("[UNQVerify] Unknown issuer:", decoded.iss);
      return false;
    }

    // 2. Verify token using issuer-specific JWKS
    const JWKS = createRemoteJWKSet(new URL(jwksUrl));
    const { payload } = await jwtVerify(token, JWKS, {
      algorithms: ["RS256"],
    });

    const { aldersverificeringdk_verification_result, exp } =
      payload as DecodedPayload;

    if (!aldersverificeringdk_verification_result || typeof exp !== "number") {
      console.warn(
        "[UNQVerify] Token is valid but user is not verified or exp is missing"
      );
      return false;
    }

    const secondsToExpiry = exp - Math.floor(Date.now() / 1000);
    if (secondsToExpiry <= 0) return false;

    setCookie(VERIFICATION_COOKIE_KEY, token, secondsToExpiry);

    return true;
  } catch (err) {
    console.error("[UNQVerify] Failed to verify JWT with JWKS:", err);
    return false;
  }
}
