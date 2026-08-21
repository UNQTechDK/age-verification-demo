import { useEffect, useState } from "react";
import {
  getVerifiedAge,
  init,
  isVerified,
  resetVerification,
  startVerificationWithPopup,
  startVerificationWithRedirect,
  type VerificationOutcome,
} from "@unqtech/age-verification-mitid";

export default function Home() {
  const [verified, setVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ageToVerify, setAgeToVerify] = useState(18);

  const [mode, setMode] = useState<"redirect" | "popup">("redirect");

  useEffect(() => {
    setVerified(isVerified());
  }, []);

  useEffect(() => {
    const handler = () => setVerified(isVerified());
    window.addEventListener("unqverify:updated", handler);
    return () => window.removeEventListener("unqverify:updated", handler);
  }, []);

  const getOutcomeMessage = (outcome: VerificationOutcome): string => {
    switch (outcome.code) {
      case "UNDER_AGE":
        return "Age requirement not met.";
      case "POPUP_CLOSED":
      case "USER_CANCELLED":
      case "POPUP_TIMEOUT":
        return "Verification was cancelled before completion.";
      case "POPUP_BLOCKED":
        return "Popup blocked. Please allow popups and try again.";
      case "NETWORK_ERROR":
        return "Network error during verification. Please try again.";
      case "TOKEN_INVALID":
        return "Verification token was invalid. Please try again.";
      case "UNTRUSTED_ORIGIN":
        return "Blocked verification message from untrusted origin.";
      default:
        return outcome.message || "Verification failed.";
    }
  };

  const handleStartRedirect = () => {
    setLoading(true);
    setErrorMessage("");

    init({
      publicKey: import.meta.env.VITE_PUBLIC_KEY,
      ageToVerify,
      redirectUri: window.location.origin + "/verification-result",
      onVerified: (payload) => {
        console.log("✅ Verified via redirect:", payload);
        setLoading(false);
        setVerified(true);
      },
      onDenied: (outcome) => {
        console.warn("⚠️ Verification denied:", outcome);
        setLoading(false);
        setVerified(false);
        setErrorMessage(getOutcomeMessage(outcome));
      },
      onCancelled: (outcome) => {
        console.warn("⚠️ Verification cancelled:", outcome);
        setLoading(false);
        setVerified(false);
        setErrorMessage(getOutcomeMessage(outcome));
      },
      onError: (outcome) => {
        console.error("❌ Verification error:", outcome);
        setLoading(false);
        setVerified(false);
        setErrorMessage(getOutcomeMessage(outcome));
      },
      onFailure: (error) => {
        // Legacy callback is still emitted by the SDK for compatibility.
        console.warn("⚠️ Legacy onFailure callback:", error);
      },
    });

    startVerificationWithRedirect();
  };

  const handleStartPopup = () => {
    const popup = window.open("", "unqverify-popup", "width=500,height=650");

    if (!popup) {
      setErrorMessage(
        "Popup blocked. Please enable popups in your browser and try again.",
      );
      return;
    }

    setLoading(true);
    setErrorMessage("");

    init({
      publicKey: import.meta.env.VITE_PUBLIC_KEY,
      ageToVerify,
      redirectUri: window.location.origin + "/verify-popup",
      onVerified: (payload) => {
        console.log("✅ Verified via popup (SDK callback):", payload);
        setLoading(false);
        setVerified(true);
        setErrorMessage("");
      },
      onDenied: (outcome) => {
        console.warn("⚠️ Popup verification denied:", outcome);
        setLoading(false);
        setVerified(false);
        setErrorMessage(getOutcomeMessage(outcome));
      },
      onCancelled: (outcome) => {
        console.warn("⚠️ Popup verification cancelled:", outcome);
        setLoading(false);
        setVerified(false);
        setErrorMessage(getOutcomeMessage(outcome));
      },
      onError: (outcome) => {
        console.error("❌ Popup verification error:", outcome);
        setLoading(false);
        setVerified(false);
        setErrorMessage(getOutcomeMessage(outcome));
      },
      onFailure: () => {
        // Intentionally no-op: granular callbacks above handle UI state.
      },
    });

    startVerificationWithPopup(popup);
  };

  return (
    <div>
      <section className="flex flex-col items-center justify-center bg-white dark:bg-black text-blue-500 dark:text-green-400 p-6 font-mono transition-colors">
        <div className="w-full max-w-2xl bg-white dark:bg-[#0d0d0d] border border-violet-700 dark:border-green-500 p-6 rounded shadow-lg space-y-6">
          <h1 className="text-2xl text-blue-500 dark:text-green-300 tracking-widest text-center">
            ░░ UNQVerify Demo ░░
          </h1>

          <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400 dark:border-amber-600 rounded p-4 space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <h2 className="font-bold text-amber-800 dark:text-amber-300 text-sm uppercase tracking-wide mb-1">
                  Test Mode Active
                </h2>
                <p className="text-amber-700 dark:text-amber-400 text-xs leading-relaxed">
                  This demo uses test credentials. To complete verification, you
                  need MitID test credentials from the official test tool.
                </p>
                <a
                  href="https://pp.mitid.dk/test-tool/frontend/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-sm font-semibold text-amber-800 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-200 underline"
                >
                  → Get test credentials at pp.mitid.dk ↗
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <fieldset>
              <legend className="block uppercase text-sm mb-1">
                Verification Mode
              </legend>
              <div className="flex items-center gap-4">
                <label>
                  <input
                    type="radio"
                    name="mode"
                    value="redirect"
                    checked={mode === "redirect"}
                    onChange={() => setMode("redirect")}
                    className="mr-1"
                  />
                  Redirect
                </label>
                <label>
                  <input
                    type="radio"
                    name="mode"
                    value="popup"
                    checked={mode === "popup"}
                    onChange={() => setMode("popup")}
                    className="mr-1"
                  />
                  Popup
                </label>
              </div>
            </fieldset>

            <div>
              <label
                htmlFor="age-to-verify"
                className="block uppercase text-sm mb-1"
              >
                Age to Verify
              </label>
              <input
                id="age-to-verify"
                name="ageToVerify"
                type="number"
                inputMode="numeric"
                autoComplete="off"
                min="1"
                max="120"
                value={ageToVerify}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= 1 && val <= 120) setAgeToVerify(val);
                }}
                className="w-full dark:bg-black  text-blue-500 dark:text-green-300 border border-violet-700 dark:border-green-500 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-violet-400 dark:focus:ring-green-500"
              />
            </div>

            {mode === "popup" && !verified && (
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Verification opens in a new window.
              </p>
            )}

            <div className="verification-actions flex items-center gap-4 mt-6">
              {verified ? (
                <span className="rounded border border-green-600 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800 dark:border-green-500 dark:bg-green-950 dark:text-green-300">
                  ✔ Already verified
                </span>
              ) : (
                <button
                  type="button"
                  onClick={
                    mode === "popup" ? handleStartPopup : handleStartRedirect
                  }
                  disabled={loading}
                  aria-busy={loading}
                  className="mitid-cta"
                >
                  <img
                    className="mitid-cta__logo"
                    src="/mitid-logo-white.png"
                    alt=""
                    width="732"
                    height="198"
                    aria-hidden="true"
                  />
                  <span translate="no">Confirm with MitID</span>
                </button>
              )}

              <span className="sr-only" role="status" aria-live="polite">
                {loading ? "Verification is starting" : ""}
              </span>

              <button
                type="button"
                onClick={() => {
                  resetVerification();
                  setVerified(false);
                  setLoading(false);
                  setErrorMessage("");
                }}
                className="verification-reset text-xs underline text-red-400 hover:text-red-300 cursor-pointer transition duration-150"
              >
                Reset
              </button>
            </div>

            {verified && (
              <>
                <p className="dark:text-green-400 text-sm mt-2">
                  ✅ Verified — cookie active until token expires.
                </p>
                <p className="dark:text-green-400 text-sm ">
                  Age verified: {getVerifiedAge()}
                </p>
              </>
            )}
            {errorMessage && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-400 dark:border-red-600 rounded p-3 mt-2">
                <p className="text-red-600 dark:text-red-400 text-sm font-semibold">
                  ❌ {errorMessage}
                </p>
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                  Need test credentials?{" "}
                  <a
                    href="https://pp.mitid.dk/test-tool/frontend/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-red-500 dark:hover:text-red-300"
                  >
                    Visit pp.mitid.dk ↗
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
