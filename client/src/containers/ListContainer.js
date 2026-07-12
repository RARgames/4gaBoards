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
    };
  };
};

const mapDispatchToProps = (dispatch, { id }) =>
  bindActionCreators(
    {
      onUpdate: (data) => entryActions.updateList(id, data),
      onDelete: () => entryActions.deleteList(id),
      onCardCreate: (data, autoOpen, index) => entryActions.createCard(id, data, autoOpen, index),
    },
    dispatch,
  );

export default connect(makeMapStateToProps, mapDispatchToProps)(List);
