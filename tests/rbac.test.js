import test from 'node:test';
import assert from 'node:assert/strict';
import { ROLES, PERMISSIONS, canPerformAction } from '../backend/src/middleware/rbac.js';

test('RBAC Matrix & Permission Enforcement (AUD-002, AUD-008, AUD-025)', async (t) => {
  await t.test('Defines all 7 official role archetypes', () => {
    assert.equal(Object.keys(ROLES).length, 7);
    assert.ok(ROLES.MP);
    assert.ok(ROLES.DISTRICT_AUTHORITY);
    assert.ok(ROLES.IMPLEMENTING_AGENCY);
    assert.ok(ROLES.VENDOR);
    assert.ok(ROLES.INVESTIGATOR);
    assert.ok(ROLES.STATE_NODAL_AUTHORITY);
    assert.ok(ROLES.CENTRAL_NODAL_AGENCY);
  });

  await t.test('MP can recommend schemes but CANNOT sanction or disburse', () => {
    assert.equal(canPerformAction(ROLES.MP, 'RECOMMEND_PROJECT'), true);
    assert.equal(canPerformAction(ROLES.MP, 'SANCTION_PROJECT'), false);
    assert.equal(canPerformAction(ROLES.MP, 'APPROVE'), false);
    assert.equal(canPerformAction(ROLES.MP, 'DEACTIVATE_VENDOR'), false);
  });

  await t.test('District Authority has administrative sanction and freeze authority', () => {
    assert.equal(canPerformAction(ROLES.DISTRICT_AUTHORITY, 'SANCTION_PROJECT'), true);
    assert.equal(canPerformAction(ROLES.DISTRICT_AUTHORITY, 'PUT_ON_HOLD'), true);
    assert.equal(canPerformAction(ROLES.DISTRICT_AUTHORITY, 'CLEAR_HOLD'), true);
    assert.equal(canPerformAction(ROLES.DISTRICT_AUTHORITY, 'DEACTIVATE_VENDOR'), true);
  });

  await t.test('Vendor can submit bids but CANNOT evaluate bids or sanction projects', () => {
    assert.equal(canPerformAction(ROLES.VENDOR, 'SUBMIT_BID'), true);
    assert.equal(canPerformAction(ROLES.VENDOR, 'EVALUATE_BID'), false);
    assert.equal(canPerformAction(ROLES.VENDOR, 'SANCTION_PROJECT'), false);
    assert.equal(canPerformAction(ROLES.VENDOR, 'CREATE_TENDER'), false);
  });

  await t.test('Investigator / Vigilance has audit and verification powers', () => {
    assert.equal(canPerformAction(ROLES.INVESTIGATOR, 'VIEW_FULL_AUDIT'), true);
    assert.equal(canPerformAction(ROLES.INVESTIGATOR, 'REQUEST_VERIFICATION'), true);
    assert.equal(canPerformAction(ROLES.INVESTIGATOR, 'ADD_AUDIT_NOTE'), true);
    assert.equal(canPerformAction(ROLES.INVESTIGATOR, 'SANCTION_PROJECT'), false);
  });

  await t.test('Non-existent or null roles are completely denied', () => {
    assert.equal(canPerformAction(null, 'SANCTION_PROJECT'), false);
    assert.equal(canPerformAction(undefined, 'RECOMMEND_PROJECT'), false);
    assert.equal(canPerformAction('ANONYMOUS_HACKER', 'SUBMIT_BID'), false);
  });
});
