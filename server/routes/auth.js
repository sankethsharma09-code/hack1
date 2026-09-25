const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const dns = require('dns');
const { promisify } = require('util');
const resolveMx = promisify(dns.resolveMx);
const supabase = require('../utils/supabase');

const router = express.Router();

// ─── Validation schema (shared between signup and login) ──────────────────────
const authSchema = z.object({
  // .toLowerCase().trim() applied here so the stored/queried email is always
  // normalised — "Test@Test.COM" and "test@test.com" are the same account.
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email address')
    .transform((v) => v.toLowerCase().trim()),
  // .trim() so leading/trailing whitespace in a password field is removed
  // before bcrypt — otherwise "password " ≠ "password" on login.
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
    .transform((v) => v.trim()),
});

/**
 * Helper: run a DNS MX lookup with a hard timeout so a slow/unreachable DNS
 * server can't hang the signup request for 30+ seconds.
 */
async function verifyEmailDomain(email) {
  const domain = email.split('@')[1];
  const TIMEOUT_MS = 5000;

  const lookup = resolveMx(domain);
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('DNS timeout')), TIMEOUT_MS)
  );

  const mxRecords = await Promise.race([lookup, timeout]);
  if (!mxRecords || mxRecords.length === 0) {
    throw new Error('Email domain cannot receive emails');
  }
}

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    // Validate + normalise input (Zod throws ZodError on failure)
    const { email, password } = authSchema.parse(req.body);

    // Verify the email domain accepts mail — wrapped in try/catch so a DNS
    // failure returns a clean 400 rather than a 500.
    try {
      await verifyEmailDomain(email);
    } catch (dnsErr) {
      const msg =
        dnsErr.message === 'DNS timeout'
          ? 'Email domain verification timed out. Please try again.'
          : 'Invalid email domain. Please use a real email address.';
      return res.status(400).json({ error: msg });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user — email is already lowercased by Zod transform
    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert([{ email, password_hash: hashedPassword }])
      .select('id, email')
      .single();

    if (insertError) {
      // Postgres unique-violation code — email already registered
      if (insertError.code === '23505') {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }
      // Any other DB error is a server fault
      console.error('Signup DB error:', insertError);
      return res.status(500).json({ error: 'Failed to create account. Please try again.' });
    }

    if (!user) {
      // Supabase returned no error but also no row — should never happen, but guard anyway
      console.error('Signup: insert returned no user and no error');
      return res.status(500).json({ error: 'Failed to create account. Please try again.' });
    }

    // Sign JWT with the same secret and payload field used in auth middleware
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      // Return the first human-readable message instead of a raw array
      const message = err.errors[0]?.message || 'Invalid input';
      return res.status(400).json({ error: message });
    }
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    // Login uses the same Zod schema so email is normalised identically to
    // signup — the DB lookup will find the right row regardless of casing.
    const { email, password } = authSchema.parse(req.body);

    // Fetch user by normalised email
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, email, password_hash')
      .eq('email', email)
      .single();

    if (fetchError || !user) {
      // Don't reveal whether the email exists — use a generic message
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.password_hash) {
      // Guard: row exists but has no password hash — data integrity issue
      console.error('Login: user row has no password_hash', user.id);
      return res.status(500).json({ error: 'Account error. Please contact support.' });
    }

    // Compare supplied password against stored hash
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const message = err.errors[0]?.message || 'Invalid input';
      return res.status(400).json({ error: message });
    }
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
