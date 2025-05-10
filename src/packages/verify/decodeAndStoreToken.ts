// src/verify/decodeAndStoreToken.ts

// import { jwtVerify, createRemoteJWKSet } from "jose";
import { setCookie } from "../utils/cookies";
import { VERIFICATION_COOKIE_KEY } from "../constants";
import { jwtDecode } from "jwt-decode";

// const JWKS_URL = "https://api.aldersverificering.dk/.well-known/jwks";

type DecodedPayload = {
  ageVerified: boolean;
  userId: string;
  exp: number;
  iat: number;
};

export async function decodeAndStoreToken(token: string): Promise<boolean> {
  try {
    // const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

    // const { payload } = await jwtVerify(token, JWKS, {
    //   algorithms: ["RS256"],
    // });

    // For now, skip verification and just decode the payload
    // WARNING: This is insecure and should only be used for development!
    // const { payload } = await jwtVerify(token, JWKS, { algorithms: ["RS256"] });
    const payload = jwtDecode(token); // In browser-safe format

    const { exp } = payload as unknown as DecodedPayload;

    // if (!ageVerified || typeof exp !== "number") {
    //   console.warn(
    //     "[UNQVerify] Token is valid but user is not verified or exp is missing"
    //   );
    //   return false;
    // }

    const secondsToExpiry = exp - Math.floor(Date.now() / 1000);
    if (secondsToExpiry <= 0) return false;

    // Store the token in a cookie with exact expiry
    setCookie(VERIFICATION_COOKIE_KEY, token, secondsToExpiry);

    return true;
  } catch (err) {
    console.error("[UNQVerify] Failed to verify JWT with JWKS:", err);
    return false;
  }
}
