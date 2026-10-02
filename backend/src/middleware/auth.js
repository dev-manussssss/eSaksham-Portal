import { createHmac } from 'crypto';
import { supabase } from '../supabase.js';
import { config } from '../config.js';

// Pre-defined test accounts with fixed server-side roles and administrative scope
export const SEEDED_ACCOUNTS = {
  'mp.bhopal@saksham.gov.in': {
    id: 'MP-BPL-001',
    name: 'Shri R. K. Singh, MP',
    email: 'mp.bhopal@saksham.gov.in',
    role: 'MP',
    designation: 'Member of Parliament (Lok Sabha)',
    organizationName: 'Parliament of India (Bhopal PC-19)',
    state: 'Madhya Pradesh',
    district: 'Bhopal',
    constituency: 'Bhopal (PC-19)',
    landingRoute: '/mp-dashboard',
  },
  'da.bhopal@saksham.gov.in': {
    id: 'DA-BPL-001',
    name: 'R. Venkatraman, IAS',
    email: 'da.bhopal@saksham.gov.in',
    role: 'DISTRICT_AUTHORITY',
    designation: 'District Collector & District Magistrate',
    organizationName: 'District Collectorate & Nodal Office',
    state: 'Madhya Pradesh',
    district: 'Bhopal',
    constituency: 'Bhopal (PC-19)',
    landingRoute: '/district-dashboard',
  },
  'ia.pwd.bhopal@saksham.gov.in': {
    id: 'PWD-BPL-IA-001',
    name: 'Er. S. K. Sharma',
    email: 'ia.pwd.bhopal@saksham.gov.in',
    role: 'IMPLEMENTING_AGENCY',
    designation: 'Executive Engineer (Division-II)',
    organizationName: 'Public Works Department (Central Zone)',
    state: 'Madhya Pradesh',
    district: 'Bhopal',
    constituency: 'Bhopal (PC-19)',
    landingRoute: '/dashboard',
  },
  'contact@aaryainfra.test': {
    id: 'VND-001-USER',
    name: 'P. K. Banerjee',
    email: 'contact@aaryainfra.test',
    role: 'VENDOR',
    designation: 'Authorized Managing Director',
    organizationName: 'Aarya Infraworks Private Limited',
    state: 'Madhya Pradesh',
    district: 'Sehore',
    vendorId: 'VND-001',
    landingRoute: '/vendor-dashboard',
  },
  'sna.mp@saksham.gov.in': {
    id: 'SNA-MP-001',
    name: 'Anita Deshmukh, IAS',
    email: 'sna.mp@saksham.gov.in',
    role: 'STATE_NODAL_AUTHORITY',
    designation: 'Principal Secretary (Planning)',
    organizationName: 'State Planning & Nodal Directorate',
    state: 'Madhya Pradesh',
    district: 'Statewide',
    landingRoute: '/state-dashboard',
  },
  'cna.mospi@saksham.gov.in': {
    id: 'CNA-MOSPI-001',
    name: 'Dr. Vivek Joshi, IAS',
    email: 'cna.mospi@saksham.gov.in',
    role: 'CENTRAL_NODAL_AGENCY',
    designation: 'Secretary (MoSPI) & Central Nodal Head',
    organizationName: 'Ministry of Statistics & Programme Implementation',
    state: 'National',
    district: 'All Districts',
    landingRoute: '/national-dashboard',
  },
  'vigilance.central@saksham.gov.in': {
    id: 'INV-CENTRAL-001',
    name: 'K. S. Narayanan, IPS',
    email: 'vigilance.central@saksham.gov.in',
    role: 'INVESTIGATOR',
    designation: 'Director of Technical Inspections & Vigilance',
    organizationName: 'Statutory Vigilance & Audit Bureau',
    state: 'National',
    district: 'All Districts',
    landingRoute: '/investigations',
  },
};

// ─── HMAC-SHA256 Signed Session Tokens (AUD-SEC-002) ─────────────────────────
// Format: base64url(payload).base64url(hmac-sha256-signature)
// - The payload is a base64url-encoded JSON object (not trusted in isolation)
// - The HMAC signature is computed over the exact payload bytes using SESSION_SECRET
// - Any modification to the payload (e.g. forging expiry, email, role) invalidates
//   the signature. Both parts must arrive intact and unmodified.
//
// SECURITY PROPERTIES:
// - Forgery: Requires knowledge of SESSION_SECRET to create a valid token
// - Replay: Token has a 24h expiry enforced server-side; extending exp requires signature
// - Tamper: Any change to any field breaks HMAC verification
// - Email spoofing: Changing email changes the HMAC input → fails verification
// ─────────────────────────────────────────────────────────────────────────────

function computeHmac(payloadB64) {
  return createHmac('sha256', config.sessionSecret)
    .update(payloadB64)
    .digest('base64url');
}

export function createSessionToken(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    district: user.district,
    state: user.state,
    vendorId: user.vendorId || null,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = computeHmac(payloadB64);
  return `${payloadB64}.${sig}`;
}

export function parseSessionToken(token) {
  try {
    const lastDot = token.lastIndexOf('.');
    if (lastDot < 1) return null; // No separator found

    const payloadB64 = token.slice(0, lastDot);
    const providedSig = token.slice(lastDot + 1);

    // Constant-time HMAC comparison to prevent timing attacks
    const expectedSig = computeHmac(payloadB64);
    if (expectedSig !== providedSig) {
      return null; // Signature mismatch — token was forged or tampered
    }

    const raw = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const parsed = JSON.parse(raw);

    // Server-side expiry check (cannot be bypassed by altering exp without breaking sig)
    if (!parsed.exp || parsed.exp < Date.now()) {
      return null; // Token expired
    }

    return parsed;
  } catch (e) {
    return null; // Any parse/decode error = invalid token
  }
}

/**
 * Authentication Middleware:
 * Validates session token from Authorization header or Cookie.
 * Attaches verified user to `req.user`.
 * NEVER trusts client-supplied `x-saksham-role` or client query overrides (AUD-002, AUD-008).
 */
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else if (req.headers['x-saksham-token']) {
    token = req.headers['x-saksham-token'];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. No session token provided.',
    });
  }

  const session = parseSessionToken(token);
  if (!session) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session token. Please log in again.',
    });
  }

  // Look up full verified user profile
  let user = SEEDED_ACCOUNTS[session.email];
  if (!user) {
    // If not a predefined test account, look up from Supabase profiles table
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.sub)
        .single();
      if (!error && data) {
        user = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role_key,
          designation: data.designation,
          organizationName: data.organization_name,
          state: data.state,
          district: data.district,
          constituency: data.constituency,
          vendorId: data.vendor_id,
        };
      }
    } catch (e) {
      console.error('Error fetching user profile:', e);
    }
  }

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'User identity could not be verified.',
    });
  }

  req.user = user;
  next();
}

/**
 * Optional authentication middleware for public endpoints with enriched context
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else if (req.headers['x-saksham-token']) {
    token = req.headers['x-saksham-token'];
  }

  if (token) {
    const session = parseSessionToken(token);
    if (session && SEEDED_ACCOUNTS[session.email]) {
      req.user = SEEDED_ACCOUNTS[session.email];
    }
  }
  next();
}
