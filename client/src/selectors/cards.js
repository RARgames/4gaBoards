import { createSelector } from 'redux-orm';

import Paths from '../constants/Paths';
import orm from '../orm';
import getMeta from '../utils/get-meta';
import { isLocalId } from '../utils/local-id';
import { sortByCurrentUserAndName, addBoardMemberships, addCardMemberships, addTaskMemberships } from '../utils/membership-helpers';
import { selectPath } from './router';
import { selectCurrentUserId } from './users';

export const makeSelectCardById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);

      if (!cardModel) {
        return cardModel;
      }

      return {
        ...cardModel.ref,
        ...getMeta(cardModel),
        coverUrl: cardModel.coverAttachment && cardModel.coverAttachment.coverUrl,
        isPersisted: !isLocalId(id),
      };
    },
  );

export const selectCardById = makeSelectCardById();

export const makeSelectUsersByCardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    (state) => selectCurrentUserId(state),
    ({ Card }, id, currentUserId) => {
      const cardModel = Card.withId(id);

      if (!cardModel) {
        return cardModel;
      }

      return cardModel.users.toRefArray().sort((a, b) => {
        if (a.id === currentUserId) return -1;
        if (b.id === currentUserId) return 1;
        return a.name.localeCompare(b.name);
      });
    },
  );

export const selectUsersByCardId = makeSelectUsersByCardId();

export const makeSelectLabelsByCardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);

      if (!cardModel) {
        return cardModel;
      }

      return cardModel.labels.toRefArray().sort((a, b) => a.name.localeCompare(b.name));
    },
  );

export const selectLabelsByCardId = makeSelectLabelsByCardId();

export const makeSelectTasksByCardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);

      if (!cardModel) {
        return cardModel;
      }

      return cardModel
        .getOrderedTasksQuerySet()
        .toModelArray()
        .map((taskModel) => ({
          ...taskModel.ref,
          ...getMeta(taskModel),
          isPersisted: !isLocalId(taskModel.id),
        }));
    },
  );

export const selectTasksByCardId = makeSelectTasksByCardId();

export const makeSelectClosestTaskDueDateByCardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);

      if (!cardModel) {
        return cardModel;
      }

      return (
        cardModel
          .getOrderedTasksQuerySet()
          .toRefArray()
          .filter((t) => !t.isCompleted && t.dueDate)
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0]?.dueDate ?? undefined
      );
    },
  );

export const selectClosestTaskDueDateByCardId = makeSelectClosestTaskDueDateByCardId();

export const makeSelectClosestDueDateByCardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);

      if (!cardModel) {
        return cardModel;
      }

      const cardDueTime = cardModel.dueDate ? new Date(cardModel.dueDate).getTime() : undefined;
      const taskDueTimes = cardModel
        .getOrderedTasksQuerySet()
        .toRefArray()
        .filter((t) => !t.isCompleted && t.dueDate)
        .map((t) => new Date(t.dueDate).getTime());

      const allDueTimes = cardDueTime !== undefined ? [cardDueTime, ...taskDueTimes] : taskDueTimes;

      if (allDueTimes.length === 0) return undefined;

      return new Date(Math.min(...allDueTimes));
    },
  );

export const selectClosestDueDateByCardId = makeSelectClosestDueDateByCardId();

export const makeSelectLastCommentActivityIdByCardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);

      if (!cardModel) {
        return cardModel;
      }

      const lastActivityModel = cardModel.getOrderedCardCommentsQuerySet().last();

      return lastActivityModel && lastActivityModel.id;
    },
  );

export const selectLastCommentActivityIdByCardId = makeSelectLastCommentActivityIdByCardId();

export const makeSelectLastActivityIdByCardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);

      if (!cardModel) {
        return cardModel;
      }

      const lastActivityModel = cardModel.getOrderedCardActivitiesQuerySet().last();

      return lastActivityModel && lastActivityModel.id;
    },
  );

export const selectLastActivityIdByCardId = makeSelectLastActivityIdByCardId();

export const makeSelectNotificationsByCardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);

      if (!cardModel) {
        return cardModel;
      }

      return cardModel.getUnreadNotificationsQuerySet().toRefArray();
    },
  );

export const selectNotificationsByCardId = makeSelectNotificationsByCardId();

export const makeSelectNotificationsTotalByCardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);

      if (!cardModel) {
        return cardModel;
      }

      return cardModel.getUnreadNotificationsQuerySet().count();
    },
  );

export const selectNotificationsTotalByCardId = makeSelectNotificationsTotalByCardId();

export const makeSelectAttachmentsCountByCardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);

      if (!cardModel) {
        return cardModel;
      }

      return cardModel.getAttachmentsCount();
    },
  );

export const selectAttachmentsCountByCardId = makeSelectAttachmentsCountByCardId();

export const makeSelectActivitiesByCardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    (state) => selectCurrentUserId(state),
    ({ Card }, id, currentUserId) => {
      if (!id) {
        return id;
      }

      const cardModel = Card.withId(id);

      if (!cardModel) {
        return cardModel;
      }

      return cardModel
        .getOrderedCardActivitiesQuerySet()
        .toModelArray()
        .map((activityModel) => ({
          ...activityModel.ref,
          ...getMeta(activityModel),
          isPersisted: !isLocalId(activityModel.id),
          user: {
            ...activityModel.user.ref,
            isCurrent: activityModel.user.id === currentUserId,
          },
        }));
    },
  );

export const selectActivitiesByCardId = makeSelectActivitiesByCardId();

export const makeSelectTaskActivitiesByCardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      if (!id) {
        return id;
      }

      const cardModel = Card.withId(id);

      if (!cardModel) {
        return cardModel;
      }

      const activities = cardModel
        .getOrderedTaskActivitiesQuerySet()
        .toModelArray()
        .map((activityModel) => ({
          ...activityModel.ref,
          ...getMeta(activityModel),
          isPersisted: !isLocalId(activityModel.id),
          user: {
            ...activityModel.user.ref,
          },
        }));

      const taskActivitiesByTaskId = activities.reduce((acc, act) => {
        const tid = act.data?.taskId;
        if (tid == null) return acc;
        if (!acc[tid]) acc[tid] = [];
        acc[tid].push(act);
        return acc;
      }, {});

      return taskActivitiesByTaskId;
    },
  );

export const selectTaskActivitiesByCardId = makeSelectTaskActivitiesByCardId();

export const makeSelectAttachmentActivitiesByCardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      if (!id) {
        return id;
      }

      const cardModel = Card.withId(id);

      if (!cardModel) {
        return cardModel;
      }

      const activities = cardModel
        .getOrderedAttachmentActivitiesQuerySet()
        .toModelArray()
        .map((activityModel) => ({
          ...activityModel.ref,
          ...getMeta(activityModel),
          isPersisted: !isLocalId(activityModel.id),
          user: {
            ...activityModel.user.ref,
          },
        }));

      const attachmentActivitiesByAttachmentId = activities.reduce((acc, act) => {
        const tid = act.data?.attachmentId;
        if (tid == null) return acc;
        if (!acc[tid]) acc[tid] = [];
        acc[tid].push(act);
        return acc;
      }, {});

      return attachmentActivitiesByAttachmentId;
    },
  );

export const selectAttachmentActivitiesByCardId = makeSelectAttachmentActivitiesByCardId();

export const makeSelectCommentActivitiesByCardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      if (!id) {
        return id;
      }

      const cardModel = Card.withId(id);

      if (!cardModel) {
        return cardModel;
      }

      const activities = cardModel
        .getOrderedCommentActivitiesQuerySet()
        .toModelArray()
        .map((activityModel) => ({
          ...activityModel.ref,
          ...getMeta(activityModel),
          isPersisted: !isLocalId(activityModel.id),
          user: {
            ...activityModel.user.ref,
          },
        }));

      const commentActivitiesByCommentId = activities.reduce((acc, act) => {
        const tid = act.data?.commentActionId;
        if (tid == null) return acc;
        if (!acc[tid]) acc[tid] = [];
        acc[tid].push(act);
        return acc;
      }, {});

      return commentActivitiesByCommentId;
    },
  );

export const selectCommentActivitiesByCardId = makeSelectCommentActivitiesByCardId();

export const selectCurrentCard = createSelector(
  orm,
  (state) => selectPath(state).cardId,
  ({ Card }, id) => {
    if (!id) {
      return id;
    }

    const cardModel = Card.withId(id);

    if (!cardModel) {
      return cardModel;
    }

    return {
      ...cardModel.ref,
      ...getMeta(cardModel),
    };
  },
);

