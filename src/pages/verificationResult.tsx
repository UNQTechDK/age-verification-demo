import { useEffect, useState } from "react";
import { handleRedirectResult } from "../packages";

export default function VerificationResult() {
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("jwt");

    if (!token) {
      window.location.href = "/";
      return;
    }

    handleRedirectResult({
      onVerified: (payload) => {
        console.log("✅ Verified:", payload);
        setStatus("success");

        // Clean up the URL
        url.searchParams.delete("jwt");
        window.history.replaceState({}, document.title, url.toString());

        // Optional: postMessage to parent or iframe host
        window.parent?.postMessage({ type: "UNQVERIFY_RESULT", payload }, "*");

        // ✅ Redirect to success page after 2s
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      },
      onFailure: (err) => {
        setStatus("error");
        console.error("❌ Verification failed:", err);
        alert("Verification failed. Please try again.");
        // Clean up the URL
        url.searchParams.delete("jwt");
        window.history.replaceState({}, document.title, url.toString());
        window.location.href = "/";
      },
    });
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center text-center p-6 text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-black">
      {status === "verifying" && <p>Verifying your identity...</p>}
      {status === "success" && (
        <p>✅ Verification successful! You can close this window.</p>
      )}
      {status === "error" && <p>❌ Verification failed. Please try again.</p>}
    </main>
  );
}
