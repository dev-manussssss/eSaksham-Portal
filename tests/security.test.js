import test from 'node:test';
import assert from 'node:assert/strict';
import { createSessionToken, parseSessionToken, SEEDED_ACCOUNTS } from '../backend/src/middleware/auth.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('Security & Authentication Hardening Tests (AUD-001, AUD-002, AUD-006, AUD-025)', async (t) => {
  await t.test('Session tokens are generated with expected claims and valid expiration', () => {
    const mpUser = SEEDED_ACCOUNTS['mp.bhopal@saksham.gov.in'];
    const token = createSessionToken(mpUser);
    assert.ok(token && typeof token === 'string');

    const decoded = parseSessionToken(token);
    assert.ok(decoded);
    assert.equal(decoded.sub, mpUser.id);
    assert.equal(decoded.email, mpUser.email);
    assert.equal(decoded.role, 'MP');
    assert.ok(decoded.exp > Date.now());
  });

  await t.test('parseSessionToken rejects malformed and altered tokens', () => {
    assert.equal(parseSessionToken('not-a-base64-token'), null);
    assert.equal(parseSessionToken(''), null);
    assert.equal(parseSessionToken(null), null);
    assert.equal(parseSessionToken('eyJmb28iOiJiYXIifQ'), null); // Missing exp
  });

  await t.test('POST /api/seed endpoint is permanently removed from backend routes (AUD-006)', () => {
    const indexSrc = fs.readFileSync(path.resolve(__dirname, '../backend/src/index.js'), 'utf8');
    assert.equal(
      indexSrc.includes("app.use('/api/seed") || indexSrc.includes("app.post('/api/seed"),
      false,
      'backend/src/index.js MUST NOT mount or expose /api/seed HTTP route'
    );
  });

  await t.test('Config has no hardcoded fallback API keys (AUD-001)', () => {
    const configSrc = fs.readFileSync(path.resolve(__dirname, '../backend/src/config.js'), 'utf8');
    assert.equal(
      configSrc.includes('gsk_pI282UypS4T27y'),
      false,
      'backend/src/config.js MUST NOT contain leaked Groq key'
    );
    assert.equal(
      configSrc.includes('sbp_033d4530bb'),
      false,
      'backend/src/config.js MUST NOT contain leaked Supabase key'
    );
  });
});
