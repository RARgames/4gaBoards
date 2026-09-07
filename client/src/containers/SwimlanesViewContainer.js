import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import SwimlanesView from '../components/Board/Swimlanes';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const makeMapStateToProps = () => {
  const selectListById = selectors.makeSelectListById();

  const selectFilteredCardIdsByListId = selectors.makeSelectFilteredCardIdsByListId();

  return (state) => {
    const { boardId } = selectors.selectPath(state);
    const listIds = selectors.selectListIdsForCurrentBoard(state) || [];
    const selectedCardIds = selectors.selectSelectedCardIds(state);

    const lists = listIds.map((id) => {
      const list = selectListById(state, id);
      const cardIds = selectFilteredCardIdsByListId(state, id);
      const selectedCount = cardIds.filter((cardId) => selectedCardIds.includes(cardId)).length;

      return {
        id,
        name: list ? list.name : '',
        hasCards: cardIds.length > 0,
        isAllSelected: cardIds.length > 0 && selectedCount === cardIds.length,
        isSomeSelected: selectedCount > 0,
      };
    });
    const swimlanes = selectors.selectSwimlanesForCurrentBoard(state) || [];

    return {
      boardId,
      lists,
      swimlanes,
      isSelectionActive: selectedCardIds.length > 0,
    };
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onCardMove: entryActions.moveCardToSwimlane,
      onSelectAllToggle: (listId) => entryActions.toggleListCardSelection(listId),
    },
    dispatch,
  );

export default connect(makeMapStateToProps, mapDispatchToProps)(SwimlanesView);
