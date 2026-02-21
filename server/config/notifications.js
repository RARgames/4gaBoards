const { fetchRetryUntilAvailable } = require('../utils/fetchRetry');

async function setupNotifications() {
  if (!process.env.NOTIFICATIONS_HOST_URL || !process.env.NOTIFICATIONS_CLIENT_ID || !process.env.NOTIFICATIONS_CLIENT_SECRET) {
    return;
  }

  const notificationsHostURL = process.env.NOTIFICATIONS_HOST_URL;
  const notificationsSelfURL = `${notificationsHostURL}/api/clients/self`;
  const notificationsClientId = process.env.NOTIFICATIONS_CLIENT_ID;
  const notificationsClientSecret = process.env.NOTIFICATIONS_CLIENT_SECRET;
  const notificationsLabel = 'internal:4gaBoardsNotifications';

  try {
    sails.log.info(`Notifications: Connecting to notifications server: ${notificationsHostURL} and validating client configuration...`);
    let apiClient = await ApiClient.findOne({ label: notificationsLabel });
    if (!apiClient) {
      sails.log.info(`Notifications: API client not found, creating...`);
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
      sails.log.info(`Notifications: Server is ready but client is not configured`);
      await fetchRetryUntilAvailable(
        notificationsSelfURL,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${notificationsClientId}:${notificationsClientSecret}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            instance_url: 'http://localhost:1337',
            api_client_id: apiClient.clientId,
            api_client_secret: apiClient.clientSecret,
            version: apiClient.name,
          }),
        },
        4000,
      );
    }
    sails.config.custom.emailNotificationsAvailable = true;
    sails.log.info(`Notifications: Server is ready and client is configured successfully`);
  } catch (err) {
    sails.log.error('Notifications: Configuration failed:', err);
  }
}

module.exports = {
  setupNotifications,
};
