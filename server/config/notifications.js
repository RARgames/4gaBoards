const { fetchRetryUntilAvailable } = require('../utils/fetchRetry');

async function setupNotifications() {
  if (!process.env.NOTIFICATIONS_HOST_URL || !process.env.NOTIFICATIONS_CLIENT_ID || !process.env.NOTIFICATIONS_CLIENT_SECRET || !process.env.MAIL_SERVICE_INBOUND_EMAIL || process.env.NODE_ENV === 'test') {
    return;
  }

  const notificationsHostURL = process.env.NOTIFICATIONS_HOST_URL;
  const notificationsSelfURL = `${notificationsHostURL}/api/clients/self`;
  const notificationsClientId = process.env.NOTIFICATIONS_CLIENT_ID;
  const notificationsClientSecret = process.env.NOTIFICATIONS_CLIENT_SECRET;
  const notificationsLabel = sails.config.custom.notificationsInternalApiClientLabel;
  const requiredPermissions = sails.config.custom.notificationsInternalApiClientPermissions;

  try {
    sails.log.info(`Notifications: Connecting to notifications server: ${notificationsHostURL} and validating client configuration...`);
    let apiClient = await ApiClient.findOne({ label: notificationsLabel, deletedAt: null });
    if (!apiClient) {
      sails.log.info(`Notifications: API client not found, creating...`);
      apiClient = await sails.helpers.apiClients.createOneInternal.with({ values: { label: notificationsLabel } });
    }
    const missingPermissions = requiredPermissions.filter((permission) => !apiClient.permissions?.includes(permission));
    if (missingPermissions.length > 0) {
      sails.log.info(`Notifications: Rotating internal API client to apply required permissions: ${missingPermissions.join(', ')}`);
      apiClient = await sails.helpers.apiClients.createOneInternal.with({ values: { label: notificationsLabel } });
    }

    const getRes = await fetchRetryUntilAvailable(
      notificationsSelfURL,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${notificationsClientId}:${notificationsClientSecret}`,
          Version: apiClient.name,
        },
      },
      4000,
    );
    const getResponse = await getRes.json();
    if (!getResponse.ready) {
      sails.log.info(`Notifications: Server is ready but client is not configured, generating API client...`);
      apiClient = await sails.helpers.apiClients.createOneInternal.with({ values: { label: notificationsLabel } });
      await fetchRetryUntilAvailable(
        notificationsSelfURL,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${notificationsClientId}:${notificationsClientSecret}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            instance_url: sails.config.custom.baseUrl,
            api_client_id: apiClient.clientId,
            api_client_secret: apiClient.clientSecret,
            version: apiClient.name,
          }),
        },
        4000,
      );
    }
    sails.config.custom.mailServiceAvailable = true;
    sails.log.info(`Notifications: Server is ready and client is configured successfully`);
  } catch (err) {
    sails.log.error('Notifications: Configuration failed:', err);
  }
}

module.exports = {
  setupNotifications,
};
