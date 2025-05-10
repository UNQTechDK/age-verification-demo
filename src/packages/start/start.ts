import { getConfig } from "../state";
import { buildOidcUrl } from "./buildUrl";
import { callVerificationApi } from "./callApi";
import { isVerified } from "../verify/isVerified";
import { getCookie } from "../utils/cookies";
import { VERIFICATION_COOKIE_KEY } from "../constants";

export async function startVerificationFlow() {
  const config = getConfig();

  if (isVerified()) {
    const token = getCookie(VERIFICATION_COOKIE_KEY);
    if (token) {
      config.onVerified({ token });
    } else {
      console.warn(
        "[UNQVerify] Token missing even though isVerified() was true."
      );
    }
    return;
  }

  try {
    const url = buildOidcUrl(config);
    const redirectUrl = await callVerificationApi(url, config.publicKey);

    window.location.href = redirectUrl;
  } catch (err) {
    console.error("[UNQVerify] Failed to start verification:", err);
    config.onFailure?.(err);
  }
}

export async function startWithPopup(popup?: Window | null) {
  const config = getConfig();

  // If popup is not provided, open it here (for backward compatibility)
  let win = popup;
  if (!win) {
    win = window.open(
      "about:blank",
      "unqverify-popup",
      "width=500,height=650,noopener,noreferrer"
    );
  }
  if (!win) {
    console.warn("[UNQVerify] Popup blocked");
    config.onFailure?.(new Error("Popup blocked"));
    return;
  }

  try {
    const url = buildOidcUrl(config);
    const redirectUrl = await callVerificationApi(url, config.publicKey);

    win.location.href = redirectUrl;

    const listener = (event: MessageEvent) => {
      if (event.data?.type === "UNQVERIFY_RESULT") {
        config.onVerified(event.data.payload);
        window.dispatchEvent(new CustomEvent("unqverify:updated"));
        window.removeEventListener("message", listener);
        win!.close();
      }
    };

    window.addEventListener("message", listener);
  } catch (err) {
    win.close();
    console.error("[UNQVerify] Failed to initiate popup verification:", err);
    config.onFailure?.(err);
  }
}
