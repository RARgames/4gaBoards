const { fetchRetry } = require('../../../utils/fetchRetry');

const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isPlainObject(value.user)) {
    return false;
  }

  if (!_.isString(value.reason)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      custom: valuesValidator,
      required: true,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { user, reason, prevUserEmail } = inputs.values;

    if (!sails.config.custom.mailServiceAvailable) {
      sails.log.warn(`Email verification request skipped for user ${user.id}: notifications server is not configured`);
      return;
    }

    const hostUrl = process.env.NOTIFICATIONS_HOST_URL;
    const clientId = process.env.NOTIFICATIONS_CLIENT_ID;
    const clientSecret = process.env.NOTIFICATIONS_CLIENT_SECRET;
    const url = `${hostUrl}/api/notifications/email-verification/request`;

    try {
      const response = await fetchRetry(
        url,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${clientId}:${clientSecret}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            userEmail: user.email,
            reason,
            prevUserEmail,
          }),
        },
        3,
        1000,
      );

      if (!response.ok) {
        sails.log.error(`Verification request failed with status ${response.status}`);
      }
    } catch (error) {
      sails.log.error(`Failed to request email verification for user ${user.id}:`, error);
    }
  },
};
