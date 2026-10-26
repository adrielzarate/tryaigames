import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  analyticsEnabled,
  chooseAnalytics,
  getConsent,
  subscribeConsent,
} from "../lib/analytics";
import { Modal } from "./Modal";
export function AnalyticsPreferences() {
  const consent = useSyncExternalStore(
    subscribeConsent,
    getConsent,
    () => null,
  );
  const [open, setOpen] = useState(false);
  if (!analyticsEnabled) return null;
  const details = (
    <p>
      We use optional Google Analytics cookies to understand visits and how the
      gallery is used, and an optional cookie to remember which review button
      design you see during an A/B test. Your search text is not sent. Allow or
      decline these cookies; you can change your choice here at any time.
    </p>
  );
  const actions = (
    <div className="analytics-actions">
      <button
        className="button"
        onClick={() => {
          chooseAnalytics("declined");
          setOpen(false);
        }}
      >
        Reject cookies
      </button>
      <button
        className="button button-mint"
        onClick={() => {
          chooseAnalytics("accepted");
          setOpen(false);
        }}
      >
        Accept cookies
      </button>
    </div>
  );
  return (
    <>
      <button className="analytics-settings" onClick={() => setOpen(true)}>
        Analytics preferences
      </button>
      {consent === null &&
        !open &&
        createPortal(
          <aside
            className="analytics-banner"
            aria-label="Analytics preferences"
          >
            <div>
              <h2>Help us understand what you enjoy</h2>
              {details}
            </div>
            {actions}
          </aside>,
          document.body,
        )}
      {open &&
        createPortal(
          <Modal title="Analytics preferences" onClose={() => setOpen(false)}>
            <header className="modal-header">
              <h2>Analytics preferences</h2>
              <button className="button" onClick={() => setOpen(false)}>
                Close
              </button>
            </header>
            <div className="prose">
              {details}
              <p>
                Current choice:{" "}
                {consent === "accepted"
                  ? "allowed"
                  : consent === "declined"
                    ? "declined"
                    : "not selected"}
                .
              </p>
            </div>
            {actions}
          </Modal>,
          document.body,
        )}
    </>
  );
}
