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

      const lastActivityModel = attachmentModel.getOrderedActivitiesQuerySet().last();

      return lastActivityModel && lastActivityModel.id;
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

      const lastActivityModel = commentModel.getOrderedActivitiesQuerySet().last();

      return lastActivityModel && lastActivityModel.id;
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

      const lastActivityModel = taskModel.getOrderedActivitiesQuerySet().last();

      return lastActivityModel && lastActivityModel.id;
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

      const lastActivityModel = cardModel.getOrderedCardActivitiesQuerySet().last();

      return lastActivityModel && lastActivityModel.id;
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
        .getOrderedCardActivitiesQuerySet()
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

      const lastActivityModel = listModel.getOrderedListActivitiesQuerySet().last();

      return lastActivityModel && lastActivityModel.id;
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
        .getOrderedListActivitiesQuerySet()
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

      const lastActivityModel = boardModel.getOrderedBoardActivitiesQuerySet().last();

      return lastActivityModel && lastActivityModel.id;
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
        .getOrderedBoardActivitiesQuerySet()
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

      const lastActivityModel = projectModel.getOrderedProjectActivitiesQuerySet().last();

      return lastActivityModel && lastActivityModel.id;
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
        .getOrderedProjectActivitiesQuerySet()
        .toModelArray()
        .map((activityModel) => ({
          ...getActivityDetails(activityModel, currentUserId),
        }));
    },
  );

export const selectProjectActivitiesById = makeSelectProjectActivitiesById();

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
};
