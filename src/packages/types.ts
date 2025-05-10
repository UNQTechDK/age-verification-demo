export interface UnqVerifyConfig {
  publicKey: string;
  ageToVerify: number;
  redirectUri: string;
  mode?: "redirect" | "popup";

  onVerified: (payload: Record<string, unknown>) => void;
  onFailure?: (error?: unknown) => void;
}
