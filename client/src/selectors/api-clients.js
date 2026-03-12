import { createSelector } from 'redux-orm';

import orm from '../orm';
import { selectCurrentUserId } from './users';

export const makeSelectApiClientsForCurrentUser = () =>
  createSelector(
    orm,
    (state) => selectCurrentUserId(state),
    ({ User }, id) => {
      if (!id) {
        return id;
      }

      const userModel = User.withId(id);
      if (!userModel) {
        return userModel;
      }

      const apiClients = userModel
        .getOrderedApiClientsQuerySet()
        .toModelArray()
        .map((apiClientModel) => ({
          ...apiClientModel.ref,
          user: apiClientModel.user.ref,
        }));

      return apiClients;
    },
  );

export const selectApiClientsForCurrentUser = makeSelectApiClientsForCurrentUser();

export const makeSelectApiClientCountForCurrentUser = () =>
  createSelector(
    orm,
    (state) => selectCurrentUserId(state),
    ({ User }, id) => {
      if (!id) {
        return id;
      }

      const userModel = User.withId(id);
      if (!userModel) {
        return userModel;
      }

      return userModel.getOrderedApiClientsQuerySet().count();
    },
  );

export const selectApiClientCountForCurrentUser = makeSelectApiClientCountForCurrentUser();

export default {
  makeSelectApiClientsForCurrentUser,
  selectApiClientsForCurrentUser,
  makeSelectApiClientCountForCurrentUser,
  selectApiClientCountForCurrentUser,
};
