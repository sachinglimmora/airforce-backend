/**
 * Session Idle Timeout Middleware
 *
 * Tracks the last activity timestamp per authenticated user (keyed by JWT sub).
 * Rejects requests where the user has been idle longer than SESSION_TIMEOUT_MS.
 *
 * This is an in-memory store — sufficient for single-instance deployments.
 * For multi-instance / Redis deployments, swap `lastActivity` for a Redis client.
 */

const lastActivity = new Map(); // userId → timestamp (ms)

/**
 * Returns the configured idle timeout in milliseconds.
 * Reads SESSION_TIMEOUT_MINUTES from env (default: 30 min).
 */
function getTimeoutMs() {
  const minutes = parseInt(process.env.SESSION_TIMEOUT_MINUTES || '30', 10);
  return minutes * 60 * 1000;
}

/**
 * Middleware: must be placed AFTER the `authenticate` middleware so that
 * `req.user` is already populated.
 */
function sessionTimeout(req, res, next) {
  // Only enforce on authenticated requests
  if (!req.user || !req.user.id) return next();

  const userId = req.user.id;
  const now = Date.now();
  const timeoutMs = getTimeoutMs();
  const last = lastActivity.get(userId);

  if (last !== undefined && now - last > timeoutMs) {
    lastActivity.delete(userId);
    return res.status(401).json({
      error: 'Session expired due to inactivity. Please log in again.',
      code: 'SESSION_TIMEOUT',
    });
  }

  // Refresh activity timestamp on every valid request
  lastActivity.set(userId, now);
  next();
}

/**
 * Call this on logout or when forcibly expiring a session.
 */
function clearSession(userId) {
  lastActivity.delete(userId);
}

/**
 * Record activity explicitly (e.g. at login time before the middleware runs).
 */
function touchSession(userId) {
  lastActivity.set(userId, Date.now());
}

module.exports = { sessionTimeout, clearSession, touchSession };
