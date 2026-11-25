import test from "node:test";
import assert from "node:assert/strict";
import { submissionIdentity } from "../src/home/inquirySubmission.js";

test("uncertain retries reuse a random identity, edits and confirmed-new submissions do not", () => {
  let sequence = 0;
  const createKey = () => `random-${++sequence}`;
  const first = submissionIdentity(null, 'first payload', createKey);
  assert.equal(submissionIdentity(first, 'first payload', createKey), first);
  assert.notEqual(submissionIdentity(first, 'edited payload', createKey).key, first.key);
  assert.notEqual(submissionIdentity(null, 'first payload', createKey).key, first.key);
  assert.equal(sequence, 3);
});
