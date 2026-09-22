import assert from "node:assert/strict";
import test from "node:test";
import { detectOpportunity, scoreLead } from "../lib/services/lead-scoring.ts";

test("scores a business without a website as a website opportunity", () => {
  const result = scoreLead({ businessType: "barber shop", requestedType: "barbershops", instagram: false, website: false });
  assert.equal(result.opportunity, "website");
  assert.ok(result.score >= 45);
  assert.ok(result.reasons.includes("No public website listed"));
});

test("detects booking opportunity for service businesses without booking", () => {
  assert.equal(detectOpportunity({ businessType: "salon", website: true, analysis: { hasBooking: false } as never }), "booking_system");
});

test("detects online ordering opportunity for restaurants", () => {
  assert.equal(detectOpportunity({ businessType: "restaurant", website: true, analysis: { hasBooking: true, hasOnlineOrdering: false, hasEcommerce: false, hasContactForm: true } as never }), "online_ordering");
});
