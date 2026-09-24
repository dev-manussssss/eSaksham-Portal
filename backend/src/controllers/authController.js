import { SEEDED_ACCOUNTS, createSessionToken } from '../middleware/auth.js';
import { supabase } from '../supabase.js';

export async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please enter your registered official email and password.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check predefined test accounts
    const testUser = SEEDED_ACCOUNTS[cleanEmail];
    if (testUser) {
      // In development/test mode, standard test password 'Demopass@2026' or 'Saksham@2026'
      if (password !== 'Demopass@2026' && password !== 'Saksham@2026' && password !== 'Admin@123') {
        return res.status(401).json({
          success: false,
          error: 'Invalid password. For official test accounts, verify your authorized credentials.',
        });
      }

      const token = createSessionToken(testUser);

      // Audit login
      try {
        await supabase.from('audit_logs').insert({
          actor_id: testUser.id,
          role: testUser.role,
          action: 'AUTH_LOGIN',
          entity_type: 'AUTH',
          entity_id: testUser.id,
          comment: `Successful login for ${testUser.name} (${testUser.role})`,
        });
      } catch (err) {
        // Log silently
      }

      return res.json({
        success: true,
        token,
        user: testUser,
      });
    }

    // Dynamic database profiles lookup
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', cleanEmail)
      .single();

    if (error || !profile) {
      return res.status(401).json({
        success: false,
        error: 'Account not found. Please contact the district nodal administration.',
      });
    }

    const roleRoutes = {
      MP: '/mp-dashboard',
      DISTRICT_AUTHORITY: '/district-dashboard',
      IMPLEMENTING_AGENCY: '/dashboard',
      VENDOR: '/vendor-dashboard',
      STATE_NODAL_AUTHORITY: '/state-dashboard',
      CENTRAL_NODAL_AGENCY: '/national-dashboard',
      INVESTIGATOR: '/investigations',
    };

    const user = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role_key,
      designation: profile.designation,
      organizationName: profile.organization_name,
      state: profile.state,
      district: profile.district,
      constituency: profile.constituency,
      vendorId: profile.vendor_id,
      landingRoute: roleRoutes[profile.role_key] || '/district-dashboard',
    };

    const token = createSessionToken(user);
    return res.json({
      success: true,
      token,
      user,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Internal server error during authentication.' });
  }
}

export function me(req, res) {
  res.json({
    success: true,
    user: req.user,
  });
}

export function logout(req, res) {
  // Stateless token clearance
  res.json({
    success: true,
    message: 'Session successfully terminated.',
  });
}
