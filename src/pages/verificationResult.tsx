import { useEffect, useState } from "react";
import { handleRedirectResult } from "@unqtech/age-verification-mitid";

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

        //Clean up the URL
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

        // Clean up the URL
        url.searchParams.delete("jwt");
        window.history.replaceState({}, document.title, url.toString());

        // Redirect after showing error
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      },
    });
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center text-center p-6 text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-black">
      {status === "verifying" && <p>Verifying your identity...</p>}
      {status === "success" && (
        <p>✅ Verification successful! You can close this window.</p>
      )}
      {status === "error" && (
        <div className="space-y-2">
          <p className="text-red-500 font-semibold">
            ❌ Verification failed. Please try again.
          </p>
          <p className="text-xs">
            Need test credentials?{" "}
            <a
              href="https://pp.mitid.dk/test-tool/frontend/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80"
            >
              Visit pp.mitid.dk ↗
            </a>
          </p>
        </div>
      )}
    </main>
  );
}
