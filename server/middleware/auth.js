const jwt = require('jsonwebtoken');

/**
 * Auth middleware — verifies the Bearer JWT on every protected route.
 *
 * Distinct error cases:
 *   • No / malformed header  → 401 "Authorization header required"
 *   • Token is present but expired → 401 "Token has expired"
 *   • Token is present but invalid (tampered/wrong secret) → 401 "Invalid token"
 *   • Token decoded but userId is missing (corrupt payload) → 401 "Invalid token payload"
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header required (Bearer <token>)' });
  }

  const token = authHeader.split(' ')[1];

  // Edge case: "Bearer " with nothing after it
  if (!token) {
    return res.status(401).json({ error: 'Authorization token is empty' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Guard: the payload MUST contain a userId — if it's missing the token is
    // corrupt and we must not let the request proceed with undefined as the user id.
    if (!decoded.userId) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    req.userId = decoded.userId;
    next();
  } catch (err) {
    // jwt.verify throws typed errors — give the client a useful distinction
    // without leaking internal details.
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired. Please log in again.' });
    }
    // JsonWebTokenError, NotBeforeError, or anything else → generic invalid
    return res.status(401).json({ error: 'Invalid token. Please log in again.' });
  }
};

module.exports = authMiddleware;
