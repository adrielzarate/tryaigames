import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assignReviewVariant,
  REVIEW_EXPERIMENT_COOKIE as COOKIE,
  REVIEW_EXPERIMENT_ID,
  createReviewMeasurement,
  type ReviewExperiment,
} from "../src/lib/review-experiment.ts";

test("assignment splits at 50 percent and only trusts valid, exact cookies", () => {
  assert.equal(
    assignReviewVariant("", () => 0),
    "A",
  );
  assert.equal(
    assignReviewVariant("", () => 0.49999),
    "A",
  );
  assert.equal(
    assignReviewVariant("", () => 0.5),
    "B",
  );
  assert.equal(
    assignReviewVariant("", () => 0.99999),
    "B",
  );
  const fail = () => {
    throw new Error("must not reassign");
  };
  assert.equal(
    assignReviewVariant(`unrelated=1; ${COOKIE}=A; other=2`, fail),
    "A",
  );
  assert.equal(assignReviewVariant(`${COOKIE}=B`, fail), "B");
  for (const invalid of [
    `${COOKIE}=invalid`,
    `fake_${COOKIE}=A`,
    `${COOKIE}=A%3B`,
  ])
    assert.equal(
      assignReviewVariant(invalid, () => 0.75),
      "B",
    );
});
test("one exposure and one conversion despite repeated review opens", () => {
  const events: unknown[] = [];
  const measured = createReviewMeasurement(
    { id: REVIEW_EXPERIMENT_ID, variant: "B", active: true },
    (name, parameters) => events.push([name, parameters]),
  );
  measured.review(); // No conversion before the measured exposure / consent.
  measured.expose();
  measured.expose();
  measured.review();
  measured.review();
  assert.deepEqual(events, [
    [
      "experiment_exposure",
      { experiment_id: REVIEW_EXPERIMENT_ID, variant: "B" },
    ],
    [
      "review_conversion",
      { experiment_id: REVIEW_EXPERIMENT_ID, variant: "B" },
    ],
  ]);
});
test("static hosting and forced winners never enter the experiment report", () => {
  const cases: (ReviewExperiment | null)[] = [
    null,
    { id: REVIEW_EXPERIMENT_ID, variant: "A", active: false },
  ];
  for (const experiment of cases) {
    const measured = createReviewMeasurement(experiment, () =>
      assert.fail("unexpected event"),
    );
    measured.expose();
    measured.review();
  }
});
