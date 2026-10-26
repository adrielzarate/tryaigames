# Review button A/B test

The first experiment compares the existing **Read review** text button (A) with a green button using the same wording (B). Its ID is `review-cta-v1`. Text, project order and review contents are unchanged.

## How it works

The Worker in `worker/index.ts` assigns A or B with equal probability when serving the home page. It injects attributes into the HTML before React renders, avoiding a flash of the other design. Only `/` and `/index.html` run the Worker; images, scripts and other static assets use normal asset delivery. Personalized HTML has `Cache-Control: private, no-store`. Do not add a Cloudflare Cache Everything rule for HTML that overrides this header.

The Worker never creates cookies. After analytics consent, the browser stores `tryaigames_review_cta_v1` for 180 days to preserve that visitor's variant. Rejecting or withdrawing consent removes it. Without consent, a fresh assignment can occur on each page load, but no GA4 experiment events are sent. Blocked cookies also prevent assignment persistence. Local Vite previews use A; the Worker preview exercises the real assignment. There is no public query parameter to force or contaminate a test variant.

## Metric

Only visits with accepted analytics consent can be measured. Here a visit means one full page load, not a GA4 session or unique person. A returning person can contribute multiple page loads. Repeated review opens in the same load count only once as a conversion.

- `experiment_exposure`: once when analytics starts on a test page load, including consent given during that load.
- `review_conversion`: once on the first review opened **after** analytics starts.
- Existing `review_open`: every measured review open; retains `project_id` and adds the experiment parameters.

All three include `experiment_id` and `variant`. The rate for each variant is **review_conversion event count / experiment_exposure event count**. Review opens before consent are not backfilled. Exposure means a measured home-page load, not a guarantee that a particular button entered the viewport. Compare the same time period and consider device category. Do not select a winner from a handful of visits or automatically stop when a temporary lead appears; choose a duration and required sample size based on observed baseline traffic before drawing conclusions.

## Set up Google Analytics

1. Open the GA4 property, then **Admin → Data display → Custom definitions → Create custom dimension**.
2. Create **Experiment ID**, scope **Event**, event parameter `experiment_id`.
3. Create **Experiment variant**, scope **Event**, event parameter `variant`.
4. After deployment and consenting visits, check **Realtime** for `experiment_exposure` and `review_conversion`.
5. Allow 24–48 hours for custom dimensions to become available in reports. In **Explore → Free form**, import the two dimensions and **Event name**, plus **Event count**. Use variant as rows, event name as columns, event count as values, and filter experiment ID to `review-cta-v1` and event name to `experiment_exposure|review_conversion` using a matching regular expression. Divide conversions by exposures per variant (export if needed).

Cloudflare Web Analytics remains independent; this custom conversion report lives in GA4. Workers does the assignment, not the statistical analysis.

## Preview and deploy

```sh
npm ci
npm run check
npm test
npm run build
npm run deploy:check
npm run preview:worker
```

Open the localhost URL printed by Wrangler to inspect variants. GA4 remains disabled on localhost. To preview a particular variant locally, run `npm run preview:worker -- --var REVIEW_CTA_MODE:B` (or `A`). The preview override does not change production configuration.

For the existing Git-connected Worker, commit and push these source changes to the connected branch. Keep **Build command** = `npm run build` and **Deploy command** = `npx wrangler deploy`. Cloudflare installs the pinned dependencies and deploys the Worker together with `dist`. No new service, database, API key, or dashboard A/B feature is required. Do not upload `dist` to GitHub.

Verify on the live site: accept cookies, inspect the HTML `data-review-variant`, reload to check persistence, open several reviews and check GA4 events. In a fresh browser context rejecting cookies, confirm there is no assignment cookie or Google request. Do not use localhost preview visits as evidence that production analytics works.

The HTML requests now execute Worker code and count toward the Workers plan; direct static asset delivery remains free. Check the account's Workers limits before high traffic: on the free plan, exceeding the Worker request allowance returns HTTP 429 on these HTML paths, rather than falling back to static delivery.

## Stop the test or choose a winner

In `wrangler.json`, change `vars.REVIEW_CTA_MODE`, commit and push:

- `test`: run the 50/50 experiment.
- `A`: show the original design to everyone; no new experiment events.
- `B`: show the green button to everyone; no new experiment events.
- `off`: normal static home-page appearance (A), no experiment events.

Changing mode does not rewrite past results. For a different experiment, use a new experiment ID and cookie name so old assignments and results cannot mix. A static host without the Worker shows the original design and does not emit experiment events.

References: [Cloudflare same-URL A/B example](https://developers.cloudflare.com/workers/examples/ab-testing/), [asset routing](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/), [billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/), [GA4 event-scoped custom dimensions](https://support.google.com/analytics/answer/14239696).
