import { createSelector } from 'redux-orm';

import orm from '../orm';
import { selectCurrentUserId } from './users';

export const makeSelectProjectMembershipById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ ProjectMembership }, id) => {
      const projectMembershipModel = ProjectMembership.withId(id);

      if (!projectMembershipModel) {
        return projectMembershipModel;
      }

      return projectMembershipModel.ref;
    },
  );

export const selectProjectMembershipById = makeSelectProjectMembershipById();

export const makeSelectCurrentUserMembershipForProject = () =>
  createSelector(
    orm,
    (_, projectId) => projectId,
    (state) => selectCurrentUserId(state),
    ({ ProjectMembership }, projectId, currentUserId) => {
      const projectMembershipModel = ProjectMembership.filter({ projectId, userId: currentUserId }).first();

      if (!projectMembershipModel) {
        return projectMembershipModel;
      }

      return projectMembershipModel.ref;
    },
  );

export const selectCurrentUserMembershipForProject = makeSelectCurrentUserMembershipForProject();

export default {
  makeSelectProjectMembershipById,
  selectProjectMembershipById,
  makeSelectCurrentUserMembershipForProject,
  selectCurrentUserMembershipForProject,
};
