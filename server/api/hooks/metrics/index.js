const client = require('prom-client');
const cookie = require('cookie');
const http = require('http');

const METRICS_PORT = 1338;

module.exports = function defineMetricsHook(sails) {
  if (!sails.config.custom.metricsEnabled) {
    return {
      initialize(done) {
        return done();
      },
    };
  }

  return {
    async initialize(done) {
      sails.log.info('Initializing custom hook: prometheus-metrics');

      const register = new client.Registry();
      register.setDefaultLabels({ app: '4gaBoards' });
      client.collectDefaultMetrics({ register });

      const server = http.createServer(async (req, res) => {
        if (req.url === '/metrics') {
          try {
            res.setHeader('Content-Type', register.contentType);
            res.end(await register.metrics());
          } catch (error) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain');
            res.end(`Error: Failed to get metrics\n${error.message}`);
          }
        } else {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/plain');
          res.end('Not Found');
        }
      });

      server.listen(METRICS_PORT, () => {
        sails.log.info(`Metrics server running on port ${METRICS_PORT}`);
      });

      const httpRequests = new client.Counter({
        name: 'http_requests_total',
        help: 'Total HTTP requests',
        labelNames: ['method', 'route', 'status'],
      });

      const httpDuration = new client.Histogram({
        name: 'http_request_duration_seconds',
        help: 'Duration of HTTP requests in seconds',
        labelNames: ['method', 'route', 'status'],
        buckets: [0.1, 0.3, 0.5, 1, 2, 5, 10, 30],
      });

      const connectedSockets = new client.Gauge({
        name: 'connected_sockets_total',
        help: 'Number of currently connected sockets',
      });

      const connectedSessions = new client.Gauge({
        name: 'connected_sessions_total',
        help: 'Number of currently connected sessions',
      });

      const connectedUsers = new client.Gauge({
        name: 'connected_users',
        help: 'Number of currently connected users',
      });

      register.registerMetric(httpRequests);
      register.registerMetric(httpDuration);
      register.registerMetric(connectedSockets);
      register.registerMetric(connectedSessions);
      register.registerMetric(connectedUsers);

      // eslint-disable-next-line no-param-reassign
      sails.metrics = {
        register,
        httpRequests,
        httpDuration,
        connectedSockets,
        connectedSessions,
        connectedUsers,
      };

      // eslint-disable-next-line no-param-reassign
      sails.activeSockets = new Map();

      sails.on('router:before', () => {
        sails.router.bind('/*', async function metricsMiddleware(req, res, next) {
          const endTimer = httpDuration.startTimer();

          res.on('finish', () => {
            httpRequests.inc({
              method: req.method,
              route: req.route ? req.route.path : req.path,
              status: res.statusCode,
            });
            endTimer({
              method: req.method,
              route: req.route ? req.route.path : req.path,
              status: res.statusCode,
            });
          });

          return next();
        });
      });

      sails.after('hook:sockets:loaded', () => {
        sails.io.on('connection', async (socket) => {
          const cookies = cookie.parse(socket.handshake.headers.cookie || '');
          const { accessToken } = cookies;
          if (accessToken) {
            let currentUser = null;
            currentUser = await sails.helpers.utils.getUser(accessToken);
            if (currentUser) {
              sails.activeSockets.set(socket.id, { accessToken, userId: currentUser.id });
              const uniqueAccessTokens = new Set([...sails.activeSockets.values()].map((s) => s.accessToken));
              const uniqueUserIds = new Set([...sails.activeSockets.values()].map((s) => s.userId));
              sails.metrics.connectedSockets.set(sails.activeSockets.size);
              sails.metrics.connectedSessions.set(uniqueAccessTokens.size);
              sails.metrics.connectedUsers.set(uniqueUserIds.size);
            }
          }
          socket.on('disconnect', async () => {
            if (accessToken) {
              let currentUser = null;
              currentUser = await sails.helpers.utils.getUser(accessToken);
              if (currentUser) {
                sails.activeSockets.delete(socket.id);
                const uniqueAccessTokens = new Set([...sails.activeSockets.values()].map((s) => s.accessToken));
                const uniqueUserIds = new Set([...sails.activeSockets.values()].map((s) => s.userId));
                sails.metrics.connectedSockets.set(sails.activeSockets.size);
                sails.metrics.connectedSessions.set(uniqueAccessTokens.size);
                sails.metrics.connectedUsers.set(uniqueUserIds.size);
              }
            }
          });
        });
      });

      done();
    },
  };
};
