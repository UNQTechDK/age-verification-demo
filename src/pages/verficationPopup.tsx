import { useEffect } from "react";
import { handleRedirectResult } from "../packages";

export default function VerifyPopup() {
  useEffect(() => {
    handleRedirectResult({
      onVerified: (payload) => {
        console.log("✅ Verified via popup:", payload);

        // Post the result to the parent window
        window.opener?.postMessage({ type: "UNQVERIFY_RESULT", payload }, "*");

        // Close the popup
        window.close();
      },
      onFailure: (error) => {
        console.warn("❌ Verification failed in popup:", error);
        window.close();
      },
    });
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-green-400 font-mono">
      <p className="text-center text-sm">Verifying...</p>
    </main>
  );
}
