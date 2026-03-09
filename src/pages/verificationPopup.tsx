import { useEffect } from "react";
import { handleRedirectResult } from "@unqtech/age-verification-mitid";

export default function VerifyPopup() {
  const closePopup = () => {
    try {
      window.close();
    } catch {
      // Ignore close errors in browsers that restrict programmatic close.
    }
  };

  useEffect(() => {
    document.title = "Verifying – UNQVerify";
  }, []);

  useEffect(() => {
    handleRedirectResult({
      onVerified: (payload) => {
        console.log("✅ Verified via popup:", payload);
        closePopup();
      },
      onFailure: (error) => {
        console.warn("❌ Verification failed in popup:", error);
        closePopup();
      },
      onError: (outcome) => {
        console.error("❌ Redirect result error in popup:", outcome);
      },
    });
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-green-400 font-mono">
      <p className="text-center text-sm">Verifying...</p>
    </main>
  );
}
