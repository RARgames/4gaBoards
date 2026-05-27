const crypto = require('crypto');

const { fetchRetryUntilAvailable } = require('../utils/fetchRetry');

async function setupSystemNotifications() {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  try {
    const core = await Core.findOne({ id: 0 });
    if (!core) {
      sails.log.warn('SystemNotifications: Core record not found, skipping setup');
      return;
    }

    sails.log.info(`SystemNotifications: Registering instance (instanceId: ${core.instanceId})...`);

    const needsSystemNotificationResponsesKeyPair =
      !core.systemNotificationResponsesPublicKey ||
      !core.systemNotificationResponsesPrivateKey ||
      (() => {
        try {
          return crypto.createPrivateKey(core.systemNotificationResponsesPrivateKey).asymmetricKeyType !== 'ed25519';
        } catch {
          return true;
        }
      })();

    if (needsSystemNotificationResponsesKeyPair) {
      const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
        },
      });

      await Core.updateOne({ id: core.id }).set({
        systemNotificationResponsesPublicKey: publicKey,
        systemNotificationResponsesPrivateKey: privateKey,
      });
      sails.log.info('SystemNotifications: Generated system notification response key pair');
    }

    let ipAddress = null;
    try {
      const response = await fetch('https://api.ipify.org?format=json', { timeout: 5000 });
      const data = await response.json();
      ipAddress = data.ip || null;
    } catch {
      // IP address is optional
    }

    const data = {
      instanceId: core.instanceId || null,
      instanceUrl: sails.config.custom.baseUrl,
      redirectUrl: sails.config.custom.clientUrl,
      ipAddress,
      systemNotificationResponsesPublicKey: core.systemNotificationResponsesPublicKey,
    };

    const registerUrl = `${sails.config.custom.systemNotificationsHostUrl}/api/system-notifications/register`;
    const res = await fetchRetryUntilAvailable(
      registerUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
      4000,
    );

    const response = await res.json();
    const { instanceId, systemNotificationsPublicKey } = response;

    if (instanceId !== core.instanceId) {
      await Core.updateOne({ id: 0 }).set({ instanceId });
      sails.log.info(`SystemNotifications: Updated instanceId: ${response.instanceId}`);
    }
    if (systemNotificationsPublicKey !== core.systemNotificationsPublicKey) {
      try {
        crypto.createPublicKey(systemNotificationsPublicKey);
        await Core.updateOne({ id: 0 }).set({ systemNotificationsPublicKey });
        sails.log.info('SystemNotifications: Updated system notifications public key');
      } catch {
        sails.log.warn('SystemNotifications: Ignoring invalid system notifications public key');
      }
    }

    sails.log.info('SystemNotifications: Registered successfully');
  } catch (err) {
    sails.log.error('SystemNotifications: Setup failed:', err);
  }
}

module.exports = {
  setupSystemNotifications,
};
