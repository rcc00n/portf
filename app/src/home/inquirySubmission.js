// Random submission identity, retained for retries until confirmed acceptance.
// The payload comparison only detects edits; it is never the idempotency key.
export function submissionIdentity(previous, body, createKey = () => crypto.randomUUID()) {
  return previous?.body === body ? previous : { body, key: createKey() };
}

export const unconfirmedInquiry = "We couldn’t confirm your submission. Your details are still here. Please retry or email us below.";
