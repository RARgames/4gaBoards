import { ActivityScopes, ActivityTypes } from '@4gaboards/enums';
import { getTimerState, formatTimerActivities, truncateIf } from '@4gaboards/utils';

function buildContext(t, activity, flags) {
  const { boardNameTruncateLength = 30, cardNameTruncateLength = 30, commentTruncateLength = 30, defaultTruncateLength = 30, descriptionTruncateLength = 30, hideBoardDetails = false, hideCardDetails = false, hideLabelDetails = false, hideListDetails = false, hideProjectDetails = false, isDescriptionTruncated = false, isTruncated = false, listNameTruncateLength = 30, projectNameTruncateLength = 30, taskNameTruncateLength = 30, userNameTruncateLength = 30 } = flags;

  const cardName = activity.data?.cardName || activity.card?.name;
  const cardNameTruncated = truncateIf(cardName, isTruncated, cardNameTruncateLength);

  const listName = activity.data?.listName || activity.list?.name;
  const listNameTruncated = truncateIf(listName, isTruncated, listNameTruncateLength);

  const boardName = activity.data?.boardName || activity.board?.name;
  const boardNameTruncated = truncateIf(boardName, isTruncated, boardNameTruncateLength);

  const projectName = activity.data?.projectName || activity.project?.name;
  const projectNameTruncated = truncateIf(projectName, isTruncated, projectNameTruncateLength);

  const userName = activity.data?.userName;
  const userNameTruncated = truncateIf(userName, isTruncated, userNameTruncateLength);

  return {
    t,
    activity,
    hideBoardDetails,
    hideCardDetails,
    hideLabelDetails,
    hideListDetails,
    hideProjectDetails,
    cardName,
    cardNameTruncated,
    listName,
    listNameTruncated,
    boardName,
    boardNameTruncated,
    projectName,
    projectNameTruncated,
    userName,
    userNameTruncated,
    isTruncated,
    isDescriptionTruncated,
    truncateLengths: {
      boardName: boardNameTruncateLength,
      cardName: cardNameTruncateLength,
      comment: commentTruncateLength,
      default: defaultTruncateLength,
      description: descriptionTruncateLength,
      listName: listNameTruncateLength,
      projectName: projectNameTruncateLength,
      taskName: taskNameTruncateLength,
      userName: userNameTruncateLength,
    },
  };
}

