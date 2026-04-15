const { getRemoteAddress } = require('../../utils/remoteAddress');

const Errors = {
  TOO_MANY_FAILED_ATTEMPTS: {
    tooManyFailedAttempts: 'Too many failed attempts - Please try again later.',
  },
};

module.exports = async function rateLimitAuth(req, res, proceed) {
  const { authRateLimit } = sails.config.custom;

  if (!authRateLimit.enabled) {
    return proceed();
  }

  const emailOrUsername = req.body?.emailOrUsername || req.param('emailOrUsername');
  if (!emailOrUsername) {
    return proceed();
  }

  const remoteAddress = getRemoteAddress(req) || 'unknown';
  const attemptedIdentifier = emailOrUsername.trim().toLowerCase();
  const { windowMs } = authRateLimit;
  const { maxAttempts } = authRateLimit;

  const recentAttempts = await sails.helpers.failedAuths.getCount.with({
    attemptedIdentifier,
    remoteAddress,
    windowMs,
  });

  if (recentAttempts >= maxAttempts) {
    sails.log.warn(`Auth rate limit exceeded! (IP: ${remoteAddress})`);

    return res.status(429).json({
      code: 'E_TOO_MANY_REQUESTS',
      message: 'tooManyFailedAttempts',
      ...Errors.TOO_MANY_FAILED_ATTEMPTS,
    });
  }

  return proceed();
};
