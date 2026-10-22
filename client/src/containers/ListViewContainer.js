import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ListView from '../components/Board/ListView';
import { BoardMembershipRoles } from '../constants/Enums';
import entryActions from '../entry-actions';
import { push } from '../lib/redux-router';
import selectors from '../selectors';

const makeMapStateToProps = () => {
  const selectFilteredCardIdsByListId = selectors.makeSelectFilteredCardIdsByListId();
  const selectClosestDueDateByCardId = selectors.makeSelectClosestDueDateByCardId();
  const selectUsersForTaskById = selectors.makeSelectUsersForTaskById();
  const selectTaskActivitiesById = selectors.makeSelectTaskActivitiesById();

  return (state) => {
    const listIds = selectors.selectListIdsForCurrentBoard(state);
    const currentCardId = selectors.selectPath(state).cardId;
    const filteredCardIds = listIds.reduce((acc, id) => {
      const filteredCardIdsPart = selectFilteredCardIdsByListId(state, id);
      return acc.concat(filteredCardIdsPart);
    }, []);

    const filteredCards = filteredCardIds.map((cardId) => {
      const card = selectors.selectCardById(state, cardId);
      const list = selectors.selectListById(state, card.listId);
      const users = selectors.selectUsersByCardId(state, cardId);
      const labels = selectors.selectLabelsByCardId(state, cardId);
      const attachmentsCount = selectors.selectAttachmentsCountByCardId(state, cardId);
      const tasks = selectors.selectTasksByCardId(state, cardId).map((task) => ({
        ...task,
        users: selectUsersForTaskById(state, task.id),
        activities: selectTaskActivitiesById(state, task.id),
      }));
      const notificationsCount = selectors.selectNotificationsTotalByCardId(state, cardId);
      const closestDueDate = selectClosestDueDateByCardId(state, cardId);

      return {
        id: card.id,
        coverUrl: card.coverUrl,
        name: card.name,
        isCompleted: card.isCompleted,
        users,
        labels,
        listName: list.name,
        hasDescription: !!card.description,
        attachmentsCount,
        commentCount: card.commentCount,
        dueDate: card.dueDate || undefined, // undefined needed for TanStack Table sorting
        completedAt: card.completedAt || undefined, // undefined needed for TanStack Table sorting
        closestDueDate: closestDueDate || undefined, // undefined needed for TanStack Table sorting
        timer: card.timer || undefined, // undefined needed for TanStack Table sorting
        createdAt: card.createdAt,
        createdBy: card.createdBy,
        updatedAt: card.updatedAt || undefined, // undefined needed for TanStack Table sorting
        updatedBy: card.updatedBy || undefined, // undefined needed for TanStack Table sorting
        tasks,
        notificationsCount,
        description: card.description,
        isPersisted: card.isPersisted,
      };
    });

    const { isGithubConnected, githubRepo } = selectors.selectCurrentBoard(state);
    const lists = listIds.map((id) => {
      return selectors.selectListById(state, id);
    });
    const labelIds = selectors.selectLabelsForCurrentBoard(state);
    const memberIds = selectors.selectMembershipsForCurrentBoard(state);
    const { listViewStyle, listViewColumnVisibility, listViewFitScreen, listViewItemsPerPage, showFullDueDates, selfAssignBySpacebar, rightClickContextMenu } = selectors.selectCurrentUserPrefs(state);
    const currentCardIndex = filteredCards.findIndex((card) => card.id === currentCardId);
    const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    const isCurrentUserEditor = !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR;
    const { preferredDetailsFont } = selectors.selectCurrentUserPrefs(state);
    const allBoardMemberships = selectors.selectMembershipsForCurrentBoard(state);
    const pathname = selectors.selectPathname(state);
    const currentUserId = selectors.selectCurrentUserId(state);

    return {
      isCardModalOpened: !!currentCardId,
      currentCardId,
      filteredCards,
      isGithubConnected,
      githubRepo,
      lists,
      labelIds,
      memberIds,
      listViewStyle,
      listViewColumnVisibility,
      listViewFitScreen,
      listViewItemsPerPage,
      showFullDueDates,
      selfAssignBySpacebar,
      rightClickContextMenu,
      currentCardIndex,
      canEdit: isCurrentUserEditor,
      preferredDetailsFont,
      allBoardMemberships,
      pathname,
      currentUserId,
    };
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onCardCreate: entryActions.createCard,
      onListCreate: entryActions.createListInCurrentBoard,
      onUserPrefsUpdate: entryActions.updateCurrentUserPrefs,
      onNavigatePush: push,
      onUserAdd: (userId, cardId) => entryActions.addUserToCard(userId, cardId),
      onUserRemove: (userId, cardId) => entryActions.removeUserFromCard(userId, cardId),
    },
    dispatch,
  );

export default connect(makeMapStateToProps, mapDispatchToProps)(ListView);
