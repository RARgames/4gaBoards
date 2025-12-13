import { createSelector } from 'redux-orm';

import orm from '../orm';
import getActivityDetails from '../utils/get-activity-details';
import getMeta from '../utils/get-meta';
import { isLocalId } from '../utils/local-id';
import { selectCurrentUserId } from './users';

export const makeSelectListById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ List }, id) => {
      const listModel = List.withId(id);

      if (!listModel) {
        return listModel;
      }

      return {
        ...listModel.ref,
        ...getMeta(listModel),
        isPersisted: !isLocalId(id),
      };
    },
  );

export const selectListById = makeSelectListById();

export const makeSelectCardIdsByListId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ List }, id) => {
      const listModel = List.withId(id);

      if (!listModel) {
        return listModel;
      }

      return listModel.getOrderedCardsModelArray().map((cardModel) => cardModel.id);
    },
  );

export const selectCardIdsByListId = makeSelectCardIdsByListId();

export const makeSelectIsFilteredByListId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ List }, id) => {
      const listModel = List.withId(id);

      if (!listModel) {
        return listModel;
      }

      return listModel.getIsFiltered();
    },
  );

export const selectIsFilteredByListId = makeSelectIsFilteredByListId();

export const makeSelectFilteredCardIdsByListId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ List }, id) => {
      const listModel = List.withId(id);

      if (!listModel) {
        return listModel;
      }

      return listModel.getFilteredOrderedCardsModelArray().map((cardModel) => cardModel.id);
    },
  );

export const selectFilteredCardIdsByListId = makeSelectFilteredCardIdsByListId();

export const makeSelectActivitiesByListId = () =>
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

export const selectActivitiesByListId = makeSelectActivitiesByListId();

export const makeSelectLastActivityIdByListId = () =>
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

export const selectLastActivityIdByListId = makeSelectLastActivityIdByListId();

export const makeSelectNotificationsByListId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ List }, id) => {
      if (!id) {
        return id;
      }

      const listModel = List.withId(id);

      if (!listModel) {
        return listModel;
      }

      return listModel.getUnreadNotificationsQuerySet().toRefArray();
    },
  );

export const selectNotificationsByListId = makeSelectNotificationsByListId();

export const makeSelectNotificationsTotalByListId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ List }, id) => {
      if (!id) {
        return id;
      }

      const listModel = List.withId(id);

      if (!listModel) {
        return listModel;
      }

      return listModel.getUnreadNotificationsQuerySet().count();
    },
  );

export const selectNotificationsTotalByListId = makeSelectNotificationsTotalByListId();

export default {
  makeSelectListById,
  selectListById,
  makeSelectCardIdsByListId,
  selectCardIdsByListId,
  makeSelectIsFilteredByListId,
  selectIsFilteredByListId,
  makeSelectFilteredCardIdsByListId,
  selectFilteredCardIdsByListId,
  makeSelectActivitiesByListId,
  selectActivitiesByListId,
  makeSelectLastActivityIdByListId,
  selectLastActivityIdByListId,
  makeSelectNotificationsByListId,
  selectNotificationsByListId,
  makeSelectNotificationsTotalByListId,
  selectNotificationsTotalByListId,
};
