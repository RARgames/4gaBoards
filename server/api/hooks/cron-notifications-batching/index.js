/* eslint-disable no-await-in-loop */
const _ = require('lodash');
const cron = require('node-cron');

module.exports = function defineCronNotificationsBatchingHook(sails) {
  return {
    initialize(cb) {
      sails.log.info('Initializing custom hook: cron-notifications-batching');
      const cronSchedule = process.env.NODE_ENV === 'production' ? '*/5 * * * *' : '*/1 * * * *';
      cron.schedule(cronSchedule, async () => {
        try {
          const pending = await Notification.find({ deliveredAt: null });
          if (!pending.length) return;

          const grouped = _.groupBy(pending, (p) => {
            const isChildScope = [Action.Scopes.TASK, Action.Scopes.COMMENT, Action.Scopes.ATTACHMENT].includes(p.scope);
            const normalizedScope = isChildScope ? Action.Scopes.CARD : p.scope;
            const id = isChildScope ? p.cardId : p[`${p.scope}Id`];
            return `${p.userId}-${normalizedScope}-${id}`;
          });
          const now = new Date();

          // eslint-disable-next-line no-restricted-syntax
          for (const group of Object.values(grouped)) {
            const { userId, scope } = group[0];
            let scopeIdField = `${scope}Id`;
            if ([Action.Scopes.TASK, Action.Scopes.COMMENT, Action.Scopes.ATTACHMENT].includes(scope)) {
              scopeIdField = 'cardId';
            }
            const scopeIdValue = group[0][scopeIdField] || null;

            const lastSent = await sails.helpers.notifications.findLastSent.with({
              criteria: {
                userId,
                [scopeIdField]: scopeIdValue,
                deliveredAt: { '!=': null },
              },
            });

            if (!lastSent.length || now - new Date(lastSent[0].deliveredAt) >= sails.config.custom.notificationsMailBatchIntervalMs) {
              const notificationIds = sails.helpers.utils.mapRecords(group, 'id');
              const notifications = await Notification.find({ id: notificationIds });

              const actionIds = sails.helpers.utils.mapRecords(notifications, 'actionId');
              const actions = await Action.find({ id: actionIds });
              const actionsMap = Object.fromEntries(actions.map((a) => [a.id, a]));

              await sails.helpers.notifications.sendEmail.with({
                notifications,
                actionsMap,
              });
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
