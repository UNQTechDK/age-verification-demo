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

export async function startWithPopup() {
  const config = getConfig();
  let popup: Window | null = null;

  try {
    const url = buildOidcUrl(config);
    const redirectUrl = await callVerificationApi(url, config.publicKey);

    popup = window.open(redirectUrl, "unqverify-popup", "width=500,height=650");
    if (!popup) {
      console.warn("[UNQVerify] Popup blocked");
      config.onFailure?.(
        new Error(
          "Popup blocked by browser. Please allow popups and try again."
        )
      );
      return;
    }

    const listener = (event: MessageEvent) => {
      try {
        if (event.data?.type === "UNQVERIFY_RESULT") {
          config.onVerified(event.data.payload);
          window.dispatchEvent(new CustomEvent("unqverify:updated"));
          window.removeEventListener("message", listener);
          if (popup) popup.close();
        }
      } catch (eventErr) {
        console.error("[UNQVerify] Error handling message event:", eventErr);
        config.onFailure?.(
          eventErr instanceof Error ? eventErr : new Error(String(eventErr))
        );
        if (popup)
          try {
            popup.close();
          } catch (closeErr) {
            console.error("[UNQVerify] Failed to close popup:", closeErr);
          }
      }
    };

    window.addEventListener("message", listener);
  } catch (err) {
    if (popup) {
      try {
        popup.close();
      } catch (closeErr) {
        console.error("[UNQVerify] Failed to close popup:", closeErr);
      }
    }
    console.error("[UNQVerify] Failed to initiate popup verification:", err);
    config.onFailure?.(err instanceof Error ? err : new Error(String(err)));
  }
}
