export type AnalyticsConfig = { ga4Id: string };
export function analyticsConfig(env: Record<string, unknown>): AnalyticsConfig {
  const ga4Id = String(env.VITE_GA4_MEASUREMENT_ID ?? "G-S01H2T36XB").trim();
  if (ga4Id && !/^G-[A-Z0-9]{4,}$/.test(ga4Id)) {
    throw new Error(
      "VITE_GA4_MEASUREMENT_ID must be a public GA4 measurement ID starting with G-.",
    );
  }
  return { ga4Id };
}
export function isLocalHostname(hostname: string) {
  return (
    ["localhost", "[::1]", "::1", "0.0.0.0"].includes(hostname) ||
    /^127\./.test(hostname) ||
    hostname.endsWith(".localhost")
  );
}
