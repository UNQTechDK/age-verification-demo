import type { UnqVerifyConfig } from "../types";

export function buildOidcUrl(config: UnqVerifyConfig): string {
  const isTestKey = config.publicKey.startsWith("pk_test_");
  const baseUrl = isTestKey
    ? "https://test.api.aldersverificering.dk"
    : "https://api.aldersverificering.dk";

  const query = new URLSearchParams({
    RedirectUri: config.redirectUri,
    AgeToVerify: config.ageToVerify.toString(),
  });

  return `${baseUrl}/api/v1/oidc/create?${query.toString()}`;
}
