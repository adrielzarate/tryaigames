# Website analytics

## Google Analytics 4

The public site's measurement ID is `G-S01H2T36XB`. A measurement ID is public configuration, not an API key or an administrative credential.

No account API keys are required. Optionally set `VITE_GA4_MEASUREMENT_ID` at build time to override the default. An explicitly empty value disables GA4. Never put administrative secrets in a variable prefixed with `VITE_`: those variables are embedded in browser code.

GA4 runs only in production builds on non-local hostnames. The local editing application does not initialize analytics. Loopback previews and `npm run dev` do not load Google Analytics.

The site uses basic consent: the Google script is not requested before the visitor chooses **Allow analytics**. **Decline analytics** leaves it unloaded. The choice is stored locally for 180 days. **Analytics preferences** in the footer lets visitors change their choice. Withdrawing consent disables collection, clears accessible GA cookies and reloads the page to remove Google's running listeners. Advertising storage, advertising user data, advertising personalization and Google Signals remain disabled.

Measured interactions after consent:

| Event             | Parameters              | Trigger                                                           |
| ----------------- | ----------------------- | ----------------------------------------------------------------- |
| `page_view`       | Standard GA4 parameters | One initial page view per load after consent                      |
| `review_open`     | `project_id`            | Open a review                                                     |
| `project_visit`   | `project_id`, `source`  | Open a project's website from a card, review title or Try it link |
| `developer_visit` | `project_id`, `source`  | Open a creator's website                                          |
| `category_select` | `category`              | Select a quick category filter                                    |
| `gallery_search`  | `result_count`          | Pause typing for 650 ms in a nonempty search                      |

No search strings, review text or creator names are included in custom events. Page location and initial referrer omit query strings and fragments. Set up event-scoped custom dimensions in GA4 if you want to group reports by `project_id`, `source` or `category`; register `result_count` as a custom metric if needed. Enhanced measurement can separately record outbound clicks, which are a different event from `project_visit`.

## Cloudflare Web Analytics

This site uses Cloudflare's automatic script injection, configured in its dashboard. The application does not add a second Cloudflare script or require a beacon token. The Google Analytics preference controls Google Analytics only; it does not disable Cloudflare's independently configured measurement.

## Verify after deployment

1. Visit the published site with an ad blocker disabled for the check.
2. Allow Google Analytics using the site's preference banner.
3. In Google Analytics, open Realtime and interact with the gallery. Reports may take a few minutes to update.
4. Open Analytics preferences, decline, and verify that Google requests stop on the reloaded page.
5. Use Cloudflare's dashboard to verify its separately installed analytics.

Consent implementation reference: https://developers.google.com/tag-platform/security/guides/consent?consentmode=basic
