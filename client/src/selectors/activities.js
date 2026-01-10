import { createSelector } from 'redux-orm';

import orm from '../orm';
import getActivityDetails from '../utils/get-activity-details';
import { selectCurrentUserId } from './users';

export const makeSelectLastAttachmentActivityIdById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Attachment }, id) => {
      const attachmentModel = Attachment.withId(id);

      if (!attachmentModel) {
        return attachmentModel;
      }

      return attachmentModel.lastActivityId;
    },
  );

export const selectLastAttachmentActivityIdById = makeSelectLastAttachmentActivityIdById();

export const makeSelectAttachmentActivitiesById = () =>
  createSelector(
    orm,
    (_, id) => id,
    (state) => selectCurrentUserId(state),
    ({ Attachment }, id, currentUserId) => {
      if (!id) {
        return id;
      }

      const attachmentModel = Attachment.withId(id);

      if (!attachmentModel) {
        return attachmentModel;
      }

      const activities = attachmentModel
        .getOrderedActivitiesQuerySet()
        .toModelArray()
        .map((activityModel) => ({
          ...getActivityDetails(activityModel, currentUserId),
        }));

      return activities;
    },
  );

export const selectAttachmentActivitiesById = makeSelectAttachmentActivitiesById();

export const makeSelectLastCommentActivityIdById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Comment }, id) => {
      const commentModel = Comment.withId(id);

      if (!commentModel) {
        return commentModel;
      }

      return commentModel.lastActivityId;
    },
  );

export const selectLastCommentActivityIdById = makeSelectLastCommentActivityIdById();

export const makeSelectCommentActivitiesById = () =>
  createSelector(
    orm,
    (_, id) => id,
    (state) => selectCurrentUserId(state),
    ({ Comment }, id, currentUserId) => {
      if (!id) {
        return id;
      }

      const commentModel = Comment.withId(id);

      if (!commentModel) {
        return commentModel;
      }

      const activities = commentModel
        .getOrderedActivitiesQuerySet()
        .toModelArray()
        .map((activityModel) => ({
          ...getActivityDetails(activityModel, currentUserId),
        }));

      return activities;
    },
  );

export const selectCommentActivitiesById = makeSelectCommentActivitiesById();

export const makeSelectLastTaskActivityIdById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Task }, id) => {
      const taskModel = Task.withId(id);

      if (!taskModel) {
        return taskModel;
      }

      return taskModel.lastActivityId;
    },
  );

export const selectLastTaskActivityIdById = makeSelectLastTaskActivityIdById();

export const makeSelectTaskActivitiesById = () =>
  createSelector(
    orm,
    (_, id) => id,
    (state) => selectCurrentUserId(state),
    ({ Task }, id, currentUserId) => {
      if (!id) {
        return id;
      }

      const taskModel = Task.withId(id);

      if (!taskModel) {
        return taskModel;
      }

      const activities = taskModel
        .getOrderedActivitiesQuerySet()
        .toModelArray()
        .map((activityModel) => ({
          ...getActivityDetails(activityModel, currentUserId),
        }));

      return activities;
    },
  );

export const selectTaskActivitiesById = makeSelectTaskActivitiesById();

export const makeSelectLastCardActivityIdById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);

      if (!cardModel) {
        return cardModel;
      }

      return cardModel.lastActivityId;
    },
  );

export const selectLastCardActivityIdById = makeSelectLastCardActivityIdById();

export const makeSelectCardActivitiesById = () =>
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
        .getOrderedActivitiesQuerySet()
        .toModelArray()
        .map((activityModel) => ({
          ...getActivityDetails(activityModel, currentUserId),
        }));
    },
  );

export const selectCardActivitiesById = makeSelectCardActivitiesById();

export const makeSelectLastListActivityIdById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ List }, id) => {
      const listModel = List.withId(id);

      if (!listModel) {
        return listModel;
      }

      return listModel.lastActivityId;
    },
  );

export const selectLastListActivityIdById = makeSelectLastListActivityIdById();

export const makeSelectListActivitiesById = () =>
  createSelector(
    orm,
    (_, id) => id,
    (state) => selectCurrentUserId(state),
    ({ List }, id, currentUserId) => {
      const listModel = List.withId(id);

      if (!listModel) {
        return listModel;
      }

      return listModel
        .getOrderedActivitiesQuerySet()
        .toModelArray()
        .map((activityModel) => ({
          ...getActivityDetails(activityModel, currentUserId),
        }));
    },
  );

export const selectListActivitiesById = makeSelectListActivitiesById();

export const makeSelectLastBoardActivityIdById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Board }, id) => {
      if (!id) {
        return id;
      }

      const boardModel = Board.withId(id);

      if (!boardModel) {
        return boardModel;
      }

      return boardModel.lastActivityId;
    },
  );

export const selectLastBoardActivityIdById = makeSelectLastBoardActivityIdById();

export const makeSelectBoardActivitiesById = () =>
  createSelector(
    orm,
    (_, id) => id,
    (state) => selectCurrentUserId(state),
    ({ Board }, id, currentUserId) => {
      if (!id) {
        return id;
      }

      const boardModel = Board.withId(id);

      if (!boardModel) {
        return boardModel;
      }

      return boardModel
        .getOrderedActivitiesQuerySet()
        .toModelArray()
        .map((activityModel) => ({
          ...getActivityDetails(activityModel, currentUserId),
        }));
    },
  );

