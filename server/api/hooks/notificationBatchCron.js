const cron = require('node-cron');
const _ = require('lodash');

module.exports = function NotificationBatchCronHook(sails) {
  return {
    initialize(cb) {
      sails.log.info('Initializing notification batch cron hook');

      const TEN_MINUTES = 10 * 60 * 1000;

      cron.schedule('*/2 * * * *', async () => {
        try {
          const pending = await NotificationBatchQueue.find({ sentAt: null });
          if (!pending.length) return;

          const grouped = _.groupBy(pending, (p) => `${p.userId}-${p.scope}`);

          // eslint-disable-next-line no-restricted-syntax
          for (const group of Object.values(grouped)) {
            const { userId, scope } = group[0];

            // eslint-disable-next-line no-await-in-loop
            const lastSent = await NotificationBatchQueue.find({
              userId,
              scope,
              sentAt: { '!=': null },
            })
              .sort('sentAt DESC')
              .limit(1);

            const now = new Date();
            if (!lastSent.length || now - new Date(lastSent[0].sentAt) >= TEN_MINUTES) {
              // eslint-disable-next-line no-restricted-syntax
              for (const item of group) {
                try {
                  // eslint-disable-next-line no-await-in-loop
                  const notification = await Notification.findOne({ id: item.notificationId });
                  // eslint-disable-next-line no-continue
                  if (!notification) continue;

                  // eslint-disable-next-line no-await-in-loop
                  const action = notification.actionId ? await Action.findOne({ id: notification.actionId }) : null;

                  // eslint-disable-next-line no-await-in-loop
                  await sails.helpers.notifications.handleEmailNotification.with({ notification, action });

                  // eslint-disable-next-line no-await-in-loop
                  await NotificationBatchQueue.update({ id: item.id }).set({ sentAt: now });
                } catch (err) {
                  sails.log.error('Failed to send notification:', err);
                }
              }
            }
          }
        } catch (err) {
          sails.log.error('Notification batch cron failed:', err);
        }
      });

      cb();
    },
  };
};
