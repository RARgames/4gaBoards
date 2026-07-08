import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import CardDetailPanel from '../../components/Project/Timeline/CardDetailPanel';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state, { cardId }) => {
  const card = selectors.selectCardById(state, cardId);

  if (!card) {
    return { card: null };
  }

  const board = selectors.selectBoardById(state, card.boardId);
  const list = selectors.selectListById(state, card.listId);
  const labels = selectors.selectLabelsByCardId(state, cardId);
  const users = selectors.selectUsersByCardId(state, cardId);

  return {
    card,
    boardName: board && board.name,
    listName: list && list.name,
    labels,
    users,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onUpdate: entryActions.updateCard,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(CardDetailPanel);
