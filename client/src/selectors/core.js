import isUndefined from 'lodash/isUndefined';
import { createSelector } from 'redux-orm';

import Config from '../constants/Config';
import { SsoTypes } from '../constants/Enums';
import orm from '../orm';
import getMeta from '../utils/get-meta';
import { filterSidebarBoards, filterSidebarProjects } from '../utils/sidebar-filter';
import { selectCurrentUserId } from './users';

export const selectAccessToken = ({ auth: { accessToken } }) => accessToken;

export const selectIsCoreInitializing = ({ core: { isInitializing } }) => isInitializing;

export const selectIsLogouting = ({ core: { isLogouting } }) => isLogouting;

export const selectCoreSettings = createSelector(orm, ({ Core }) => {
  let coreModel = Core.withId(0);

  if (!coreModel) {
    const ssoAvailable = Object.values(SsoTypes).reduce((acc, type) => {
      acc[type] = false;
      return acc;
    }, {});
    const ssoUrls = Object.values(SsoTypes).reduce((acc, type) => {
      acc[type] = '';
      return acc;
    }, {});

    coreModel = {
      ssoRegistrationEnabled: false,
      localRegistrationEnabled: false,
      registrationEnabled: false,
      projectCreationAllEnabled: false,
      syncSsoDataOnAuth: false,
      syncSsoAdminOnAuth: false,
      allowedRegisterDomains: '',
      ssoUrls,
      ssoAvailable,
      oidcEnabledMethods: [],
      demoMode: false,
      mailServiceAvailable: false,
      mailServiceInboundEmail: '',
    };
    return coreModel;
  }

  return {
    ...coreModel.ref,
    ...getMeta(coreModel),
  };
});

const nextPosition = (items, index, excludedId) => {
  const filteredItems = isUndefined(excludedId) ? items : items.filter((item) => item.id !== excludedId);

  if (isUndefined(index)) {
    const lastItem = filteredItems[filteredItems.length - 1];

    return (lastItem ? lastItem.position : 0) + Config.POSITION_GAP;
  }

  const prevItem = filteredItems[index - 1];
  const nextItem = filteredItems[index];

  const prevPosition = prevItem ? prevItem.position : 0;

  if (!nextItem) {
    return prevPosition + Config.POSITION_GAP;
  }

  return prevPosition + (nextItem.position - prevPosition) / 2;
};

// Maps an index within the visible list
const toFullListIndex = (items, visibleItems, index, excludedId) => {
  const rest = items.filter((item) => item.id !== excludedId);
  const visibleRest = visibleItems.filter((item) => item.id !== excludedId);

  if (visibleRest.length === 0) return index;
  if (index < visibleRest.length) {
    return rest.findIndex((item) => item.id === visibleRest[index].id);
  }
  return rest.findIndex((item) => item.id === visibleRest[visibleRest.length - 1].id) + 1;
};

export const selectNextProjectPosition = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  (_, index) => index,
  (_, __, excludedId) => excludedId,
  ({ Project, User }, userId, index, excludedId) => {
    const projects = Project.all().orderBy('position').toRefArray();
    const userModel = isUndefined(index) ? undefined : User.withId(userId);

    if (!userModel) {
      return nextPosition(projects, index, excludedId);
    }

    const visibleProjects = filterSidebarProjects(
      userModel.getOrderedAvailableProjectsModelArray().map((projectModel) => ({
        id: projectModel.id,
        name: projectModel.name,
        boards: projectModel.getOrderedBoardsModelArrayAvailableForUser(userId).map((boardModel) => ({ id: boardModel.id, name: boardModel.name })),
      })),
      userModel.filter,
    );

    return nextPosition(projects, toFullListIndex(projects, visibleProjects, index, excludedId), excludedId);
  },
);

