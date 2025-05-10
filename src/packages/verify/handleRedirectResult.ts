import { decodeAndStoreToken } from "./decodeAndStoreToken";
import { jwtDecode } from "jwt-decode";

type DecodedPayload = {
  ageVerified: boolean;
  userId: string;
  exp: number;
  iat: number;
};

export async function handleRedirectResult({
  onVerified,
  onFailure,
}: {
  onVerified: (payload: DecodedPayload) => void;
  onFailure?: (error?: unknown) => void;
}): Promise<void> {
  try {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("jwt"); // ✅ updated from 'token'

    if (!token) {
      throw new Error("No JWT found in URL");
    }

    const verified = await decodeAndStoreToken(token);

    if (!verified) {
      throw new Error("JWT verification failed");
    }

    url.searchParams.delete("jwt");
    window.history.replaceState({}, document.title, url.toString());
    const payload = jwtDecode<DecodedPayload>(token);
    onVerified(payload);
  } catch (err) {
    console.error("[UNQVerify] handleRedirectResult failed:", err);
    onFailure?.(err);
  }
}
