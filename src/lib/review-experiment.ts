export const REVIEW_EXPERIMENT_ID = "review-cta-v1";
export const REVIEW_EXPERIMENT_COOKIE = "tryaigames_review_cta_v1";
export type ReviewVariant = "A" | "B";
export interface ReviewExperiment {
  id: typeof REVIEW_EXPERIMENT_ID;
  variant: ReviewVariant;
  active: boolean;
}
// Only the exact cookie name and valid variants can affect assignment.
export function assignReviewVariant(
  cookieHeader: string,
  random: () => number,
): ReviewVariant {
  const saved = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${REVIEW_EXPERIMENT_COOKIE}=`))
    ?.slice(REVIEW_EXPERIMENT_COOKIE.length + 1);
  return saved === "A" || saved === "B" ? saved : random() < 0.5 ? "A" : "B";
}
export function experimentParameters(
  experiment: ReviewExperiment | null,
): Record<string, string | number> {
  return experiment?.active
    ? { experiment_id: experiment.id, variant: experiment.variant }
    : {};
}
// One denominator and at most one conversion per measured page load.
export function createReviewMeasurement(
  experiment: ReviewExperiment | null,
  send: (name: string, parameters: Record<string, string | number>) => void,
) {
  let exposed = false;
  let converted = false;
  const parameters = experimentParameters(experiment);
  return {
    expose() {
      if (!experiment?.active || exposed) return;
      exposed = true;
      send("experiment_exposure", parameters);
    },
    review() {
      if (!experiment?.active || !exposed || converted) return;
      converted = true;
      send("review_conversion", parameters);
    },
  };
}