export const selectBoardActivitiesById = makeSelectBoardActivitiesById();

export const makeSelectLastProjectActivityIdById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Project }, id) => {
      if (!id) {
        return id;
      }

      const projectModel = Project.withId(id);

      if (!projectModel) {
        return projectModel;
      }

      return projectModel.lastActivityId;
    },
  );

export const selectLastProjectActivityIdById = makeSelectLastProjectActivityIdById();

export const makeSelectProjectActivitiesById = () =>
  createSelector(
    orm,
    (_, id) => id,
    (state) => selectCurrentUserId(state),
    ({ Project }, id, currentUserId) => {
      if (!id) {
        return id;
      }

      const projectModel = Project.withId(id);

      if (!projectModel) {
        return projectModel;
      }

      return projectModel
        .getOrderedActivitiesQuerySet()
        .toModelArray()
        .map((activityModel) => ({
          ...getActivityDetails(activityModel, currentUserId),
        }));
    },
  );

export const selectProjectActivitiesById = makeSelectProjectActivitiesById();

export const makeSelectLastUserActivityIdById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ User }, id) => {
      if (!id) {
        return id;
      }

      const userModel = User.withId(id);

      if (!userModel) {
        return userModel;
      }

      return userModel.lastUserActivityId;
    },
  );

export const selectLastUserActivityIdById = makeSelectLastUserActivityIdById();

export const makeSelectUserActivitiesById = () =>
  createSelector(
    orm,
    (_, id) => id,
    (state) => selectCurrentUserId(state),
    ({ User }, id, currentUserId) => {
      if (!id) {
        return id;
      }

      const userModel = User.withId(id);

      if (!userModel) {
        return userModel;
      }

      return userModel
        .getOrderedUserActivitiesQuerySet()
        .toModelArray()
        .map((activityModel) => ({
          ...getActivityDetails(activityModel, currentUserId),
        }));
    },
  );

export const selectUserActivitiesById = makeSelectUserActivitiesById();

export const makeSelectLastUserAccountActivityIdById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ User }, id) => {
      if (!id) {
        return id;
      }

      const userModel = User.withId(id);

      if (!userModel) {
        return userModel;
      }

      return userModel.lastUserAccountActivityId;
    },
  );

export const selectLastUserAccountActivityIdById = makeSelectLastUserAccountActivityIdById();

export const makeSelectUserAccountActivitiesById = () =>
  createSelector(
    orm,
    (_, id) => id,
    (state) => selectCurrentUserId(state),
    ({ User }, id, currentUserId) => {
      if (!id) {
        return id;
      }

      const userModel = User.withId(id);

      if (!userModel) {
        return userModel;
      }

      return userModel
        .getOrderedUserAccountActivitiesQuerySet()
        .toModelArray()
        .map((activityModel) => ({
          ...getActivityDetails(activityModel, currentUserId),
        }));
    },
  );

export const selectUserAccountActivitiesById = makeSelectUserAccountActivitiesById();

export const makeSelectLastInstanceActivityId = () =>
  createSelector(orm, ({ Core }) => {
    const instanceModel = Core.withId(0);

    if (!instanceModel) {
      return instanceModel;
    }

    return instanceModel.lastActivityId;
  });

export const selectLastInstanceActivityId = makeSelectLastInstanceActivityId();

export const makeSelectInstanceActivities = () =>
  createSelector(
    orm,
    (state) => selectCurrentUserId(state),
    ({ Core }, currentUserId) => {
      const instanceModel = Core.withId(0);

      if (!instanceModel) {
        return instanceModel;
      }

      return instanceModel
        .getOrderedActivitiesQuerySet()
        .toModelArray()
        .map((activityModel) => ({
          ...getActivityDetails(activityModel, currentUserId),
        }));
    },
  );

export const selectInstanceActivities = makeSelectInstanceActivities();

export default {
  makeSelectLastAttachmentActivityIdById,
  selectLastAttachmentActivityIdById,
  makeSelectAttachmentActivitiesById,
  selectAttachmentActivitiesById,
  makeSelectLastCommentActivityIdById,
  selectLastCommentActivityIdById,
  makeSelectCommentActivitiesById,
  selectCommentActivitiesById,
  makeSelectLastTaskActivityIdById,
  selectLastTaskActivityIdById,
  makeSelectTaskActivitiesById,
  selectTaskActivitiesById,
  makeSelectLastCardActivityIdById,
  selectLastCardActivityIdById,
  makeSelectCardActivitiesById,
  selectCardActivitiesById,
  makeSelectLastListActivityIdById,
  selectLastListActivityIdById,
  makeSelectListActivitiesById,
  selectListActivitiesById,
  makeSelectLastBoardActivityIdById,
  selectLastBoardActivityIdById,
  makeSelectBoardActivitiesById,
  selectBoardActivitiesById,
  makeSelectLastProjectActivityIdById,
  selectLastProjectActivityIdById,
  makeSelectProjectActivitiesById,
  selectProjectActivitiesById,
  makeSelectLastUserActivityIdById,
  selectLastUserActivityIdById,
  makeSelectUserActivitiesById,
  selectUserActivitiesById,
  makeSelectLastUserAccountActivityIdById,
  selectLastUserAccountActivityIdById,
  makeSelectUserAccountActivitiesById,
  selectUserAccountActivitiesById,
  makeSelectLastInstanceActivityId,
  selectLastInstanceActivityId,
  makeSelectInstanceActivities,
  selectInstanceActivities,
};
