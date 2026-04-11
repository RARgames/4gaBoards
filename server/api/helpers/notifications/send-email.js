const { getActivityTransProps } = require('@4gaboards/locales/renderer');

const { getActivityScopeLabelKey, getI18nextTranslator, getLocaleByLanguage, loadRendererModules } = require('../../../utils/activity-i18n');
const { buildFallbackActivityHtml, escapeHtml, renderLocalizedHtmlFromTransProps } = require('../../../utils/activity-rendering');
const { fetchRetry } = require('../../../utils/fetchRetry');

module.exports = {
  inputs: {
    notifications: {
      type: 'ref',
      required: true,
    },
    actionsMap: {
      type: 'ref',
      required: true,
    },
  },

  async fn({ notifications, actionsMap }) {
    const now = new Date().toUTCString();
    const beginningOfTime = new Date(0).toUTCString();

    let firstNotification;
    let firstAction;
    // eslint-disable-next-line no-restricted-syntax
    for (const notification of notifications) {
      const action = actionsMap[notification.actionId];
      if (!action) {
        // eslint-disable-next-line no-await-in-loop
        await Notification.update({ id: notification.id }).set({ deliveredAt: beginningOfTime });
      } else {
        firstNotification = notification;
        firstAction = action;
        break;
      }
    }
    if (!firstAction) return;

    const receiverUserId = firstNotification.userId;
    const user = await User.findOne({ id: receiverUserId });
    const userPrefs = await UserPrefs.findOne({ id: receiverUserId });

    let t = null;

    try {
      const rendererModules = await loadRendererModules();
      const locale = getLocaleByLanguage(rendererModules.locales, userPrefs?.language || 'en');
      const activityLocale = rendererModules.activityLocales[locale?.language] || rendererModules.activityLocales.en;

      if (activityLocale && locale?.language) {
        t = await getI18nextTranslator(locale.language, activityLocale);
      }
    } catch (error) {
      sails.log.warn('Failed to load localized activity renderer for notification emails:', error);
    }

    let { scope } = firstAction;
    if ([Action.Scopes.TASK, Action.Scopes.COMMENT, Action.Scopes.ATTACHMENT].includes(scope)) {
      scope = Action.Scopes.CARD;
    }
    const scopeNameField = `${scope}Name`;
    const scopeNameValue = firstAction.data[scopeNameField] || null;
    const localizedScope = t ? t(getActivityScopeLabelKey(scope, Action.Scopes)) : scope;
    const subject = `[${localizedScope.toUpperCase()}] ${scopeNameValue} | 4ga Boards Notifications (${sails.config.custom.instanceName})`;

    const baseClientUrl = sails.config.custom.clientUrl;
    const htmlBlocks = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const notification of notifications) {
      const action = actionsMap[notification.actionId];
      // eslint-disable-next-line no-continue
      if (!action) continue;

      // eslint-disable-next-line no-await-in-loop
      const actionUser = await User.findOne({ id: action.userId });
      htmlBlocks.push(`<p>From: <strong>${escapeHtml(actionUser.name)}</strong> (${escapeHtml(actionUser.username)})</p>`);

      if (t) {
        const transProps = getActivityTransProps(t, action);

        if (transProps) {
          const localizedHtml = renderLocalizedHtmlFromTransProps(t, transProps, action, baseClientUrl);

          if (localizedHtml) {
            htmlBlocks.push(`<p>&bull; ${localizedHtml}</p>`);
            // eslint-disable-next-line no-continue
            continue;
          }
        }
      }

      htmlBlocks.push(buildFallbackActivityHtml(action));
    }
    const htmlMessage = `<div>${htmlBlocks.join('\n')}</div>`;

    try {
      const url = `${process.env.NOTIFICATIONS_HOST_URL}/api/notifications/email`;
      const response = await fetchRetry(
        url,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.NOTIFICATIONS_CLIENT_ID}:${process.env.NOTIFICATIONS_CLIENT_SECRET}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            receiverUserId,
            receiverEmail: user.email,
            subject,
            message: htmlMessage,
          }),
        },
        3,
        1000,
      );

      const responseJson = await response.json();
      if (!response.ok || responseJson.status !== 'sent') {
        sails.log.error(`Failed to send notifications to user ${receiverUserId}:`, responseJson);
      }

      const ids = notifications.map((n) => n.id);
      await Notification.update({ id: ids }).set({ deliveredAt: now });
    } catch (err) {
      sails.log.error(`Failed to send notifications to user ${receiverUserId}:`, err);
    }
  },
};
