import { getConfig } from "../state";
import { buildOidcUrl } from "./buildUrl";
import { callVerificationApi } from "./callApi";
import { isVerified } from "../verify/isVerified";
import { getCookie } from "../utils/cookies";
import { VERIFICATION_COOKIE_KEY } from "../constants";

export async function startVerificationWithRedirect() {
  let config: ReturnType<typeof getConfig> | null = null;

  try {
    config = getConfig();
    if (!config) {
      throw new Error(
        "[UNQVerify] Configuration missing. Ensure `getConfig()` is set up correctly."
      );
    }
  } catch (err) {
    console.error("[UNQVerify] Failed to retrieve configuration:", err);
    if (config?.onFailure) {
      config.onFailure(err instanceof Error ? err : new Error(String(err)));
    }
    return;
  }

  if (isVerified()) {
    const token = getCookie(VERIFICATION_COOKIE_KEY);

    if (token) {
      config.onVerified({ token });
    } else {
      console.warn(
        "[UNQVerify] Token missing even though isVerified() was true."
      );
      config.onFailure?.(
        new Error("User appears verified, but token cookie is missing.")
      );
    }
    return;
  }

  try {
    const oidcUrl = buildOidcUrl(config);
    const redirectUrl = await callVerificationApi(oidcUrl, config.publicKey);

    if (!redirectUrl || typeof redirectUrl !== "string") {
      throw new Error("Invalid redirect URL returned from verification API.");
    }

    window.location.href = redirectUrl;
  } catch (err) {
    console.error("[UNQVerify] Failed to start verification:", err);
    config.onFailure?.(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function startVerificationWithPopup(providedPopup?: Window) {
  const config = getConfig();
  let popup: Window | null = null;
  let shouldClosePopup = false;
  let hasCompleted = false;

  try {
    const url = buildOidcUrl(config);
    const redirectUrl = await callVerificationApi(url, config.publicKey);

    if (providedPopup && !providedPopup.closed) {
      popup = providedPopup;
      popup.location.href = redirectUrl;
      shouldClosePopup = false;
    } else {
      popup = window.open(
        redirectUrl,
        "unqverify-popup",
        "width=500,height=650"
      );
      shouldClosePopup = true;

      if (!popup) {
        console.warn("[UNQVerify] Popup blocked");
        config.onFailure?.(
          new Error(
            "Popup blocked by browser. Please allow popups and try again."
          )
        );
        return;
      }
    }

    // Listen for verification message
    const listener = (event: MessageEvent) => {
      if (event.data?.type === "UNQVERIFY_RESULT") {
        hasCompleted = true;

        try {
          config.onVerified(event.data.payload);
          window.dispatchEvent(new CustomEvent("unqverify:updated"));
        } catch (eventErr) {
          console.error("[UNQVerify] Error handling message event:", eventErr);
          config.onFailure?.(
            eventErr instanceof Error ? eventErr : new Error(String(eventErr))
          );
        } finally {
          window.removeEventListener("message", listener);
          if (shouldClosePopup && popup) {
            try {
              popup.close();
            } catch (closeErr) {
              console.error("[UNQVerify] Failed to close popup:", closeErr);
            }
          }
        }
      }
    };

    window.addEventListener("message", listener);

    const popupChecker = setInterval(() => {
      if (popup?.closed) {
        clearInterval(popupChecker);
        window.removeEventListener("message", listener);

        if (!hasCompleted) {
          config.onFailure?.(
            new Error("User closed the popup before completing verification.")
          );
        }
      }
    }, 500);
  } catch (err) {
    if (shouldClosePopup && popup) {
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
