import test from 'node:test';
import assert from 'node:assert/strict';
import { PROJECT_STATUS, TENDER_STATUS, BID_STATUS, isValidTransition } from '../backend/src/constants/statuses.js';

test('Project Status Machine & State Transition Integrity (AUD-021)', async (t) => {
  await t.test('Defines all canonical project statuses', () => {
    assert.ok(PROJECT_STATUS.RECOMMENDED);
    assert.ok(PROJECT_STATUS.SANCTIONED);
    assert.ok(PROJECT_STATUS.UNDER_IMPLEMENTATION);
    assert.ok(PROJECT_STATUS.INSPECTION_REQUIRED);
    assert.ok(PROJECT_STATUS.COMPLETED);
  });

  await t.test('Permits valid operational transitions', () => {
    assert.equal(isValidTransition(PROJECT_STATUS.RECOMMENDED, PROJECT_STATUS.APPROVED), true);
    assert.equal(isValidTransition(PROJECT_STATUS.APPROVED, PROJECT_STATUS.SANCTIONED), true);
    assert.equal(isValidTransition(PROJECT_STATUS.SANCTIONED, PROJECT_STATUS.UNDER_IMPLEMENTATION), true);
    assert.equal(isValidTransition(PROJECT_STATUS.UNDER_IMPLEMENTATION, PROJECT_STATUS.INSPECTION_REQUIRED), true);
    assert.equal(isValidTransition(PROJECT_STATUS.INSPECTION_REQUIRED, PROJECT_STATUS.VERIFIED), true);
    assert.equal(isValidTransition(PROJECT_STATUS.VERIFIED, PROJECT_STATUS.COMPLETED), true);
  });

  await t.test('Permits self-transition (idempotency)', () => {
    assert.equal(isValidTransition(PROJECT_STATUS.SANCTIONED, PROJECT_STATUS.SANCTIONED), true);
  });

  await t.test('Rejects arbitrary jumps violating statutory stages', () => {
    // Cannot jump straight from recommended to completed
    assert.equal(isValidTransition(PROJECT_STATUS.RECOMMENDED, PROJECT_STATUS.COMPLETED), false);
    // Cannot jump from recommended to under implementation
    assert.equal(isValidTransition(PROJECT_STATUS.RECOMMENDED, PROJECT_STATUS.UNDER_IMPLEMENTATION), false);
    // Cannot transition out of terminal cancelled or rejected state
    assert.equal(isValidTransition(PROJECT_STATUS.CANCELLED, PROJECT_STATUS.UNDER_IMPLEMENTATION), false);
    assert.equal(isValidTransition(PROJECT_STATUS.REJECTED, PROJECT_STATUS.APPROVED), false);
  });
});
