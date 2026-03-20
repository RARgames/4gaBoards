const notificationsLabel = 'internal:4gaBoardsNotifications';

module.exports = async function isAuthenticated(req, res, proceed) {
  // Builtin authentication
  if (req.currentUser) {
    return proceed();
  }

  // API client authentication
  const clientIdHeader = req.get('X-Client-Id') || req.get('x-client-id');
  const clientSecretHeader = req.get('X-Client-Secret') || req.get('x-client-secret');
  const clientMailTokenHeader = req.get('X-Client-Mail-Token') || req.get('x-client-mail-token');

  if (clientIdHeader && clientSecretHeader) {
    let requiredPermission = '*';
    try {
      if (req.options && req.options.action) {
        requiredPermission = req.options.action.replace('/', '.');
      }
    } catch {
      requiredPermission = '*';
    }

    const apiClient = await sails.helpers.apiClients.verifyOne
      .with({
        clientId: clientIdHeader,
        clientSecret: clientSecretHeader,
        requiredPermission,
      })
      .tolerate('unauthorized');
    if (!apiClient) {
      return res.unauthorized('Invalid client credentials');
    }

    // Notifications API client authentication with mail token
    if (apiClient.label === notificationsLabel) {
      const mailToken = await MailToken.findOne({ token: clientMailTokenHeader });
      if (!mailToken) {
        return res.unauthorized('Invalid mail token');
      }
      const user = await User.findOne({ id: mailToken.userId, deletedAt: null });
      if (!user) {
        return res.unauthorized('Invalid mail token');
      }

      req.currentUser = user;
      req.apiClient = apiClient;
      return proceed();
    }

    // Default API client authentication
    const user = await User.findOne({ id: apiClient.userId, deletedAt: null });
    if (!user) {
      return res.unauthorized('Invalid client credentials');
    }

    req.currentUser = user;
    req.apiClient = apiClient;
    return proceed();
  }

  return res.unauthorized('Access token is missing, invalid or expired');
};
