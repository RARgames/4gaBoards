const { createClient } = require('redis');

const { getRemoteAddress } = require('../../utils/remoteAddress');

const Errors = {
  TOO_MANY_UPLOAD_REQUESTS: {
    tooManyUploadRequests: 'Too many upload requests - Please try again later.',
  },
};

const counters = new Map();
let requestsSinceCleanup = 0;
let redisClient;
let redisInitPromise;

const getRedisClient = async () => {
  const { uploadRateLimit } = sails.config.custom;

  if (uploadRateLimit.store !== 'redis' || !uploadRateLimit.redisUrl) {
    return null;
  }

  if (redisClient?.isOpen) {
    return redisClient;
  }

  if (redisInitPromise && !redisClient?.isOpen) {
    redisInitPromise = null;
  }

  if (!redisInitPromise) {
    redisInitPromise = (async () => {
      const client = createClient({
        url: uploadRateLimit.redisUrl,
        socket: {
          connectTimeout: uploadRateLimit.redisConnectTimeoutMs,
        },
      });

      client.on('error', (error) => {
        sails.log.warn(`Upload rate-limit Redis client error: ${error.message}`);
      });

      await client.connect();
      redisClient = client;
      return redisClient;
    })().catch((error) => {
      sails.log.warn(`Upload rate-limit Redis unavailable, falling back to memory store: ${error.message}`);
      redisClient = null;
      redisInitPromise = null;
      return null;
    });
  }

  return redisInitPromise;
};

const cleanupExpiredCounters = (now) => {
  counters.forEach((value, key) => {
    if (value.resetAt <= now) {
      counters.delete(key);
    }
  });
};

module.exports = async function rateLimitUpload(req, res, proceed) {
  const { uploadRateLimit } = sails.config.custom;

  if (!uploadRateLimit.enabled) {
    return proceed();
  }

  const routeAction = req.options?.action || req.path;
  const remoteAddress = getRemoteAddress(req) || 'unknown';
  const userId = req.currentUser?.id || req.apiClient?.id || 'unknown';
  const key = `${routeAction}:${userId}:${remoteAddress}`;

  const client = await getRedisClient();
  if (client) {
    try {
      const redisKey = `${uploadRateLimit.keyPrefix}:${key}`;
      const count = await client.incr(redisKey);

      if (count === 1) {
        await client.pExpire(redisKey, uploadRateLimit.windowMs);
      }

      if (count > uploadRateLimit.maxAttempts) {
        sails.log.warn(`Upload rate limit exceeded! (IP: ${remoteAddress}, user: ${userId}, route: ${routeAction})`);

        return res.status(429).json({
          code: 'E_TOO_MANY_REQUESTS',
          message: 'tooManyUploadRequests',
          ...Errors.TOO_MANY_UPLOAD_REQUESTS,
        });
      }

      return proceed();
    } catch (error) {
      sails.log.warn(`Upload rate-limit Redis operation failed, falling back to memory store: ${error.message}`);
    }
  }

  const now = Date.now();
  const existing = counters.get(key);

  if (existing && existing.resetAt > now) {
    if (existing.count >= uploadRateLimit.maxAttempts) {
      sails.log.warn(`Upload rate limit exceeded! (IP: ${remoteAddress}, user: ${userId}, route: ${routeAction})`);

      return res.status(429).json({
        code: 'E_TOO_MANY_REQUESTS',
        message: 'tooManyUploadRequests',
        ...Errors.TOO_MANY_UPLOAD_REQUESTS,
      });
    }

    existing.count += 1;
  } else {
    counters.set(key, {
      count: 1,
      resetAt: now + uploadRateLimit.windowMs,
    });
  }

  requestsSinceCleanup += 1;
  if (requestsSinceCleanup % 256 === 0) {
    cleanupExpiredCounters(now);
  }

  return proceed();
};