export const selectUsersForCurrentCard = createSelector(
  orm,
  (state) => selectPath(state).cardId,
  (state) => selectCurrentUserId(state),
  ({ Card }, id, currentUserId) => {
    if (!id) {
      return id;
    }

    const cardModel = Card.withId(id);

    if (!cardModel) {
      return cardModel;
    }

    return cardModel.users.toRefArray().sort((a, b) => {
      if (a.id === currentUserId) return -1;
      if (b.id === currentUserId) return 1;
      return a.name.localeCompare(b.name);
    });
  },
);

export const selectLabelsForCurrentCard = createSelector(
  orm,
  (state) => selectPath(state).cardId,
  ({ Card }, id) => {
    if (!id) {
      return id;
    }

    const cardModel = Card.withId(id);

    if (!cardModel) {
      return cardModel;
    }

    return cardModel.labels.toRefArray().sort((a, b) => a.name.localeCompare(b.name));
  },
);

export const selectTasksForCurrentCard = createSelector(
  orm,
  (state) => selectPath(state).cardId,
  ({ Card }, id) => {
    if (!id) {
      return id;
    }

    const cardModel = Card.withId(id);

    if (!cardModel) {
      return cardModel;
    }

    return cardModel
      .getOrderedTasksQuerySet()
      .toModelArray()
      .map((taskModel) => ({
        ...taskModel.ref,
        ...getMeta(taskModel),
        isPersisted: !isLocalId(taskModel.id),
      }));
  },
);

export const selectAttachmentsForCurrentCard = createSelector(
  orm,
  (state) => selectPath(state).cardId,
  ({ Card }, id) => {
    if (!id) {
      return id;
    }

    const cardModel = Card.withId(id);

    if (!cardModel) {
      return cardModel;
    }

    return cardModel
      .getOrderedAttachmentsQuerySet()
      .toModelArray()
      .map((attachmentModel) => ({
        ...attachmentModel.ref,
        ...getMeta(attachmentModel),
        isCover: attachmentModel.id === cardModel.coverAttachmentId,
        isPersisted: !isLocalId(attachmentModel.id),
      }));
  },
);

export const selectCommentsForCurrentCard = createSelector(
  orm,
  (state) => selectPath(state).cardId,
  (state) => selectCurrentUserId(state),
  ({ Card }, id, currentUserId) => {
    if (!id) {
      return id;
    }

    const cardModel = Card.withId(id);

    if (!cardModel) {
      return cardModel;
    }

    return cardModel
      .getOrderedCardCommentsQuerySet()
      .toModelArray()
      .map((activityModel) => ({
        ...activityModel.ref,
        ...getMeta(activityModel),
        isPersisted: !isLocalId(activityModel.id),
        user: {
          ...activityModel.user.ref,
          isCurrent: activityModel.user.id === currentUserId,
        },
      }));
  },
);

export const selectNotificationIdsForCurrentCard = createSelector(
  orm,
  (state) => selectPath(state).cardId,
  ({ Card }, id) => {
    if (!id) {
      return id;
    }

    const cardModel = Card.withId(id);

    if (!cardModel) {
      return cardModel;
    }

    return cardModel
      .getUnreadNotificationsQuerySet()
      .toRefArray()
      .map((notification) => notification.id);
  },
);

export const selectUrlForCard = createSelector(
  orm,
  (_, id) => id,
  // eslint-disable-next-line no-unused-vars
  ({ Card }, id) => {
    if (!id) {
      return id;
    }

    const { origin } = window.location;
    const cardPath = Paths.CARDS.replace(':id', id);
    const url = `${origin}${cardPath}`;

    return url;
  },
);

export const selectBoardAndCardMembershipsByCardId = createSelector(
  orm,
  (_, id) => id,
  (state) => selectPath(state).boardId,
  (state) => selectCurrentUserId(state),
  ({ Board, Card }, id, boardId, currentUserId) => {
    if (!id) return id;
    if (!boardId) return boardId;

    const cardModel = Card.withId(id);
    const boardModel = Board.withId(boardId);

    if (!cardModel) return cardModel;
    if (!boardModel) return boardModel;

    const memberships = new Map();
    addBoardMemberships(boardModel, memberships, currentUserId);
    addCardMemberships(cardModel, memberships, currentUserId);

    return sortByCurrentUserAndName(Array.from(memberships.values()));
  },
);

