import { analyticsConfig, isLocalHostname } from "./analytics-config";
type Parameters = Record<string, string | number>;
export type AnalyticsEvent = (event: string, parameters?: Parameters) => void;
type Consent = "accepted" | "declined" | null;
type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
    [key: `ga-disable-${string}`]: boolean;
  }
}
const STORAGE_KEY = "tryaigames.analytics-consent.v1";
const MAX_AGE = 180 * 24 * 60 * 60 * 1000;
const config = analyticsConfig(import.meta.env);
// The editor never calls initializeAnalytics; local previews are also excluded.
export const analyticsEnabled =
  import.meta.env.PROD &&
  import.meta.env.MODE !== "editor" &&
  !isLocalHostname(window.location.hostname) &&
  Boolean(config.ga4Id);
let initialized = false;
let running = false;
let consent: Consent = null;
const listeners = new Set<() => void>();
function readConsent(): Consent {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (
      saved &&
      Date.now() - saved.updatedAt >= 0 &&
      Date.now() - saved.updatedAt < MAX_AGE &&
      ["accepted", "declined"].includes(saved.choice)
    )
      return saved.choice;
  } catch {
    /* Storage can be disabled; the current visit can still use an in-memory choice. */
  }
  return null;
}
function notify() {
  for (const listener of listeners) listener();
}
export const subscribeConsent = (callback: () => void) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};
export const getConsent = () => consent;
function clearAnalyticsCookies() {
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0].trim();
    if (
      name !== "_ga" &&
      !name.startsWith("_ga_") &&
      name !== "_gid" &&
      !name.startsWith("_gat")
    )
      continue;
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
    const parts = location.hostname.split(".");
    for (let index = 0; index < parts.length - 1; index++) {
      document.cookie = `${name}=; Max-Age=0; Path=/; Domain=.${parts.slice(index).join(".")}; SameSite=Lax`;
    }
  }
}
function start() {
  if (!analyticsEnabled || running || consent !== "accepted") return;
  running = true;
  if (config.ga4Id) {
    const id = config.ga4Id;
    window[`ga-disable-${id}`] = false;
    window.dataLayer ??= [];
    window.gtag ??= function () {
      window.dataLayer!.push(arguments);
    };
    const gtag = window.gtag;
    const deniedAds = {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    };
    gtag("consent", "default", { ...deniedAds, analytics_storage: "denied" });
    gtag("consent", "update", { ...deniedAds, analytics_storage: "granted" });
    gtag("js", new Date());
    // Do not forward query strings, fragments, or referrer query strings.
    let referrer = "";
    try {
      const url = new URL(document.referrer);
      referrer = url.origin + url.pathname;
    } catch {
      /* No referrer. */
    }
    gtag("config", id, {
      send_page_view: true,
      page_location: location.origin + location.pathname,
      page_referrer: referrer,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_flags: "SameSite=Lax;Secure",
    });
    const script = document.createElement("script");
    script.id = "tryaigames-ga4";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.append(script);
  }
}
export function initializeAnalytics() {
  if (!analyticsEnabled || initialized) return;
  initialized = true;
  consent = readConsent();
  start();
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    consent = readConsent();
    if (consent !== "accepted" && running) stopAndReload();
    else start();
    notify();
  });
  notify();
}
function stopAndReload() {
  if (config.ga4Id) window[`ga-disable-${config.ga4Id}`] = true;
  clearAnalyticsCookies();
  // Reload removes provider timers/listeners as well as the script elements.
  window.location.reload();
}
export function chooseAnalytics(choice: Exclude<Consent, null>) {
  if (!analyticsEnabled) return;
  consent = choice;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ choice, updatedAt: Date.now() }),
    );
  } catch {
    /* Keep the choice in memory if storage is unavailable. */
  }
  notify();
  if (choice === "accepted") start();
  else if (running) stopAndReload();
  else clearAnalyticsCookies();
}
export const trackEvent: AnalyticsEvent = (name, parameters = {}) => {
  if (!analyticsEnabled || consent !== "accepted" || !running || !config.ga4Id)
    return;
  window.gtag?.("event", name, { ...parameters, send_to: config.ga4Id });
};
