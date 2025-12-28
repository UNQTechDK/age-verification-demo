import { useEffect, useState } from "react";
import {
  getVerifiedAge,
  init,
  isVerified,
  resetVerification,
  startVerificationWithPopup,
  startVerificationWithRedirect,
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
      onFailure: () => {
        console.warn("❌ Verification failed");
        setLoading(false);
        setErrorMessage("Verification failed");
      },
    });

    startVerificationWithRedirect();
  };

  const handleStartPopup = () => {
    const popup = window.open("", "unqverify-popup", "width=500,height=650");

    if (!popup) {
      setErrorMessage(
        "Popup blocked. Please enable popups in your browser and try again."
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
        console.log("✅ Verified via popup:", payload);
        setLoading(false);
        setVerified(true);
      },
      onFailure: () => {
        console.warn("❌ Verification failed");
        setLoading(false);
        setErrorMessage("Verification failed");
      },
    });

    startVerificationWithPopup(popup);
  };

  return (
    <div>
      <main className=" flex flex-col items-center justify-center bg-white dark:bg-black text-blue-500 dark:text-green-400 p-6 font-mono transition-colors">
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
            <div>
              <label className="block uppercase text-sm mb-1">
                Verification Mode
              </label>
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
            </div>

            <div>
              <label className="block uppercase text-sm mb-1">
                Age to Verify
              </label>
              <input
                type="number"
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

            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={
                  mode === "popup" ? handleStartPopup : handleStartRedirect
                }
                disabled={verified || loading}
                className="cursor-pointer transition duration-150 bg-blue-400 dark:bg-green-500 text-black px-4 py-2 rounded uppercase tracking-wider text-sm font-bold hover:bg-blue-200 dark:hover:bg-green-400 disabled:opacity-30"
              >
                {loading ? (
                  <span className="flex items-center">
                    <LoaderSVG /> Loading
                  </span>
                ) : verified ? (
                  "✔ Already Verified"
                ) : (
                  "▶ Start Verification"
                )}
              </button>

              <button
                onClick={() => {
                  resetVerification();
                  setVerified(false);
                  setLoading(false);
                  setErrorMessage("");
                }}
                className="text-xs underline text-red-400 hover:text-red-300 cursor-pointer transition duration-150"
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

        <footer className="text-xs  dark:text-green-500 mt-8 opacity-60">
          MITID Age Verification SDK · UNQTech © {new Date().getFullYear()}
        </footer>
      </main>
    </div>
  );
}

const LoaderSVG = () => (
  <svg
    className="mr-3 -ml-1 size-5 animate-spin text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      stroke-width="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);
