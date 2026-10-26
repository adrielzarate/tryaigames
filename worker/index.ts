import {
  assignReviewVariant,
  REVIEW_EXPERIMENT_ID,
} from "../src/lib/review-experiment";

interface Env {
  ASSETS: Fetcher;
  REVIEW_CTA_MODE?: "test" | "A" | "B" | "off";
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (
      !["/", "/index.html"].includes(url.pathname) ||
      !["GET", "HEAD"].includes(request.method)
    )
      return env.ASSETS.fetch(request);
    const response = await env.ASSETS.fetch(request);
    if (
      response.status !== 200 ||
      !response.headers.get("Content-Type")?.includes("text/html")
    )
      return response;
    const mode = env.REVIEW_CTA_MODE ?? "off";
    if (!["test", "A", "B"].includes(mode)) return response;
    const variant =
      mode === "test"
        ? assignReviewVariant(request.headers.get("Cookie") ?? "", () => {
            const value = crypto.getRandomValues(new Uint32Array(1))[0];
            return value / 4294967296;
          })
        : mode;
    const personalized = new Response(response.body, response);
    // The asset cache may share the base HTML, but must never share a visitor's variant.
    personalized.headers.set("Cache-Control", "private, no-store");
    personalized.headers.delete("ETag");
    personalized.headers.delete("Last-Modified");
    personalized.headers.delete("Content-Length");
    return new HTMLRewriter()
      .on("html", {
        element(element) {
          element.setAttribute("data-review-experiment", REVIEW_EXPERIMENT_ID);
          element.setAttribute("data-review-variant", variant);
          element.setAttribute("data-review-test", String(mode === "test"));
        },
      })
      .transform(personalized);
  },
} satisfies ExportedHandler<Env>;
