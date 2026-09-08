import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import List from '../components/List';
import { BoardMembershipRoles } from '../constants/Enums';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const makeMapStateToProps = () => {
  const selectListById = selectors.makeSelectListById();
  const selectCardIdsByListId = selectors.makeSelectCardIdsByListId();
  const selectIsFilteredByListId = selectors.makeSelectIsFilteredByListId();
  const selectFilteredCardIdsByListId = selectors.makeSelectFilteredCardIdsByListId();
  const selectCompletedAtByCardIdForListId = selectors.makeSelectCompletedAtByCardIdForListId();

  return (state, { id, index }) => {
    const { boardId } = selectors.selectPath(state);
    const { name, isPersisted, isCollapsed, type, wipLimit, autoArchiveDays, createdAt, createdBy, updatedAt, updatedBy } = selectListById(state, id);
    const cardIds = selectCardIdsByListId(state, id);
    const isFiltered = selectIsFilteredByListId(state, id);
    const filteredCardIds = selectFilteredCardIdsByListId(state, id);
    const completedAtByCardId = type === 'done' ? selectCompletedAtByCardIdForListId(state, id) : undefined;
    const labelIds = selectors.selectLabelsForCurrentBoard(state);
    const memberIds = selectors.selectMembershipsForCurrentBoard(state);
    const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    const boardMemberships = selectors.selectMembershipsForCurrentBoard(state);

    const isCurrentUserEditor = !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR;

    const selectedCardIds = selectors.selectSelectedCardIds(state);
    const selectedInListCount = filteredCardIds.filter((cardId) => selectedCardIds.includes(cardId)).length;

    return {
      id,
      index,
      boardId,
      name,
      isCollapsed,
      isPersisted,
      type,
      wipLimit,
      autoArchiveDays,
      cardIds,
      isFiltered,
      filteredCardIds,
      completedAtByCardId,
      labelIds,
      memberIds,
      canEdit: isCurrentUserEditor,
      createdAt,
      createdBy,
      updatedAt,
      updatedBy,
      boardMemberships,
      isSelectionActive: selectedCardIds.length > 0,
      // Only the done column needs the ids themselves (for its per-bucket select-all). The
      // array reference is stable between selection changes, so handing it over doesn't make
      // this list re-render on unrelated actions.
      selectedCardIds: type === 'done' ? selectedCardIds : undefined,
      isAllCardsSelected: filteredCardIds.length > 0 && selectedInListCount === filteredCardIds.length,
      isSomeCardsSelected: selectedInListCount > 0,
    };
  };
};

const mapDispatchToProps = (dispatch, { id }) =>
  bindActionCreators(
    {
      onUpdate: (data) => entryActions.updateList(id, data),
      onDelete: () => entryActions.deleteList(id),
      onCardCreate: (data, autoOpen, index) => entryActions.createCard(id, data, autoOpen, index),
      onSelectAllToggle: () => entryActions.toggleListCardSelection(id),
      onGroupSelectToggle: (cardIds) => entryActions.toggleCardsSelection(cardIds),
      onArchiveAll: (cardIds) => entryActions.archiveCards(cardIds),
    },
    dispatch,
  );

export default connect(makeMapStateToProps, mapDispatchToProps)(List);
