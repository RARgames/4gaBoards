import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ListView from '../components/Board/ListView';
import { BoardMembershipRoles } from '../constants/Enums';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const makeMapStateToProps = () => {
  const selectFilteredCardIdsByListId = selectors.makeSelectFilteredCardIdsByListId();

  return (state, { listIds }) => {
    const currentCardId = selectors.selectPath(state).cardId;
    const { boardId } = selectors.selectPath(state);
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
        users: selectors.selectUsersForTaskById(state, task.id),
      }));
      const notificationsCount = selectors.selectNotificationsTotalByCardId(state, cardId);

      return {
        id: card.id,
        coverUrl: card.coverUrl,
        name: card.name,
        users,
        labels,
        listName: list.name,
        hasDescription: !!card.description,
        attachmentsCount,
        commentCount: card.commentCount,
        dueDate: card.dueDate || undefined, // undefined needed for TanStack Table sorting
        timer: card.timer || undefined, // undefined needed for TanStack Table sorting
        createdAt: card.createdAt,
        updatedAt: card.updatedAt || undefined, // undefined needed for TanStack Table sorting
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
    const { listViewStyle, listViewColumnVisibility, listViewFitScreen } = selectors.selectCurrentUserPrefs(state);
    const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    const isCurrentUserEditor = !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR;

    return {
      isCardModalOpened: !!currentCardId,
      currentCardId,
      boardId,
      filteredCards,
      isGithubConnected,
      githubRepo,
      lists,
      labelIds,
      memberIds,
      listViewStyle,
      listViewColumnVisibility,
      listViewFitScreen,
      canEdit: isCurrentUserEditor,
    };
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onCardCreate: entryActions.createCard,
      onListCreate: entryActions.createListInCurrentBoard,
      onUserPrefsUpdate: entryActions.updateCurrentUserPrefs,
    },
    dispatch,
  );

export default connect(makeMapStateToProps, mapDispatchToProps)(ListView);
