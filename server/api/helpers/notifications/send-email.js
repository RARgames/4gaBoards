const { getActivityTransProps } = require('@4gaboards/locales/renderer');
const { format } = require('date-fns');

const { getActivityScopeLabelKey, getI18nextTranslator, getLocaleByLanguage, loadRendererModules } = require('../../../utils/activity-i18n');
const { buildActionLinks, buildFallbackActivityHtml, escapeHtml, getNormalizedScope, renderLinkedStrong, renderLocalizedHtmlFromTransProps } = require('../../../utils/activity-rendering');

const resolveRelatedData = async (action) => {
  if (!action) {
    return null;
  }
  const scope = getNormalizedScope(action.scope);
  if (![Action.Scopes.CARD, Action.Scopes.LIST, Action.Scopes.BOARD].includes(scope)) {
    return null;
  }

  let list = null;
  let board = null;
  let project = null;

  if (scope === Action.Scopes.CARD && action.listId) {
    list = await List.findOne({ id: action.listId });
  }

  if ([Action.Scopes.CARD, Action.Scopes.LIST].includes(scope) && action.boardId) {
    board = await Board.findOne({ id: action.boardId });
  }

  if ([Action.Scopes.CARD, Action.Scopes.LIST, Action.Scopes.BOARD].includes(scope) && action.projectId) {
    project = await Project.findOne({ id: action.projectId });
  }

  return {
    listName: list?.name || null,
    boardName: board?.name || null,
    projectName: project?.name || null,
  };
};

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
    let user = await User.findOne({ id: receiverUserId });
    const userPrefs = await UserPrefs.findOne({ id: receiverUserId });

    let t = null;
    let locale = null;

    try {
      const rendererModules = await loadRendererModules();
      locale = getLocaleByLanguage(rendererModules.locales, userPrefs?.language || 'en');
      const activityLocale = rendererModules.activityLocales[locale?.language] || rendererModules.activityLocales.en;

      if (activityLocale && locale?.language) {
        t = await getI18nextTranslator(locale.language, activityLocale);
      }
    } catch (error) {
      sails.log.warn('Failed to load localized activity renderer for notification emails:', error);
    }

    const resolvedRelatedData = await resolveRelatedData(firstAction);
    const scope = getNormalizedScope(firstAction.scope);
    const relatedData = resolvedRelatedData || {};
    const scopeNameField = `${scope}Name`;
    const scopeNameValue = firstAction.data[scopeNameField] || null;
    const localizedScope = t ? t(getActivityScopeLabelKey(scope, Action.Scopes)) : scope;
    const relatedDataEntries = [
      { key: 'listName', labelKey: 'activity.list' },
      { key: 'boardName', labelKey: 'activity.board' },
      { key: 'projectName', labelKey: 'activity.project' },
    ]
      .filter(({ key }) => relatedData[key] != null)
      .map(({ key, labelKey }) => {
        const label = t ? t(labelKey) : labelKey.split('.').pop();
        return {
          label,
          value: relatedData[key],
        };
      });
    const relatedDataSubject = relatedDataEntries.map(({ value }) => value).join(' | ') || '';
    const subjectScope = `${localizedScope.toUpperCase()} ${relatedDataSubject}`.trim();
    const subject = `${scopeNameValue} [${subjectScope}] 4ga Boards Notifications (${sails.config.custom.instanceName})`;

    const baseClientUrl = sails.config.custom.clientUrl;
    const relatedDataLinks = buildActionLinks(firstAction, baseClientUrl);
    const htmlBlocks = [];
    const relatedDataParts = relatedDataEntries.map(({ label, value }) => {
      let renderedValue = renderLinkedStrong(value, null);

      if (label === (t ? t('activity.board') : 'board')) {
        renderedValue = renderLinkedStrong(value, relatedDataLinks.board);
      } else if (label === (t ? t('activity.project') : 'project')) {
        renderedValue = renderLinkedStrong(value, relatedDataLinks.project);
      }

      return `${escapeHtml(label)}: ${renderedValue}`;
    });
    const relatedDataHtml = relatedDataParts.length ? `<div>${relatedDataParts.join('<br>')}</div>` : null;
    if (relatedDataHtml) {
      htmlBlocks.push(relatedDataHtml);
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const notification of notifications) {
      const action = actionsMap[notification.actionId];
      // eslint-disable-next-line no-continue
      if (!action) continue;

      // eslint-disable-next-line no-await-in-loop
      const actionUser = await User.findOne({ id: action.userId });
      const createdAtDate = new Date(action.createdAt);
      let createdAt;
      if (Number.isNaN(createdAtDate.getTime())) {
        createdAt = String(action.createdAt);
      } else {
        try {
          createdAt = format(createdAtDate, 'dd.MM.yyyy HH:mm');
        } catch {
          createdAt = createdAtDate.toUTCString();
        }
      }

      htmlBlocks.push(`<p>From: <strong>${escapeHtml(actionUser.name)}</strong> (${escapeHtml(actionUser.username)}) <small><i>${escapeHtml(createdAt)}</i></small></p>`);

      let activityHtml = null;

      if (t) {
        const transProps = getActivityTransProps(t, action);

        if (transProps) {
          const localizedHtml = renderLocalizedHtmlFromTransProps(t, transProps, action, baseClientUrl);

          if (localizedHtml) {
            activityHtml = `<p>&bull; ${localizedHtml}</p>`;
          }
        }
      }

      htmlBlocks.push(activityHtml || buildFallbackActivityHtml(action));
    }
    const htmlMessage = `<div>${htmlBlocks.join('\n')}</div>`;
    const ids = notifications.map((n) => n.id);

    try {
      const url = `${process.env.NOTIFICATIONS_HOST_URL}/api/notifications/email`;
      const response = await fetch(url, {
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
      });

      const responseJson = await response.json();
      if (!response.ok || responseJson.status !== 'sent') {
        sails.log.error(`Failed to send notifications to user ${receiverUserId}:`, responseJson);

        if (response.status === 403 && responseJson.status === 'email_not_verified') {
          if (user?.isVerified) {
            user = await User.updateOne({ id: receiverUserId }).set({ isVerified: false });
            const adminIds = await sails.helpers.users.getAdminIds();
            const userIds = _.union([user.id], adminIds);

            userIds.forEach((userId) => {
              sails.sockets.broadcast(`user:${userId}`, 'userUpdate', {
                item: user,
              });
            });
          }

          await Notification.update({ id: ids }).set({ deliveredAt: now });
          return;
        }
      }

      await Notification.update({ id: ids }).set({ deliveredAt: now });
    } catch (err) {
      sails.log.error(`Failed to send notifications to user ${receiverUserId}:`, err);
    }
  },
};
