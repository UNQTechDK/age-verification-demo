export async function callVerificationApi(
  url: string,
  publicKey: string
): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-public-key": publicKey,
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  const redirectUrl = await res.text();

  if (!redirectUrl.startsWith("http")) {
    throw new Error("Invalid redirect URL returned from API");
  }

  return redirectUrl;
}