export const selectNextBoardPosition = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  (_, projectId) => projectId,
  (_, __, index) => index,
  (_, __, ___, excludedId) => excludedId,
  ({ Project, User }, userId, projectId, index, excludedId) => {
    const projectModel = Project.withId(projectId);

    if (!projectModel) {
      return projectModel;
    }

    const boards = projectModel.getOrderedBoardsQuerySet().toRefArray();
    const userModel = isUndefined(index) ? undefined : User.withId(userId);

    if (!userModel) {
      return nextPosition(boards, index, excludedId);
    }

    const visibleBoards = filterSidebarBoards(
      projectModel.getOrderedBoardsModelArrayAvailableForUser(userId).map((boardModel) => ({ id: boardModel.id, name: boardModel.name })),
      userModel.filter,
    );

    return nextPosition(boards, toFullListIndex(boards, visibleBoards, index, excludedId), excludedId);
  },
);

export const selectNextListPosition = createSelector(
  orm,
  (_, boardId) => boardId,
  (_, __, index) => index,
  (_, __, ___, excludedId) => excludedId,
  ({ Board }, boardId, index, excludedId) => {
    const boardModel = Board.withId(boardId);

    if (!boardModel) {
      return boardModel;
    }

    return nextPosition(boardModel.getOrderedListsQuerySet().toRefArray(), index, excludedId);
  },
);

export const selectNextCardPosition = createSelector(
  orm,
  (_, listId) => listId,
  (_, __, index) => index,
  (_, __, ___, excludedId) => excludedId,
  (_, __, ___, ____, isMovingcard) => isMovingcard,
  ({ List }, listId, index, excludedId, isMovingcard) => {
    const listModel = List.withId(listId);

    if (!listModel) {
      return listModel;
    }

    const cardsList = listModel.getOrderedCardsModelArray();
    const filteredCardsList = listModel.getFilteredOrderedCardsModelArray();
    const excludedFilteredCardsList = filteredCardsList.filter((el) => el.id !== excludedId);

    if (isMovingcard && listModel.getIsFiltered() && index <= excludedFilteredCardsList.length && !(index === 0 && excludedFilteredCardsList.length === 0)) {
      // this handles moveCard if filtering is on and card is not dropped onto AddCard button
      const elBeforeIndex = excludedFilteredCardsList[index - 1];
      const elAfterIndex = excludedFilteredCardsList[index];

      let listIndex = 0; // if there is no element before and no element after

      if (elAfterIndex) {
        listIndex = cardsList.findIndex((el) => el.id === elAfterIndex.id);
      } else if (elBeforeIndex) {
        listIndex = cardsList.findIndex((el) => el.id === elBeforeIndex.id) + 1;
      }

      return nextPosition(cardsList, listIndex, excludedId);
    }

    return nextPosition(cardsList, index, excludedId);
  },
);

export const selectNextTaskPosition = createSelector(
  orm,
  (_, cardId) => cardId,
  (_, __, index) => index,
  (_, __, ___, excludedId) => excludedId,
  ({ Card }, cardId, index, excludedId) => {
    const cardModel = Card.withId(cardId);

    if (!cardModel) {
      return cardModel;
    }

    return nextPosition(cardModel.getOrderedTasksQuerySet().toRefArray(), index, excludedId);
  },
);

export const makeSelectInstanceNotificationsTotal = () =>
  createSelector(orm, ({ Core }) => {
    const coreModel = Core.withId(0);
    if (!coreModel) {
      return coreModel;
    }

    return coreModel.getUnreadInstanceNotificationsModelArray().length;
  });

export const selectInstanceNotificationsTotal = makeSelectInstanceNotificationsTotal();

export const makeSelectUsersNotificationsTotal = () =>
  createSelector(orm, ({ Core }) => {
    const coreModel = Core.withId(0);
    if (!coreModel) {
      return coreModel;
    }

    return coreModel.getUnreadUsersNotificationsModelArray().length;
  });

export const selectUsersNotificationsTotal = makeSelectUsersNotificationsTotal();

export default {
  selectAccessToken,
  selectIsCoreInitializing,
  selectIsLogouting,
  selectCoreSettings,
  selectNextProjectPosition,
  selectNextBoardPosition,
  selectNextListPosition,
  selectNextCardPosition,
  selectNextTaskPosition,
  makeSelectInstanceNotificationsTotal,
  selectInstanceNotificationsTotal,
  makeSelectUsersNotificationsTotal,
  selectUsersNotificationsTotal,
};
