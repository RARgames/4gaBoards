import { createSelector } from 'redux-orm';

import orm from '../orm';
import getActivityDetails from '../utils/get-activity-details';
import { selectCurrentUserId } from './users';

export const makeSelectLastActivityIdByAttachmentId = () =>
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

export const selectLastActivityIdByAttachmentId = makeSelectLastActivityIdByAttachmentId();

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

export default {
  makeSelectLastActivityIdByAttachmentId,
  selectLastActivityIdByAttachmentId,
  makeSelectAttachmentActivitiesById,
  selectAttachmentActivitiesById,
};
