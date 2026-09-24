import test from 'node:test';
import assert from 'node:assert/strict';
import { MPLADS_SECTORS, isValidSector } from '../backend/src/constants/sectors.js';

test('MPLADS Mandatory 12-Sector Classification Integrity', async (t) => {
  await t.test('Contains exactly 12 authoritative sectors per SIH/MoSPI Guidelines', () => {
    assert.equal(MPLADS_SECTORS.length, 12, 'Must have exactly 12 sectors');
  });

  await t.test('All 12 sectors are unique non-empty strings', () => {
    const unique = new Set(MPLADS_SECTORS);
    assert.equal(unique.size, 12);
    for (const s of MPLADS_SECTORS) {
      assert.ok(typeof s === 'string' && s.trim().length > 3);
    }
  });

  await t.test('isValidSector accepts all valid sectors', () => {
    for (const s of MPLADS_SECTORS) {
      assert.equal(isValidSector(s), true, `Should accept valid sector: ${s}`);
    }
  });

  await t.test('isValidSector rejects arbitrary, non-canonical, or fabricated sectors', () => {
    assert.equal(isValidSector('Random Construction'), false);
    assert.equal(isValidSector(''), false);
    assert.equal(isValidSector(null), false);
    assert.equal(isValidSector(undefined), false);
    assert.equal(isValidSector('Space Exploration'), false);
  });
});
