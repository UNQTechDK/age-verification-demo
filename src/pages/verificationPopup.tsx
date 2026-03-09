import { useEffect } from "react";
import { handleRedirectResult } from "@unqtech/age-verification-mitid";

export default function VerifyPopup() {
  const logIncomingJwtForDebug = () => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("jwt");

    console.log("[UNQVerify debug] jwt:", token);

    try {
      window.opener?.postMessage(
        { type: "UNQVERIFY_DEBUG_JWT", jwt: token },
        window.location.origin,
      );
    } catch {
      // Ignore cross-window debug messaging issues.
    }
  };

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
    logIncomingJwtForDebug();

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
