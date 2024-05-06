import { createSelector } from 'redux-orm';
import isUndefined from 'lodash/isUndefined';

import orm from '../orm';
import Config from '../constants/Config';

export const selectAccessToken = ({ auth: { accessToken } }) => accessToken;

export const selectIsCoreInitializing = ({ core: { isInitializing } }) => isInitializing;

export const selectIsLogouting = ({ core: { isLogouting } }) => isLogouting;

export const selectSsoEnabled = ({ core: { googleSsoEnabled } }) => googleSsoEnabled;

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

export const selectNextBoardPosition = createSelector(
  orm,
  (_, projectId) => projectId,
  (_, __, index) => index,
  (_, __, ___, excludedId) => excludedId,
  ({ Project }, projectId, index, excludedId) => {
    const projectModel = Project.withId(projectId);

    if (!projectModel) {
      return projectModel;
    }

    return nextPosition(projectModel.getOrderedBoardsQuerySet().toRefArray(), index, excludedId);
  },
);

export const selectNextLabelPosition = createSelector(
  orm,
  (_, boardId) => boardId,
  (_, __, index) => index,
  (_, __, ___, excludedId) => excludedId,
  ({ Board }, boardId, index, excludedId) => {
    const boardModel = Board.withId(boardId);

    if (!boardModel) {
      return boardModel;
    }

    return nextPosition(boardModel.getOrderedLabelsQuerySet().toRefArray(), index, excludedId);
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

    if (isMovingcard && listModel.getIsFiltered() && index <= filteredCardsList.length) {
      // this handles moveCard if filtering is on and card is not dropped onto AddCard button
      // TODO index <= filteredCardsList.length - hacky way not to handle dropping onto AddCard button

      const elBeforeIndex = filteredCardsList[index - 1];
      const elAfterIndex = filteredCardsList[index];

      let listIndex = 0; // if there is no element before and no element after
      if ((elBeforeIndex && elAfterIndex) || elBeforeIndex) {
        const listIndexBeforeIndex = cardsList.findIndex((el) => el.id === elBeforeIndex.id);
        listIndex = listIndexBeforeIndex + 1;
      } else {
        const listIndexAfterIndex = cardsList.findIndex((el) => el.id === elAfterIndex.id);
        listIndex = listIndexAfterIndex;
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

export default {
  selectAccessToken,
  selectIsCoreInitializing,
  selectIsLogouting,
  selectSsoEnabled,
  selectNextBoardPosition,
  selectNextLabelPosition,
  selectNextListPosition,
  selectNextCardPosition,
  selectNextTaskPosition,
};
