module.exports = async function isApiClient(req, res, proceed) {
  const clientId = req.headers['x-client-id'];
  const clientSecret = req.headers['x-client-secret'];

  if (!clientId || !clientSecret) {
    return res.unauthorized('Missing client credentials');
  }

  try {
    await sails.helpers.auth.checkApiClient.with({
      clientId,
      clientSecret,
      requiredPermission: 'notifications:createCard',
    });

    return proceed();
  } catch {
    return res.unauthorized('Invalid client credentials or missing permission');
  }
};