export const activityRenderSpec = {
  [ActivityScopes.CARD]: {
    [ActivityTypes.CARD_CREATE]: (ctx) => {
      const { isCreatedViaApi, mailCreatorAddress } = ctx.activity.data;
      const mailCreatorAddressTruncated = truncateIf(mailCreatorAddress, ctx.isTruncated, ctx.truncateLengths.default);

      return {
        key: ctx.hideCardDetails ? 'activity.cardCreateShort' : 'activity.cardCreate',
        values: {
          card: ctx.cardNameTruncated,
          list: ctx.listNameTruncated,
          // eslint-disable-next-line no-nested-ternary
          viaApi: isCreatedViaApi ? (mailCreatorAddress ? ctx.t('activity.viaApiWithEmail', { mail: mailCreatorAddressTruncated }) : ctx.t('activity.viaApi')) : undefined,
        },
        components: [
          { slot: 'card', title: ctx.cardName },
          { slot: 'list', title: ctx.listName },
          { slot: 'mail', title: mailCreatorAddress },
        ],
      };
    },

    [ActivityTypes.CARD_DUPLICATE]: (ctx) => {
      return {
        key: ctx.hideCardDetails ? 'activity.cardDuplicateShort' : 'activity.cardDuplicate',
        values: {
          card: ctx.cardNameTruncated,
          list: ctx.listNameTruncated,
        },
        components: [
          { slot: 'card', title: ctx.cardName },
          { slot: 'list', title: ctx.listName },
        ],
      };
    },

    [ActivityTypes.CARD_UPDATE]: (ctx) => {
      const { data } = ctx.activity;

      if (data.cardPrevName) {
        const prevCardNameTruncated = truncateIf(data.cardPrevName, ctx.isTruncated, ctx.truncateLengths.cardName);

        return {
          key: ctx.hideCardDetails ? 'activity.cardUpdateNameShort' : 'activity.cardUpdateName',
          values: {
            prevCard: prevCardNameTruncated,
            card: ctx.cardNameTruncated,
          },
          components: [
            { slot: 'prevCard', title: data.cardPrevName },
            { slot: 'card', title: ctx.cardName },
          ],
        };
      }

      if (data.cardDescription !== undefined) {
        const prevDescriptionTruncated = truncateIf(data.cardPrevDescription, ctx.isTruncated || ctx.isDescriptionTruncated, ctx.truncateLengths.description);
        const descriptionTruncated = truncateIf(data.cardDescription, ctx.isTruncated || ctx.isDescriptionTruncated, ctx.truncateLengths.description);

        let key;
        if (data.cardPrevDescription !== null && data.cardDescription !== null) {
          key = ctx.hideCardDetails ? 'activity.cardUpdateDescriptionShort' : 'activity.cardUpdateDescription';
        } else if (data.cardPrevDescription === null && data.cardDescription !== null) {
          key = ctx.hideCardDetails ? 'activity.cardUpdateDescriptionAddShort' : 'activity.cardUpdateDescriptionAdd';
        } else if (data.cardPrevDescription !== null && data.cardDescription === null) {
          key = ctx.hideCardDetails ? 'activity.cardUpdateDescriptionRemoveShort' : 'activity.cardUpdateDescriptionRemove';
        }

        return {
          key,
          values: {
            card: ctx.cardNameTruncated,
            description: descriptionTruncated,
            prevDescription: prevDescriptionTruncated,
          },
          components: [
            { slot: 'card', title: ctx.cardName },
            { slot: 'description', title: data.cardDescription },
            { slot: 'prevDescription', title: data.cardPrevDescription },
          ],
        };
      }

      if (data.cardDueDate !== undefined) {
        let key;
        if (data.cardPrevDueDate !== null && data.cardDueDate !== null) {
          key = ctx.hideCardDetails ? 'activity.cardUpdateDueDateShort' : 'activity.cardUpdateDueDate';
        } else if (data.cardPrevDueDate === null && data.cardDueDate !== null) {
          key = ctx.hideCardDetails ? 'activity.cardUpdateDueDateAddShort' : 'activity.cardUpdateDueDateAdd';
        } else if (data.cardPrevDueDate !== null && data.cardDueDate === null) {
          key = ctx.hideCardDetails ? 'activity.cardUpdateDueDateRemoveShort' : 'activity.cardUpdateDueDateRemove';
        }

        return {
          key,
          values: {
            card: ctx.cardNameTruncated,
            dueDate: ctx.t('format:date', { value: data.cardDueDate, postProcess: 'formatDate' }),
            prevDueDate: ctx.t('format:date', { value: data.cardPrevDueDate, postProcess: 'formatDate' }),
          },
          components: [
            { slot: 'card', title: ctx.cardName },
            { slot: 'dueDate', title: ctx.t('format:dateTime', { postProcess: 'formatDate', value: data.cardDueDate }) },
            { slot: 'prevDueDate', title: ctx.t('format:dateTime', { postProcess: 'formatDate', value: data.cardPrevDueDate }) },
          ],
        };
      }

      if (data.cardTimer !== undefined) {
        const state = getTimerState(data.cardPrevTimer, data.cardTimer);
        let key;
        switch (state) {
          case 'start':
            key = ctx.hideCardDetails ? 'activity.cardUpdateTimerStartShort' : 'activity.cardUpdateTimerStart';
            break;
          case 'stop':
            key = ctx.hideCardDetails ? 'activity.cardUpdateTimerStopShort' : 'activity.cardUpdateTimerStop';
            break;
          case 'edit':
            key = ctx.hideCardDetails ? 'activity.cardUpdateTimerEditShort' : 'activity.cardUpdateTimerEdit';
            break;
          case 'add':
            key = ctx.hideCardDetails ? 'activity.cardUpdateTimerAddShort' : 'activity.cardUpdateTimerAdd';
            break;
          case 'remove':
            key = ctx.hideCardDetails ? 'activity.cardUpdateTimerRemoveShort' : 'activity.cardUpdateTimerRemove';
            break;
          default:
            return null;
        }

        return {
          key,
          values: {
            card: ctx.cardNameTruncated,
            timer: formatTimerActivities({ startedAt: data.cardTimer?.startedAt, total: data.cardTimer?.total }),
            prevTimer: formatTimerActivities({ startedAt: data.cardPrevTimer?.startedAt, total: data.cardPrevTimer?.total }),
          },
          components: [
            { slot: 'card', title: ctx.cardName },
            { slot: 'timer', title: '' },
            { slot: 'prevTimer', title: '' },
          ],
        };
      }

      if (data.cardCoverAttachmentName !== undefined) {
        const coverAttachmentTruncated = truncateIf(data.cardCoverAttachmentName, ctx.isTruncated, ctx.truncateLengths.default);
        const prevCoverAttachmentTruncated = truncateIf(data.cardPrevCoverAttachmentName, ctx.isTruncated, ctx.truncateLengths.default);

        let key;
        if (data.cardPrevCoverAttachmentName !== null && data.cardCoverAttachmentName !== null) {
          key = ctx.hideCardDetails ? 'activity.cardUpdateCoverAttachmentShort' : 'activity.cardUpdateCoverAttachment';
        } else if (data.cardPrevCoverAttachmentName === null && data.cardCoverAttachmentName !== null) {
          key = ctx.hideCardDetails ? 'activity.cardUpdateCoverAttachmentAddShort' : 'activity.cardUpdateCoverAttachmentAdd';
        } else if (data.cardPrevCoverAttachmentName !== null && data.cardCoverAttachmentName === null) {
          key = ctx.hideCardDetails ? 'activity.cardUpdateCoverAttachmentRemoveShort' : 'activity.cardUpdateCoverAttachmentRemove';
        }

        return {
          key,
          values: {
            card: ctx.cardNameTruncated,
            coverAttachment: coverAttachmentTruncated,
            prevCoverAttachment: prevCoverAttachmentTruncated,
          },
          components: [
            { slot: 'card', title: ctx.cardName },
            { slot: 'coverAttachment', title: data.cardCoverAttachmentName },
            { slot: 'prevCoverAttachment', title: data.cardPrevCoverAttachmentName },
          ],
        };
      }

      if (data.cardPosition !== undefined) {
        return {
          key: ctx.hideCardDetails ? 'activity.cardUpdatePositionShort' : 'activity.cardUpdatePosition',
          values: {
            card: ctx.cardNameTruncated,
            list: ctx.listNameTruncated,
          },
          components: [
            { slot: 'card', title: ctx.cardName },
            { slot: 'list', title: ctx.listName },
          ],
        };
      }

      return null;
    },

    [ActivityTypes.CARD_MOVE]: (ctx) => {
      const { listFromName, listToName } = ctx.activity.data;
      const fromListNameTruncated = truncateIf(listFromName, ctx.isTruncated, ctx.truncateLengths.listName);
      const toListNameTruncated = truncateIf(listToName, ctx.isTruncated, ctx.truncateLengths.listName);

      return {
        key: ctx.hideCardDetails ? 'activity.cardMoveShort' : 'activity.cardMove',
        values: {
          card: ctx.cardNameTruncated,
          fromList: fromListNameTruncated,
          toList: toListNameTruncated,
        },
        components: [
          { slot: 'card', title: ctx.cardName },
          { slot: 'fromList', title: listFromName },
          { slot: 'toList', title: listToName },
        ],
      };
    },

    [ActivityTypes.CARD_TRANSFER]: (ctx) => {
      const { boardFromName, boardToName, listFromName, listToName, projectFromId, projectFromName, projectToId, projectToName } = ctx.activity.data;
      const fromListNameTruncated = truncateIf(listFromName, ctx.isTruncated, ctx.truncateLengths.listName);
      const toListNameTruncated = truncateIf(listToName, ctx.isTruncated, ctx.truncateLengths.listName);
      const fromBoardNameTruncated = truncateIf(boardFromName, ctx.isTruncated, ctx.truncateLengths.boardName);
      const toBoardNameTruncated = truncateIf(boardToName, ctx.isTruncated, ctx.truncateLengths.boardName);
      const fromProjectNameTruncated = truncateIf(projectFromName, ctx.isTruncated, ctx.truncateLengths.projectName);
      const toProjectNameTruncated = truncateIf(projectToName, ctx.isTruncated, ctx.truncateLengths.projectName);
      let key;

      if (projectFromId !== projectToId) {
        key = ctx.hideCardDetails ? 'activity.cardTransferProjectShort' : 'activity.cardTransferProject';
      } else {
        key = ctx.hideCardDetails ? 'activity.cardTransferBoardShort' : 'activity.cardTransferBoard';
      }

      return {
        key,
        values: {
          card: ctx.cardNameTruncated,
          fromList: fromListNameTruncated,
          fromBoard: fromBoardNameTruncated,
          toList: toListNameTruncated,
          toBoard: toBoardNameTruncated,
          fromProject: fromProjectNameTruncated,
          toProject: toProjectNameTruncated,
        },
        components: [
          { slot: 'card', title: ctx.cardName },
          { slot: 'fromList', title: listFromName },
          { slot: 'fromBoard', title: boardFromName },
          { slot: 'toList', title: listToName },
          { slot: 'toBoard', title: boardToName },
          { slot: 'fromProject', title: projectFromName },
          { slot: 'toProject', title: projectToName },
        ],
      };
    },
    [ActivityTypes.CARD_DELETE]: (ctx) => {
      return {
        key: ctx.hideCardDetails ? 'activity.cardDeleteShort' : 'activity.cardDelete',
        values: {
          card: ctx.cardNameTruncated,
          list: ctx.listNameTruncated,
        },
        components: [
          { slot: 'card', title: ctx.cardName },
          { slot: 'list', title: ctx.listName },
        ],
      };
    },

    [ActivityTypes.CARD_USER_ADD]: (ctx) => {
      return {
        key: ctx.hideCardDetails ? 'activity.cardUserAddShort' : 'activity.cardUserAdd',
        values: {
          card: ctx.cardNameTruncated,
          user: ctx.userNameTruncated,
        },
        components: [
          { slot: 'card', title: ctx.cardName },
          { slot: 'user', title: ctx.userName },
        ],
      };
    },

    [ActivityTypes.CARD_USER_REMOVE]: (ctx) => {
      return {
        key: ctx.hideCardDetails ? 'activity.cardUserRemoveShort' : 'activity.cardUserRemove',
        values: {
          card: ctx.cardNameTruncated,
          user: ctx.userNameTruncated,
        },
        components: [
          { slot: 'card', title: ctx.cardName },
          { slot: 'user', title: ctx.userName },
        ],
      };
    },

    [ActivityTypes.CARD_LABEL_ADD]: (ctx) => {
      const { labelName } = ctx.activity.data;
      const labelNameTruncated = truncateIf(labelName, ctx.isTruncated, ctx.truncateLengths.default);

      return {
        key: ctx.hideCardDetails ? 'activity.cardLabelAddShort' : 'activity.cardLabelAdd',
        values: {
          card: ctx.cardNameTruncated,
          label: labelNameTruncated,
        },
        components: [
          { slot: 'card', title: ctx.cardName },
          { slot: 'label', title: labelName },
        ],
      };
    },

    [ActivityTypes.CARD_LABEL_REMOVE]: (ctx) => {
      const { labelName } = ctx.activity.data;
      const labelNameTruncated = truncateIf(labelName, ctx.isTruncated, ctx.truncateLengths.default);

      return {
        key: ctx.hideCardDetails ? 'activity.cardLabelRemoveShort' : 'activity.cardLabelRemove',
        values: {
          card: ctx.cardNameTruncated,
          label: labelNameTruncated,
        },
        components: [
          { slot: 'card', title: ctx.cardName },
          { slot: 'label', title: labelName },
        ],
      };
    },
  },

  [ActivityScopes.TASK]: {
    [ActivityTypes.CARD_TASK_CREATE]: (ctx) => {
      const { taskName } = ctx.activity.data;
      const taskNameTruncated = truncateIf(taskName, ctx.isTruncated, ctx.truncateLengths.taskName);

      return {
        key: ctx.hideCardDetails ? 'activity.cardTaskCreateShort' : 'activity.cardTaskCreate',
        values: {
          card: ctx.cardNameTruncated,
          task: taskNameTruncated,
        },
        components: [
          { slot: 'card', title: ctx.cardName },
          { slot: 'task', title: taskName },
        ],
      };
    },

    [ActivityTypes.CARD_TASK_UPDATE]: (ctx) => {
      const { data } = ctx.activity;
      const { taskName } = data;
      const taskNameTruncated = truncateIf(taskName, ctx.isTruncated, ctx.truncateLengths.taskName);

      if (data.taskPrevName) {
        const { taskPrevName } = data;
        const taskPrevNameTruncated = truncateIf(taskPrevName, ctx.isTruncated, ctx.truncateLengths.taskName);

        return {
          key: ctx.hideCardDetails ? 'activity.cardTaskUpdateNameShort' : 'activity.cardTaskUpdateName',
          values: {
            card: ctx.cardNameTruncated,
            prevTask: taskPrevNameTruncated,
            task: taskNameTruncated,
          },
          components: [
            { slot: 'card', title: ctx.cardName },
            { slot: 'prevTask', title: taskPrevName },
            { slot: 'task', title: taskName },
          ],
        };
      }

      if (data.taskIsCompleted !== undefined) {
        return {
          key: ctx.hideCardDetails ? 'activity.cardTaskUpdateIsCompletedShort' : 'activity.cardTaskUpdateIsCompleted',
          values: {
            card: ctx.cardNameTruncated,
            task: taskNameTruncated,
            isCompleted: data.taskIsCompleted ? ctx.t('activity.cardTaskCompleted') : ctx.t('activity.cardTaskUncompleted'),
          },
          components: [
            { slot: 'card', title: ctx.cardName },
            { slot: 'task', title: taskName },
            { slot: 'isCompleted', title: '' },
          ],
        };
      }

      if (data.taskDueDate !== undefined) {
        const { taskPrevDueDate, taskDueDate } = data;
        let key;
        if (taskPrevDueDate !== null && taskDueDate !== null) {
          key = ctx.hideCardDetails ? 'activity.cardTaskUpdateDueDateShort' : 'activity.cardTaskUpdateDueDate';
        } else if (taskPrevDueDate === null && taskDueDate !== null) {
          key = ctx.hideCardDetails ? 'activity.cardTaskUpdateDueDateAddShort' : 'activity.cardTaskUpdateDueDateAdd';
        } else if (taskPrevDueDate !== null && taskDueDate === null) {
          key = ctx.hideCardDetails ? 'activity.cardTaskUpdateDueDateRemoveShort' : 'activity.cardTaskUpdateDueDateRemove';
        }

        return {
          key,
          values: {
            card: ctx.cardNameTruncated,
            task: taskNameTruncated,
            dueDate: ctx.t('format:date', { value: taskDueDate, postProcess: 'formatDate' }),
            prevDueDate: ctx.t('format:date', { value: taskPrevDueDate, postProcess: 'formatDate' }),
          },
          components: [
            { slot: 'card', title: ctx.cardName },
            { slot: 'task', title: taskName },
            { slot: 'dueDate', title: ctx.t('format:dateTime', { postProcess: 'formatDate', value: taskDueDate }) },
            { slot: 'prevDueDate', title: ctx.t('format:dateTime', { postProcess: 'formatDate', value: taskPrevDueDate }) },
          ],
        };
      }

      return null;
    },

    [ActivityTypes.CARD_TASK_DUPLICATE]: (ctx) => {
      const { taskName } = ctx.activity.data;
      const taskNameTruncated = truncateIf(taskName, ctx.isTruncated, ctx.truncateLengths.taskName);

      return {
        key: ctx.hideCardDetails ? 'activity.cardTaskDuplicateShort' : 'activity.cardTaskDuplicate',
        values: {
          card: ctx.cardNameTruncated,
          task: taskNameTruncated,
        },
        components: [
          { slot: 'card', title: ctx.cardName },
          { slot: 'task', title: taskName },
        ],
      };
    },

    [ActivityTypes.CARD_TASK_MOVE]: (ctx) => {
      const { taskName } = ctx.activity.data;
      const taskNameTruncated = truncateIf(taskName, ctx.isTruncated, ctx.truncateLengths.taskName);

      return {
        key: ctx.hideCardDetails ? 'activity.cardTaskMoveShort' : 'activity.cardTaskMove',
        values: {
          card: ctx.cardNameTruncated,
          task: taskNameTruncated,
        },
        components: [
          { slot: 'card', title: ctx.cardName },
          { slot: 'task', title: taskName },
        ],
      };
    },

    [ActivityTypes.CARD_TASK_DELETE]: (ctx) => {
      const { taskName } = ctx.activity.data;
      const taskNameTruncated = truncateIf(taskName, ctx.isTruncated, ctx.truncateLengths.taskName);

      return {
        key: ctx.hideCardDetails ? 'activity.cardTaskDeleteShort' : 'activity.cardTaskDelete',
        values: {
          card: ctx.cardNameTruncated,
          task: taskNameTruncated,
        },
        components: [
          { slot: 'card', title: ctx.cardName },
          { slot: 'task', title: taskName },
        ],
      };
    },

    [ActivityTypes.CARD_TASK_USER_ADD]: (ctx) => {
      const { taskName } = ctx.activity.data;
      const taskNameTruncated = truncateIf(taskName, ctx.isTruncated, ctx.truncateLengths.taskName);

      return {
        key: ctx.hideCardDetails ? 'activity.cardTaskUserAddShort' : 'activity.cardTaskUserAdd',
        values: {
          card: ctx.cardNameTruncated,
          task: taskNameTruncated,
          user: ctx.userNameTruncated,
        },
        components: [
          { slot: 'card', title: ctx.cardName },
          { slot: 'task', title: taskName },
          { slot: 'user', title: ctx.userName },
        ],
      };
    },

    [ActivityTypes.CARD_TASK_USER_REMOVE]: (ctx) => {
      const { taskName } = ctx.activity.data;
      const taskNameTruncated = truncateIf(taskName, ctx.isTruncated, ctx.truncateLengths.taskName);

      return {
        key: ctx.hideCardDetails ? 'activity.cardTaskUserRemoveShort' : 'activity.cardTaskUserRemove',
        values: {
          card: ctx.cardNameTruncated,
          task: taskNameTruncated,
          user: ctx.userNameTruncated,
        },
        components: [
          { slot: 'card', title: ctx.cardName },
          { slot: 'task', title: taskName },
          { slot: 'user', title: ctx.userName },
        ],
      };
    },
  },

  [ActivityScopes.COMMENT]: {
    [ActivityTypes.CARD_COMMENT_CREATE]: (ctx) => {
      const { commentText } = ctx.activity.data;
      const commentTextTruncated = truncateIf(commentText, ctx.isTruncated, ctx.truncateLengths.comment);

      return {
        key: ctx.hideCardDetails ? 'activity.cardCommentCreateShort' : 'activity.cardCommentCreate',
        values: {
          comment: commentTextTruncated,
          card: ctx.cardNameTruncated,
        },
        components: [
          { slot: 'card', title: ctx.cardName },
          { slot: 'comment', title: commentText },
        ],
      };
    },

    [ActivityTypes.CARD_COMMENT_UPDATE]: (ctx) => {
      const { commentPrevText, commentText, userId } = ctx.activity.data;
      const prevCardCommentTruncated = truncateIf(commentPrevText, ctx.isTruncated, ctx.truncateLengths.comment);
      const cardCommentTruncated = truncateIf(commentText, ctx.isTruncated, ctx.truncateLengths.comment);

      let key;
      if (ctx.activity.userId === userId) {
        key = ctx.hideCardDetails ? 'activity.cardCommentUpdateOwnShort' : 'activity.cardCommentUpdateOwn';
      } else {
        key = ctx.hideCardDetails ? 'activity.cardCommentUpdateShort' : 'activity.cardCommentUpdate';
      }

      return {
        key,
        values: {
          prevComment: prevCardCommentTruncated,
          comment: cardCommentTruncated,
          card: ctx.cardNameTruncated,
          user: ctx.userNameTruncated,
        },
        components: [
          { slot: 'card', title: ctx.cardName },
          { slot: 'prevComment', title: commentPrevText },
          { slot: 'comment', title: commentText },
          { slot: 'user', title: ctx.userName },
        ],
      };
    },

    [ActivityTypes.CARD_COMMENT_DELETE]: (ctx) => {
      const { commentText } = ctx.activity.data;
      const cardCommentTruncated = truncateIf(commentText, ctx.isTruncated, ctx.truncateLengths.comment);

      return {
        key: ctx.hideCardDetails ? 'activity.cardCommentDeleteShort' : 'activity.cardCommentDelete',
        values: {
          comment: cardCommentTruncated,
          card: ctx.cardNameTruncated,
          user: ctx.userNameTruncated,
        },
        components: [
          { slot: 'card', title: ctx.cardName },
          { slot: 'comment', title: commentText },
          { slot: 'user', title: ctx.userName },
        ],
      };
    },
  },

  [ActivityScopes.ATTACHMENT]: {
    [ActivityTypes.CARD_ATTACHMENT_CREATE]: (ctx) => {
      const { attachmentName } = ctx.activity.data;
      const attachmentNameTruncated = truncateIf(attachmentName, ctx.isTruncated, ctx.truncateLengths.default);

      return {
        key: ctx.hideCardDetails ? 'activity.cardAttachmentCreateShort' : 'activity.cardAttachmentCreate',
        values: {
          card: ctx.cardNameTruncated,
          attachment: attachmentNameTruncated,
        },
        components: [
          { slot: 'card', title: ctx.cardName },
          { slot: 'attachment', title: attachmentName },
        ],
      };
    },

    [ActivityTypes.CARD_ATTACHMENT_UPDATE]: (ctx) => {
      const { attachmentPrevName, attachmentName } = ctx.activity.data;
      const attachmentPrevNameTruncated = truncateIf(attachmentPrevName, ctx.isTruncated, ctx.truncateLengths.default);
      const attachmentNameTruncated = truncateIf(attachmentName, ctx.isTruncated, ctx.truncateLengths.default);

      return {
        key: ctx.hideCardDetails ? 'activity.cardAttachmentUpdateShort' : 'activity.cardAttachmentUpdate',
        values: {
          card: ctx.cardNameTruncated,
          prevAttachment: attachmentPrevNameTruncated,
          attachment: attachmentNameTruncated,
        },
        components: [
          { slot: 'card', title: ctx.cardName },
          { slot: 'prevAttachment', title: attachmentPrevName },
          { slot: 'attachment', title: attachmentName },
        ],
      };
    },

    [ActivityTypes.CARD_ATTACHMENT_DELETE]: (ctx) => {
      const { attachmentName } = ctx.activity.data;
      const attachmentNameTruncated = truncateIf(attachmentName, ctx.isTruncated, ctx.truncateLengths.default);

      return {
        key: ctx.hideCardDetails ? 'activity.cardAttachmentDeleteShort' : 'activity.cardAttachmentDelete',
        values: {
          card: ctx.cardNameTruncated,
          attachment: attachmentNameTruncated,
        },
        components: [
          { slot: 'card', title: ctx.cardName },
          { slot: 'attachment', title: attachmentName },
        ],
      };
    },
  },

  [ActivityScopes.LIST]: {
    [ActivityTypes.LIST_CREATE]: (ctx) => {
      return {
        key: ctx.hideListDetails ? 'activity.listCreateShort' : 'activity.listCreate',
        values: {
          list: ctx.listNameTruncated,
          board: ctx.boardNameTruncated,
        },
        components: [
          { slot: 'list', title: ctx.listName },
          { slot: 'board', title: ctx.boardName },
        ],
      };
    },

    [ActivityTypes.LIST_UPDATE]: (ctx) => {
      if (ctx.activity.data.listPrevName) {
        const { listPrevName } = ctx.activity.data;
        const prevListNameTruncated = truncateIf(listPrevName, ctx.isTruncated, ctx.truncateLengths.listName);

        return {
          key: ctx.hideListDetails ? 'activity.listUpdateNameShort' : 'activity.listUpdateName',
          values: {
            prevList: prevListNameTruncated,
            list: ctx.listNameTruncated,
          },
          components: [
            { slot: 'prevList', title: listPrevName },
            { slot: 'list', title: ctx.listName },
          ],
        };
      }

      if (ctx.activity.data.listPosition !== undefined) {
        return {
          key: ctx.hideListDetails ? 'activity.listUpdatePositionShort' : 'activity.listUpdatePosition',
          values: {
            list: ctx.listNameTruncated,
            board: ctx.boardNameTruncated,
          },
          components: [
            { slot: 'list', title: ctx.listName },
            { slot: 'board', title: ctx.boardName },
          ],
        };
      }

      if (ctx.activity.data.listIsCollapsed !== undefined) {
        const { listIsCollapsed } = ctx.activity.data;
        let key;
        if (listIsCollapsed === true) {
          key = ctx.hideListDetails ? 'activity.listCollapseShort' : 'activity.listCollapse';
        } else {
          key = ctx.hideListDetails ? 'activity.listExpandShort' : 'activity.listExpand';
        }

        return {
          key,
          values: {
            list: ctx.listNameTruncated,
          },
          components: [{ slot: 'list', title: ctx.listName }],
        };
      }

      return null;
    },

    [ActivityTypes.LIST_DELETE]: (ctx) => {
      return {
        key: ctx.hideListDetails ? 'activity.listDeleteShort' : 'activity.listDelete',
        values: {
          list: ctx.listNameTruncated,
          board: ctx.boardNameTruncated,
        },
        components: [
          { slot: 'list', title: ctx.listName },
          { slot: 'board', title: ctx.boardName },
        ],
      };
    },

    [ActivityTypes.MAIL_TOKEN_CREATE]: (ctx) => {
      return {
        key: ctx.hideListDetails ? 'activity.mailTokenListCreateShort' : 'activity.mailTokenListCreate',
        values: {
          list: ctx.listNameTruncated,
          board: ctx.boardNameTruncated,
        },
        components: [
          { slot: 'list', title: ctx.listName },
          { slot: 'board', title: ctx.boardName },
        ],
      };
    },

    [ActivityTypes.MAIL_TOKEN_UPDATE]: (ctx) => {
      return {
        key: ctx.hideListDetails ? 'activity.mailTokenListUpdateShort' : 'activity.mailTokenListUpdate',
        values: {
          list: ctx.listNameTruncated,
          board: ctx.boardNameTruncated,
        },
        components: [
          { slot: 'list', title: ctx.listName },
          { slot: 'board', title: ctx.boardName },
        ],
      };
    },

    [ActivityTypes.MAIL_TOKEN_DELETE]: (ctx) => {
      let key;
      if (ctx.activity.data.userId === ctx.activity.userId) {
        key = ctx.hideListDetails ? 'activity.mailTokenListDeleteOwnShort' : 'activity.mailTokenListDeleteOwn';
      } else {
        key = ctx.hideListDetails ? 'activity.mailTokenListDeleteShort' : 'activity.mailTokenListDelete';
      }

      return {
        key,
        values: {
          list: ctx.listNameTruncated,
          board: ctx.boardNameTruncated,
          user: ctx.userNameTruncated,
        },
        components: [
          { slot: 'list', title: ctx.listName },
          { slot: 'user', title: ctx.userName },
          { slot: 'board', title: ctx.boardName },
        ],
      };
    },
  },

  [ActivityScopes.BOARD]: {
    [ActivityTypes.LABEL_CREATE]: (ctx) => {
      const { labelName } = ctx.activity.data;
      const labelNameTruncated = truncateIf(labelName, ctx.isTruncated, ctx.truncateLengths.default);

      return {
        key: ctx.hideLabelDetails ? 'activity.labelCreateShort' : 'activity.labelCreate',
        values: {
          label: labelNameTruncated,
          board: ctx.boardNameTruncated,
        },
        components: [
          { slot: 'label', title: labelName },
          { slot: 'board', title: ctx.boardName },
        ],
      };
    },

    [ActivityTypes.LABEL_UPDATE]: (ctx) => {
      const { labelName } = ctx.activity.data;
      const labelNameTruncated = truncateIf(labelName, ctx.isTruncated, ctx.truncateLengths.default);

      if (ctx.activity.data.labelColor) {
        const labelColorName = ctx.activity.data.labelColor;

        return {
          key: ctx.hideLabelDetails ? 'activity.labelUpdateColorShort' : 'activity.labelUpdateColor',
          values: {
            label: labelNameTruncated,
            color: labelColorName,
          },
          components: [
            { slot: 'label', title: labelName },
            { slot: 'color', title: labelColorName },
          ],
        };
      }

      if (ctx.activity.data.labelPrevName) {
        const { labelPrevName } = ctx.activity.data;
        const prevLabelNameTruncated = truncateIf(labelPrevName, ctx.isTruncated, ctx.truncateLengths.default);

        return {
          key: ctx.hideLabelDetails ? 'activity.labelUpdateNameShort' : 'activity.labelUpdateName',
          values: {
            prevLabel: prevLabelNameTruncated,
            label: labelNameTruncated,
          },
          components: [
            { slot: 'prevLabel', title: labelPrevName },
            { slot: 'label', title: labelName },
          ],
        };
      }

      return null;
    },

    [ActivityTypes.LABEL_DELETE]: (ctx) => {
      const { labelName } = ctx.activity.data;
      const labelNameTruncated = truncateIf(labelName, ctx.isTruncated, ctx.truncateLengths.default);

      return {
        key: ctx.hideLabelDetails ? 'activity.labelDeleteShort' : 'activity.labelDelete',
        values: {
          label: labelNameTruncated,
          board: ctx.boardNameTruncated,
        },
        components: [
          { slot: 'label', title: labelName },
          { slot: 'board', title: ctx.boardName },
        ],
      };
    },

    [ActivityTypes.BOARD_USER_ADD]: (ctx) => {
      const canComment = ctx.activity.data.canComment === null || ctx.activity.data.canComment === true ? ctx.t('activity.yes') : ctx.t('activity.no');
      const { role } = ctx.activity.data;

      return {
        key: ctx.hideBoardDetails ? 'activity.boardUserAddShort' : 'activity.boardUserAdd',
        values: {
          user: ctx.userNameTruncated,
          board: ctx.boardNameTruncated,
          role,
          canComment,
        },
        components: [
          { slot: 'user', title: ctx.userName },
          { slot: 'board', title: ctx.boardName },
          { slot: 'role', title: role },
          { slot: 'canComment', title: canComment },
        ],
      };
    },

    [ActivityTypes.BOARD_USER_UPDATE]: (ctx) => {
      const canComment = ctx.activity.data.canComment === null || ctx.activity.data.canComment === true ? ctx.t('activity.yes') : ctx.t('activity.no');
      const prevCanComment = ctx.activity.data.prevCanComment === null || ctx.activity.data.prevCanComment === true ? ctx.t('activity.yes') : ctx.t('activity.no');

      if (ctx.activity.data.prevRole) {
        const { prevRole, role } = ctx.activity.data;

        return {
          key: ctx.hideBoardDetails ? 'activity.boardUserUpdateRoleShort' : 'activity.boardUserUpdateRole',
          values: {
            user: ctx.userNameTruncated,
            prevRole,
            prevCanComment,
            role,
            canComment,
            board: ctx.boardNameTruncated,
          },
          components: [
            { slot: 'user', title: ctx.userName },
            { slot: 'prevRole', title: prevRole },
            { slot: 'prevCanComment', title: prevCanComment },
            { slot: 'role', title: role },
            { slot: 'canComment', title: canComment },
            { slot: 'board', title: ctx.boardName },
          ],
        };
      }

      return null;
    },

    [ActivityTypes.BOARD_USER_REMOVE]: (ctx) => {
      return {
        key: ctx.hideBoardDetails ? 'activity.boardUserRemoveShort' : 'activity.boardUserRemove',
        values: {
          user: ctx.userNameTruncated,
          board: ctx.boardNameTruncated,
        },
        components: [
          { slot: 'user', title: ctx.userName },
          { slot: 'board', title: ctx.boardName },
        ],
      };
    },

    [ActivityTypes.BOARD_CREATE]: (ctx) => {
      const isImportedBoard = ctx.activity.data.isImportedBoard === true ? ctx.t('activity.yes') : ctx.t('activity.no');

      return {
        key: ctx.hideBoardDetails ? 'activity.boardCreateShort' : 'activity.boardCreate',
        values: {
          board: ctx.boardNameTruncated,
          isImportedBoard,
          project: ctx.projectNameTruncated,
        },
        components: [
          { slot: 'board', title: ctx.boardName },
          { slot: 'isImportedBoard', title: isImportedBoard },
          { slot: 'project', title: ctx.projectName },
        ],
      };
    },

    [ActivityTypes.BOARD_UPDATE]: (ctx) => {
      if (ctx.activity.data.boardPrevName) {
        const { boardPrevName } = ctx.activity.data;
        const prevBoardNameTruncated = truncateIf(boardPrevName, ctx.isTruncated, ctx.truncateLengths.boardName);

        return {
          key: ctx.hideBoardDetails ? 'activity.boardUpdateNameShort' : 'activity.boardUpdateName',
          values: {
            prevBoard: prevBoardNameTruncated,
            board: ctx.boardNameTruncated,
          },
          components: [
            { slot: 'prevBoard', title: boardPrevName },
            { slot: 'board', title: ctx.boardName },
          ],
        };
      }

      if (ctx.activity.data.prevIsGithubConnected !== undefined || ctx.activity.data.prevGithubRepo !== undefined) {
        const { prevIsGithubConnected, isGithubConnected, prevGithubRepo, githubRepo } = ctx.activity.data;
        let key;
        if (prevIsGithubConnected === false && isGithubConnected === true) {
          key = ctx.hideBoardDetails ? 'activity.boardAddedGithubRepoShort' : 'activity.boardAddedGithubRepo';
        } else if (prevIsGithubConnected === true && isGithubConnected === false) {
          key = ctx.hideBoardDetails ? 'activity.boardRemovedGithubRepoShort' : 'activity.boardRemovedGithubRepo';
        } else {
          key = ctx.hideBoardDetails ? 'activity.boardUpdateGithubRepoShort' : 'activity.boardUpdateGithubRepo';
        }

        return {
          key,
          values: {
            board: ctx.boardNameTruncated,
            githubRepo,
            prevGithubRepo,
          },
          components: [
            { slot: 'board', title: ctx.boardName },
            { slot: 'githubRepo', title: githubRepo },
            { slot: 'prevGithubRepo', title: prevGithubRepo },
          ],
        };
      }

      if (ctx.activity.data.prevPosition !== undefined) {
        return {
          key: ctx.hideBoardDetails ? 'activity.boardUpdatePositionShort' : 'activity.boardUpdatePosition',
          values: {
            board: ctx.boardNameTruncated,
            project: ctx.projectNameTruncated,
          },
          components: [
            { slot: 'board', title: ctx.boardName },
            { slot: 'project', title: ctx.projectName },
          ],
        };
      }

      return null;
    },

    [ActivityTypes.BOARD_DELETE]: (ctx) => {
      return {
        key: ctx.hideBoardDetails ? 'activity.boardDeleteShort' : 'activity.boardDelete',
        values: {
          board: ctx.boardNameTruncated,
          project: ctx.projectNameTruncated,
        },
        components: [
          { slot: 'board', title: ctx.boardName },
          { slot: 'project', title: ctx.projectName },
        ],
      };
    },

    [ActivityTypes.MAIL_TOKEN_CREATE]: (ctx) => {
      return {
        key: ctx.hideBoardDetails ? 'activity.mailTokenBoardCreateShort' : 'activity.mailTokenBoardCreate',
        values: {
          board: ctx.boardNameTruncated,
        },
        components: [{ slot: 'board', title: ctx.boardName }],
      };
    },

    [ActivityTypes.MAIL_TOKEN_UPDATE]: (ctx) => {
      return {
        key: ctx.hideBoardDetails ? 'activity.mailTokenBoardUpdateShort' : 'activity.mailTokenBoardUpdate',
        values: {
          board: ctx.boardNameTruncated,
        },
        components: [{ slot: 'board', title: ctx.boardName }],
      };
    },

    [ActivityTypes.MAIL_TOKEN_DELETE]: (ctx) => {
      let key;
      if (ctx.activity.data.userId === ctx.activity.userId) {
        key = ctx.hideListDetails ? 'activity.mailTokenBoardDeleteOwnShort' : 'activity.mailTokenBoardDeleteOwn';
      } else {
        key = ctx.hideListDetails ? 'activity.mailTokenBoardDeleteShort' : 'activity.mailTokenBoardDelete';
      }

      return {
        key,
        values: {
          user: ctx.userNameTruncated,
          board: ctx.boardNameTruncated,
        },
        components: [
          { slot: 'user', title: ctx.userName },
          { slot: 'board', title: ctx.boardName },
        ],
      };
    },
  },

  [ActivityScopes.PROJECT]: {
    [ActivityTypes.PROJECT_CREATE]: (ctx) => {
      return {
        key: ctx.hideProjectDetails ? 'activity.projectCreateShort' : 'activity.projectCreate',
        values: {
          project: ctx.projectNameTruncated,
        },
        components: [{ slot: 'project', title: ctx.projectName }],
      };
    },

    [ActivityTypes.PROJECT_UPDATE]: (ctx) => {
      if (ctx.activity.data.projectPrevName) {
        const { projectPrevName } = ctx.activity.data;
        const prevProjectNameTruncated = truncateIf(projectPrevName, ctx.isTruncated, ctx.truncateLengths.projectName);

        return {
          key: ctx.hideProjectDetails ? 'activity.projectUpdateNameShort' : 'activity.projectUpdateName',
          values: {
            prevProject: prevProjectNameTruncated,
            project: ctx.projectNameTruncated,
          },
          components: [
            { slot: 'prevProject', title: projectPrevName },
            { slot: 'project', title: ctx.projectName },
          ],
        };
      }

      if (ctx.activity.data.projectPrevBackground !== undefined || ctx.activity.data.projectBackground !== undefined || ctx.activity.data.projectPrevBackgroundImage !== undefined || ctx.activity.data.projectBackgroundImage !== undefined) {
        const { projectPrevBackground, projectBackground, projectPrevBackgroundImage, projectBackgroundImage } = ctx.activity.data;
        let key;
        if ((projectPrevBackground === null && projectBackground !== null) || (projectPrevBackgroundImage === null && projectBackgroundImage !== null)) {
          key = ctx.hideProjectDetails ? 'activity.projectBackgroundAddShort' : 'activity.projectBackgroundAdd';
        } else if ((projectPrevBackground !== null && projectBackground === null) || (projectPrevBackgroundImage !== null && projectBackgroundImage === null)) {
          key = ctx.hideProjectDetails ? 'activity.projectBackgroundRemoveShort' : 'activity.projectBackgroundRemove';
        } else if ((projectPrevBackground !== null && projectBackground !== null) || (projectPrevBackgroundImage !== null && projectBackgroundImage !== null)) {
          key = ctx.hideProjectDetails ? 'activity.projectBackgroundUpdateShort' : 'activity.projectBackgroundUpdate';
        }

        return {
          key,
          values: {
            project: ctx.projectNameTruncated,
          },
          components: [{ slot: 'project', title: ctx.projectName }],
        };
      }

      return null;
    },

    [ActivityTypes.PROJECT_DELETE]: (ctx) => {
      return {
        key: ctx.hideProjectDetails ? 'activity.projectDeleteShort' : 'activity.projectDelete',
        values: {
          project: ctx.projectNameTruncated,
        },
        components: [{ slot: 'project', title: ctx.projectName }],
      };
    },

    [ActivityTypes.PROJECT_MANAGER_ADD]: (ctx) => {
      return {
        key: ctx.hideProjectDetails ? 'activity.projectManagerAddShort' : 'activity.projectManagerAdd',
        values: {
          user: ctx.userNameTruncated,
          project: ctx.projectNameTruncated,
        },
        components: [
          { slot: 'user', title: ctx.userName },
          { slot: 'project', title: ctx.projectName },
        ],
      };
    },

    [ActivityTypes.PROJECT_MANAGER_REMOVE]: (ctx) => {
      return {
        key: ctx.hideProjectDetails ? 'activity.projectManagerRemoveShort' : 'activity.projectManagerRemove',
        values: {
          user: ctx.userNameTruncated,
          project: ctx.projectNameTruncated,
        },
        components: [
          { slot: 'user', title: ctx.userName },
          { slot: 'project', title: ctx.projectName },
        ],
      };
    },
  },

  [ActivityScopes.USER]: {
    [ActivityTypes.USER_CREATE]: (ctx) => {
      const isAdmin = ctx.activity.data.isAdmin ? ctx.t('activity.yes') : ctx.t('activity.no');

      return {
        key: 'activity.userCreate',
        values: {
          userName: ctx.userNameTruncated,
          userEmail: ctx.activity.data.userEmail,
          isAdmin,
        },
        components: [
          { slot: 'userName', title: ctx.userName },
          { slot: 'userEmail', title: ctx.activity.data.userEmail },
          { slot: 'isAdmin', title: isAdmin },
        ],
      };
    },

    [ActivityTypes.USER_REGISTER]: (ctx) => {
      const isAdmin = ctx.activity.data.isAdmin ? ctx.t('activity.yes') : ctx.t('activity.no');
      const isLocalRegistration = ctx.activity.data.ssoOidcEmail === null && ctx.activity.data.ssoGoogleEmail === null && ctx.activity.data.ssoGithubEmail === null && ctx.activity.data.ssoMicrosoftEmail === null;

      return {
        key: isLocalRegistration ? 'activity.userRegisterLocal' : 'activity.userRegisterOidc',
        values: {
          userName: ctx.userNameTruncated,
          userEmail: ctx.activity.data.userEmail,
          isAdmin,
        },
        components: [
          { slot: 'userName', title: ctx.userName },
          { slot: 'userEmail', title: ctx.activity.data.userEmail },
          { slot: 'isAdmin', title: isAdmin },
        ],
      };
    },

    [ActivityTypes.USER_UPDATE]: (ctx) => {
      if (ctx.activity.data.prevUserName) {
        const { prevUserName } = ctx.activity.data;
        const userPrevNameTruncated = truncateIf(prevUserName, ctx.isTruncated, ctx.truncateLengths.userName);

        return {
          key: 'activity.userUpdateName',
          values: {
            prevUserName: userPrevNameTruncated,
            userName: ctx.userNameTruncated,
          },
          components: [
            { slot: 'prevUserName', title: prevUserName },
            { slot: 'userName', title: ctx.userName },
          ],
        };
      }

      if (ctx.activity.data.userUsername) {
        const { prevUserUsername, userUsername } = ctx.activity.data;

        return {
          key: 'activity.userUpdateUsername',
          values: {
            prevUsername: prevUserUsername || ctx.t('activity.none'),
            username: userUsername,
          },
          components: [
            { slot: 'prevUsername', title: prevUserUsername || ctx.t('activity.none') },
            { slot: 'username', title: userUsername },
          ],
        };
      }

      if (ctx.activity.data.userEmail && ctx.activity.data.prevUserEmail) {
        const userPrevEmail = ctx.activity.data.prevUserEmail;

        return {
          key: 'activity.userUpdateEmail',
          values: {
            userName: ctx.userNameTruncated,
            prevUserEmail: userPrevEmail,
            userEmail: ctx.activity.data.userEmail,
          },
          components: [
            { slot: 'userName', title: ctx.userName },
            { slot: 'prevUserEmail', title: userPrevEmail },
            { slot: 'userEmail', title: ctx.activity.data.userEmail },
          ],
        };
      }

      if (ctx.activity.data.userIsAdmin !== undefined) {
        const { prevUserIsAdmin, userIsAdmin } = ctx.activity.data;

        return {
          key: 'activity.userUpdateIsAdmin',
          values: {
            userName: ctx.userNameTruncated,
            prevIsAdmin: prevUserIsAdmin ? ctx.t('activity.yes') : ctx.t('activity.no'),
            isAdmin: userIsAdmin ? ctx.t('activity.yes') : ctx.t('activity.no'),
          },
          components: [
            { slot: 'userName', title: ctx.userName },
            { slot: 'prevIsAdmin', title: prevUserIsAdmin ? ctx.t('activity.yes') : ctx.t('activity.no') },
            { slot: 'isAdmin', title: userIsAdmin ? ctx.t('activity.yes') : ctx.t('activity.no') },
          ],
        };
      }

      if (ctx.activity.data.userAvatar !== undefined) {
        const { prevUserAvatar, userAvatar } = ctx.activity.data;

        return {
          key: 'activity.userUpdateAvatar',
          values: {
            userName: ctx.userNameTruncated,
            prevUserAvatar: prevUserAvatar ? ctx.t('activity.yes') : ctx.t('activity.no'),
            userAvatar: userAvatar ? ctx.t('activity.yes') : ctx.t('activity.no'),
          },
          components: [
            { slot: 'userName', title: ctx.userName },
            { slot: 'prevUserAvatar', title: prevUserAvatar ? ctx.t('activity.yes') : ctx.t('activity.no') },
            { slot: 'userAvatar', title: userAvatar ? ctx.t('activity.yes') : ctx.t('activity.no') },
          ],
        };
      }

      if (ctx.activity.data.ssoGoogleEmail !== undefined) {
        const { prevSsoGoogleEmail, ssoGoogleEmail } = ctx.activity.data;

        return {
          key: 'activity.userUpdateSsoGoogleEmail',
          values: {
            userName: ctx.userNameTruncated,
            prevSsoGoogleEmail: prevSsoGoogleEmail || ctx.t('activity.none'),
            ssoGoogleEmail: ssoGoogleEmail || ctx.t('activity.none'),
          },
          components: [
            { slot: 'userName', title: ctx.userName },
            { slot: 'prevSsoGoogleEmail', title: prevSsoGoogleEmail || ctx.t('activity.none') },
            { slot: 'ssoGoogleEmail', title: ssoGoogleEmail || ctx.t('activity.none') },
          ],
        };
      }

      if (ctx.activity.data.ssoGithubEmail !== undefined) {
        const { prevSsoGithubEmail, ssoGithubEmail } = ctx.activity.data;

        return {
          key: 'activity.userUpdateSsoGithubEmail',
          values: {
            userName: ctx.userNameTruncated,
            prevSsoGithubEmail: prevSsoGithubEmail || ctx.t('activity.none'),
            ssoGithubEmail: ssoGithubEmail || ctx.t('activity.none'),
          },
          components: [
            { slot: 'userName', title: ctx.userName },
            { slot: 'prevSsoGithubEmail', title: prevSsoGithubEmail || ctx.t('activity.none') },
            { slot: 'ssoGithubEmail', title: ssoGithubEmail || ctx.t('activity.none') },
          ],
        };
      }

      if (ctx.activity.data.ssoMicrosoftEmail !== undefined) {
        const { prevSsoMicrosoftEmail, ssoMicrosoftEmail } = ctx.activity.data;

        return {
          key: 'activity.userUpdateSsoMicrosoftEmail',
          values: {
            userName: ctx.userNameTruncated,
            prevSsoMicrosoftEmail: prevSsoMicrosoftEmail || ctx.t('activity.none'),
            ssoMicrosoftEmail: ssoMicrosoftEmail || ctx.t('activity.none'),
          },
          components: [
            { slot: 'userName', title: ctx.userName },
            { slot: 'prevSsoMicrosoftEmail', title: prevSsoMicrosoftEmail || ctx.t('activity.none') },
            { slot: 'ssoMicrosoftEmail', title: ssoMicrosoftEmail || ctx.t('activity.none') },
          ],
        };
      }

      if (ctx.activity.data.ssoOidcEmail !== undefined) {
        const { prevSsoOidcEmail, ssoOidcEmail } = ctx.activity.data;

        return {
          key: 'activity.userUpdateSsoOidcEmail',
          values: {
            userName: ctx.userNameTruncated,
            prevSsoOidcEmail: prevSsoOidcEmail || ctx.t('activity.none'),
            ssoOidcEmail: ssoOidcEmail || ctx.t('activity.none'),
          },
          components: [
            { slot: 'userName', title: ctx.userName },
            { slot: 'prevSsoOidcEmail', title: prevSsoOidcEmail || ctx.t('activity.none') },
            { slot: 'ssoOidcEmail', title: ssoOidcEmail || ctx.t('activity.none') },
          ],
        };
      }

      if (ctx.activity.data.passwordChanged !== undefined && ctx.activity.data.passwordChanged === true) {
        return {
          key: 'activity.userUpdatePasswordChanged',
          values: {
            userName: ctx.userNameTruncated,
          },
          components: [{ slot: 'userName', title: ctx.userName }],
        };
      }

      if (ctx.activity.data.isVerified !== undefined) {
        const { isVerified } = ctx.activity.data;

        if (isVerified) {
          return {
            key: 'activity.userUpdateIsVerified',
            values: {
              userName: ctx.userNameTruncated,
              userEmail: ctx.activity.data.userEmail,
            },
            components: [
              { slot: 'userName', title: ctx.userName },
              { slot: 'userEmail', title: ctx.activity.data.userEmail },
            ],
          };
        }
        return null;
      }

      return null;
    },

    [ActivityTypes.USER_DELETE]: (ctx) => {
      const { userName } = ctx.activity.data;

      return {
        key: 'activity.userDelete',
        values: {
          user: userName,
          userEmail: ctx.activity.data.userEmail,
        },
        components: [
          { slot: 'user', title: userName },
          { slot: 'userEmail', title: ctx.activity.data.userEmail },
        ],
      };
    },

    [ActivityTypes.API_CLIENT_CREATE]: (ctx) => {
      const { name, permissions } = ctx.activity.data;
      let nameTruncated = truncateIf(name, ctx.isTruncated, ctx.truncateLengths.default);
      nameTruncated = nameTruncated || ctx.t('activity.unnamed');
      const permissionsList = permissions.includes('*') ? ctx.t('activity.all') : permissions.join(', ');

      return {
        key: 'activity.apiClientCreate',
        values: {
          name: nameTruncated,
          permissions: permissionsList,
        },
        components: [
          { slot: 'name', title: name },
          { slot: 'permissions', title: permissionsList },
        ],
      };
    },

    [ActivityTypes.API_CLIENT_UPDATE]: (ctx) => {
      const { prevName, name, permissions, regenerateSecret } = ctx.activity.data;
      let nameTruncated = truncateIf(name, ctx.isTruncated, ctx.truncateLengths.default);
      nameTruncated = nameTruncated || ctx.t('activity.unnamed');
      let prevNameTruncated = truncateIf(prevName, ctx.isTruncated, ctx.truncateLengths.default);
      prevNameTruncated = prevNameTruncated || ctx.t('activity.unnamed');
      const permissionsList = permissions.includes('*') ? ctx.t('activity.all') : permissions.join(', ');

      return {
        key: 'activity.apiClientUpdate',
        values: {
          prevName: prevNameTruncated,
          name: nameTruncated,
          permissions: permissionsList,
          regenerateSecret: regenerateSecret ? ctx.t('activity.yes') : ctx.t('activity.no'),
        },
        components: [
          { slot: 'prevName', title: prevName },
          { slot: 'name', title: name },
          { slot: 'permissions', title: permissionsList },
          { slot: 'regenerateSecret', title: regenerateSecret ? ctx.t('activity.yes') : ctx.t('activity.no') },
        ],
      };
    },

    [ActivityTypes.API_CLIENT_DELETE]: (ctx) => {
      const { name } = ctx.activity.data;
      let nameTruncated = truncateIf(name, ctx.isTruncated, ctx.truncateLengths.default);
      nameTruncated = nameTruncated || ctx.t('activity.unnamed');

      return {
        key: 'activity.apiClientDelete',
        values: {
          name: nameTruncated,
        },
        components: [{ slot: 'name', title: name }],
      };
    },
  },

  [ActivityScopes.INSTANCE]: {
    [ActivityTypes.INSTANCE_UPDATE]: (ctx) => {
      const data = ctx.activity.data || {};

      const settings = Object.entries(data)
        .filter(([settingKey, value]) => value !== undefined && !settingKey.startsWith('prev'))
        .map(([settingKey, value]) => `${settingKey}: ${String(value)}`)
        .join(', ');

      return {
        key: 'activity.instanceUpdateSettings',
        values: {
          settings,
        },
        components: [{ slot: 'settings', title: settings }],
      };
    },
  },
};

export function getActivityTransProps(t, activity, flags = {}) {
  const ctx = buildContext(t, activity, flags);
  const specFn = activityRenderSpec[activity.scope]?.[activity.type];

  if (!specFn) {
    return null;
  }

  const spec = specFn(ctx);

  if (!spec) {
    return null;
  }

  const { components = [], key, values } = spec;

  return {
    i18nKey: key,
    values,
    components,
    ctx,
  };
}
