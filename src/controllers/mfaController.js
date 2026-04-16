/**
 * MFA Controller — TOTP-based Multi-Factor Authentication
 *
 * Flow:
 *  1. POST /api/auth/mfa/setup   — generate secret + return QR code URI
 *  2. POST /api/auth/mfa/verify  — confirm first TOTP token, enable MFA on account
 *  3. POST /api/auth/mfa/validate — called during login after password check
 *  4. POST /api/auth/mfa/disable  — disable MFA (requires current TOTP token)
 */

const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const User = require('../models/User');
const { touchSession } = require('../middleware/sessionTimeout');

const APP_NAME = process.env.MFA_ISSUER || 'IAF Training Platform';

// ── Setup: generate a new TOTP secret for the authenticated user ───────────────

async function setupMfa(req, res, next) {
  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.mfaEnabled) {
      return res.status(400).json({ error: 'MFA is already enabled for this account' });
    }

    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(user.email, APP_NAME, secret);
    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

    // Store the secret temporarily (not yet enabled — user must verify first)
    user.mfaSecret = secret;
    await user.save();

    res.json({
      secret,
      qrCode: qrCodeDataUrl,
      manualEntryKey: secret,
      message: 'Scan the QR code with your authenticator app, then call /mfa/verify with your first token.',
    });
  } catch (err) {
    next(err);
  }
}

// ── Verify: confirm first TOTP token and enable MFA ───────────────────────────

async function verifyMfa(req, res, next) {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'TOTP token is required' });

    const user = await User.findOne({ id: req.user.id });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.mfaSecret) return res.status(400).json({ error: 'MFA setup not initiated. Call /mfa/setup first.' });
    if (user.mfaEnabled) return res.status(400).json({ error: 'MFA is already enabled' });

    const isValid = authenticator.verify({ token, secret: user.mfaSecret });
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid TOTP token. Please try again.' });
    }

    user.mfaEnabled = true;
    await user.save();

    res.json({ message: 'MFA enabled successfully. Future logins will require a TOTP token.' });
  } catch (err) {
    next(err);
  }
}

// ── Validate: called during login to verify TOTP token ────────────────────────

async function validateMfa(req, res, next) {
  try {
    const { userId, token } = req.body;
    if (!userId || !token) {
      return res.status(400).json({ error: 'userId and token are required' });
    }

    const user = await User.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.mfaEnabled || !user.mfaSecret) {
      return res.status(400).json({ error: 'MFA is not enabled for this account' });
    }

    const isValid = authenticator.verify({ token, secret: user.mfaSecret });
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid TOTP token' });
    }

    // Touch the session (MFA validate counts as activity)
    touchSession(userId);

    res.json({ valid: true, message: 'MFA token verified successfully' });
  } catch (err) {
    next(err);
  }
}

// ── Disable: turn off MFA after confirming with a valid token ─────────────────

async function disableMfa(req, res, next) {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'TOTP token is required to disable MFA' });

    const user = await User.findOne({ id: req.user.id });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.mfaEnabled) return res.status(400).json({ error: 'MFA is not enabled' });

    const isValid = authenticator.verify({ token, secret: user.mfaSecret });
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid TOTP token. MFA not disabled.' });
    }

    user.mfaEnabled = false;
    user.mfaSecret = undefined;
    await user.save();

    res.json({ message: 'MFA disabled successfully' });
  } catch (err) {
    next(err);
  }
}

// ── Status: check MFA state for the current user ──────────────────────────────

async function getMfaStatus(req, res, next) {
  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ mfaEnabled: !!user.mfaEnabled });
  } catch (err) {
    next(err);
  }
}

module.exports = { setupMfa, verifyMfa, validateMfa, disableMfa, getMfaStatus };
