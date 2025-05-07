import { useEffect, useState, useTransition } from "react";
import {
  init,
  start,
  isVerified,
  resetVerification,
} from "@unqtech/age-verification-mitid";

export default function Home() {
  const [verified, setVerified] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const [ageToVerify, setAgeToVerify] = useState(18);
  const [redirectUri, setRedirectUri] = useState(
    window.location.origin + "/verification-result"
  );

  useEffect(() => {
    setVerified(isVerified());
  }, []);

  const handleStart = () => {
    startTransition(() => {
      setErrorMessage("");

      init({
        publicKey: import.meta.env.VITE_PUBLIC_KEY,
        ageToVerify,
        redirectUri,
        onVerified: (payload) => {
          console.log("✅ Verified:", payload);
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

  return (
    <div data-theme={darkMode ? "dark" : ""}>
      <main className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black text-blue-500 dark:text-green-400 p-6 font-mono transition-colors">
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-xs px-3 py-1 border border-violet-700 dark:border-green-400 rounded hover:bg-green-700 hover:text-black dark:hover:bg-green-200 dark:hover:text-black transition-colors"
          >
            {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        <div className="w-full max-w-2xl bg-white dark:bg-[#0d0d0d] border border-violet-700 dark:border-green-500 p-6 rounded shadow-lg space-y-6">
          <h1 className="text-2xl text-blue-500 dark:text-green-300 tracking-widest text-center">
            ░░ UNQVerify Demo ░░
          </h1>

          <div className="space-y-4">
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

            <div>
              <label className="block uppercase text-sm mb-1">
                Redirect URI
              </label>
              <input
                type="text"
                value={redirectUri}
                onChange={(e) => setRedirectUri(e.target.value)}
                className="w-full dark:bg-black text-blue-500 dark:text-green-300 border border-violet-700 dark:border-green-500 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-violet-400 dark:focus:ring-green-500"
              />
            </div>

            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={handleStart}
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