export const selectBoardAndCardMembershipsForCurrentCard = createSelector(
  orm,
  (state) => selectPath(state).cardId,
  (state) => selectPath(state).boardId,
  (state) => selectCurrentUserId(state),
  ({ Board, Card }, id, boardId, currentUserId) => {
    if (!id) return id;
    if (!boardId) return boardId;

    const cardModel = Card.withId(id);
    const boardModel = Board.withId(boardId);

    if (!cardModel) return cardModel;
    if (!boardModel) return boardModel;

    const memberships = new Map();
    addBoardMemberships(boardModel, memberships, currentUserId);
    addCardMemberships(cardModel, memberships, currentUserId);

    return sortByCurrentUserAndName(Array.from(memberships.values()));
  },
);

export const selectBoardAndTaskMembershipsByCardId = createSelector(
  orm,
  (_, id) => id,
  (state) => selectPath(state).boardId,
  (state) => selectCurrentUserId(state),
  ({ Board, Card }, id, boardId, currentUserId) => {
    if (!id) return id;
    if (!boardId) return boardId;

    const cardModel = Card.withId(id);
    const boardModel = Board.withId(boardId);

    if (!cardModel) return cardModel;
    if (!boardModel) return boardModel;

    const memberships = new Map();
    addBoardMemberships(boardModel, memberships, currentUserId);
    addTaskMemberships(cardModel, memberships, currentUserId);

    return sortByCurrentUserAndName(Array.from(memberships.values()));
  },
);

export const selectBoardAndTaskMembershipsForCurrentCard = createSelector(
  orm,
  (state) => selectPath(state).cardId,
  (state) => selectPath(state).boardId,
  (state) => selectCurrentUserId(state),
  ({ Board, Card }, id, boardId, currentUserId) => {
    if (!id) return id;
    if (!boardId) return boardId;

    const cardModel = Card.withId(id);
    const boardModel = Board.withId(boardId);

    if (!cardModel) return cardModel;
    if (!boardModel) return boardModel;

    const memberships = new Map();
    addBoardMemberships(boardModel, memberships, currentUserId);
    addTaskMemberships(cardModel, memberships, currentUserId);

    return sortByCurrentUserAndName(Array.from(memberships.values()));
  },
);

export default {
  makeSelectCardById,
  selectCardById,
  makeSelectUsersByCardId,
  selectUsersByCardId,
  makeSelectLabelsByCardId,
  selectLabelsByCardId,
  makeSelectTasksByCardId,
  selectTasksByCardId,
  makeSelectClosestTaskDueDateByCardId,
  selectClosestTaskDueDateByCardId,
  makeSelectClosestDueDateByCardId,
  selectClosestDueDateByCardId,
  makeSelectLastCommentActivityIdByCardId,
  selectLastCommentActivityIdByCardId,
  makeSelectLastActivityIdByCardId,
  selectLastActivityIdByCardId,
  makeSelectNotificationsByCardId,
  selectNotificationsByCardId,
  makeSelectNotificationsTotalByCardId,
  selectNotificationsTotalByCardId,
  makeSelectAttachmentsCountByCardId,
  selectAttachmentsCountByCardId,
  makeSelectActivitiesByCardId,
  selectActivitiesByCardId,
  makeSelectTaskActivitiesByCardId,
  selectTaskActivitiesByCardId,
  makeSelectAttachmentActivitiesByCardId,
  selectAttachmentActivitiesByCardId,
  makeSelectCommentActivitiesByCardId,
  selectCommentActivitiesByCardId,
  selectCurrentCard,
  selectUsersForCurrentCard,
  selectLabelsForCurrentCard,
  selectTasksForCurrentCard,
  selectAttachmentsForCurrentCard,
  selectCommentsForCurrentCard,
  selectNotificationIdsForCurrentCard,
  selectUrlForCard,
  selectBoardAndCardMembershipsByCardId,
  selectBoardAndCardMembershipsForCurrentCard,
  selectBoardAndTaskMembershipsByCardId,
  selectBoardAndTaskMembershipsForCurrentCard,
};
