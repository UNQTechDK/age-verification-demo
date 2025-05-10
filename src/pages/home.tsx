import { useEffect, useState, useTransition } from "react";
import {
  init,
  isVerified,
  resetVerification,
  start,
  startWithPopup,
} from "../packages";

export default function Home() {
  const [verified, setVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pending, startTransition] = useTransition();
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
    startTransition(() => {
      setErrorMessage("");
      init({
        publicKey: import.meta.env.VITE_PUBLIC_KEY,
        ageToVerify,
        redirectUri: window.location.origin + "/verification-result",
        mode: "redirect",
        onVerified: (payload) => {
          console.log("✅ Verified via redirect:", payload);
          setVerified(true);
        },
        onFailure: () => {
          console.warn("❌ Verification failed");
          setErrorMessage("Verification failed");
        },
      });
      start();
    });
  };

  const handleStartPopup = () => {
    const popup = window.open(
      "about:blank",
      "unqverify-popup",
      "width=500,height=650,noopener,noreferrer"
    );
    setErrorMessage("");

    if (!popup) {
      console.warn("Popup blocked");
      setErrorMessage("Popup blocked");
      return;
    }

    init({
      publicKey: import.meta.env.VITE_PUBLIC_KEY,
      ageToVerify,
      redirectUri: window.location.origin + "/verify-popup",
      mode: "popup",
      onVerified: (payload) => {
        console.log("✅ Verified via popup:", payload);
        setVerified(true);
      },
      onFailure: () => {
        console.warn("❌ Verification failed");
        setErrorMessage("Verification failed");
      },
    });

    startWithPopup(popup);
  };

  return (
    <div>
      <main className=" flex flex-col items-center justify-center bg-white dark:bg-black text-blue-500 dark:text-green-400 p-6 font-mono transition-colors">
        <div className="w-full max-w-2xl bg-white dark:bg-[#0d0d0d] border border-violet-700 dark:border-green-500 p-6 rounded shadow-lg space-y-6">
          <h1 className="text-2xl text-blue-500 dark:text-green-300 tracking-widest text-center">
            ░░ UNQVerify Demo ░░
          </h1>

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
                value={ageToVerify}
                onChange={(e) => setAgeToVerify(Number(e.target.value))}
                className="w-full dark:bg-black  text-blue-500 dark:text-green-300 border border-violet-700 dark:border-green-500 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-violet-400 dark:focus:ring-green-500"
              />
            </div>

            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={
                  mode === "popup" ? handleStartPopup : handleStartRedirect
                }
                disabled={verified || pending}
                className="cursor-pointer transition duration-150 bg-blue-400 dark:bg-green-500 text-black px-4 py-2 rounded uppercase tracking-wider text-sm font-bold hover:bg-blue-200 dark:hover:bg-green-400 disabled:opacity-30"
              >
                {pending ? (
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
                  setErrorMessage("");
                }}
                type="button"
                className="text-xs underline text-red-400 hover:text-red-300 cursor-pointer transition duration-150"
              >
                Reset
              </button>
            </div>

            {verified && (
              <p className="text-green-400 text-sm mt-2">
                ✅ Verified — cookie active until token expires.
              </p>
            )}
            {errorMessage && (
              <p className="text-red-400 text-sm mt-2">❌ {errorMessage}</p>
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
