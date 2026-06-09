const attempts = new Map();

export const createFixedWindowRateLimit = ({
  windowMs = 15 * 60 * 1000,
  max = 20,
  keyGenerator,
  message = "Demasiados intentos. Intenta de nuevo mas tarde.",
} = {}) => {
  return (req, res, next) => {
    const key = keyGenerator ? keyGenerator(req) : req.ip;
    const now = Date.now();
    const current = attempts.get(key);

    if (!current || current.resetAt <= now) {
      attempts.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    current.count += 1;

    if (current.count > max) {
      const retryAfter = Math.ceil((current.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({
        success: false,
        message,
      });
    }

    next();
  };
};

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of attempts.entries()) {
    if (value.resetAt <= now) {
      attempts.delete(key);
    }
  }
}, 15 * 60 * 1000).unref();
