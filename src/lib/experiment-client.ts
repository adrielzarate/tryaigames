import {
  REVIEW_EXPERIMENT_COOKIE,
  REVIEW_EXPERIMENT_ID,
  type ReviewExperiment,
} from "./review-experiment";

export function getReviewExperiment(): ReviewExperiment | null {
  const data = document.documentElement.dataset;
  if (
    data.reviewExperiment !== REVIEW_EXPERIMENT_ID ||
    !["A", "B"].includes(data.reviewVariant ?? "")
  )
    return null;
  return {
    id: REVIEW_EXPERIMENT_ID,
    variant: data.reviewVariant as "A" | "B",
    active: data.reviewTest === "true",
  };
}
export function rememberReviewVariant(experiment: ReviewExperiment | null) {
  if (!experiment?.active) {
    forgetReviewVariant();
    return;
  }
  // This optional cookie is written only after analytics consent, never at the edge.
  document.cookie = `${REVIEW_EXPERIMENT_COOKIE}=${experiment.variant}; Max-Age=15552000; Path=/; SameSite=Lax; Secure`;
}
export function forgetReviewVariant() {
  document.cookie = `${REVIEW_EXPERIMENT_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax; Secure`;
}
