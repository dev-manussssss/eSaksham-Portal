import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFlag, ALLOWED_FLAG_CODES, RISK_SEVERITY } from '../backend/src/constants/taxonomy.js';

test('Risk Engine & Taxonomy Sanitization (AUD-023, AUD-025)', async (t) => {
  await t.test('Sanitizes and maps valid flag correctly', () => {
    const rawFlag = {
      flag_code: 'MB_EXCEEDS_BOQ',
      severity: RISK_SEVERITY.HIGH,
      title: 'Excavation quantity exceeds approved BOQ',
      explanation: 'Item 2.1 recorded 450 m3 against BOQ limit of 300 m3.',
      recommended_action: 'REQUEST_VERIFICATION',
      primary_evidence: { item_no: '2.1', excess_qty: 150 },
    };

    const sanitized = validateFlag(rawFlag);
    assert.ok(sanitized);
    assert.equal(sanitized.flag_code, 'MB_EXCEEDS_BOQ');
    assert.equal(sanitized.severity, 'HIGH');
    assert.equal(sanitized.title, 'Excavation quantity exceeds approved BOQ');
    assert.equal(sanitized.primary_evidence.item_no, '2.1');
  });

  await t.test('Falls back gracefully on arbitrary AI hallucinated flag codes', () => {
    const rawFlag = {
      flag_code: 'MYSTERIOUS_AI_HALLUCINATION',
      severity: 'SUPER_EXTREME_RISK',
      title: 'Strange occurrence',
    };

    const sanitized = validateFlag(rawFlag);
    assert.ok(sanitized);
    assert.equal(sanitized.flag_code, 'GENERAL_INSPECTION_DEFICIENCY');
    assert.equal(sanitized.severity, 'MEDIUM');
  });

  await t.test('Handles null or malformed inputs without crashing', () => {
    assert.equal(validateFlag(null), null);
    assert.equal(validateFlag('not an object'), null);
    assert.equal(validateFlag(undefined), null);
  });
});
