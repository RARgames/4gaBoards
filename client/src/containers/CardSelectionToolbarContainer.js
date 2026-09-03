import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import CardSelectionToolbar from '../components/Board/CardSelectionToolbar';
import entryActions from '../entry-actions';
import selectors from '../selectors';

// The move step starts on the current project/board but with no list picked: a multi-selection
// can span lists, so there is no meaningful "current" list to preselect, and leaving it empty
// also means picking any list counts as a change (CardMoveStep no-ops on the default one).
const mapStateToProps = (state) => {
  const { projectId, boardId } = selectors.selectPath(state);
  const cardIds = selectors.selectSelectedCardIds(state);

  const cards = cardIds
    .map((id) => {
      const card = selectors.selectCardById(state, id);

      if (!card) {
        return null;
      }

      return {
        id,
        name: card.name,
        url: selectors.selectUrlForCard(state, id),
      };
    })
    .filter(Boolean);

  return {
    boardId,
    cards,
    defaultPath: {
      projectId,
      boardId,
      listId: null,
    },
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onUpdate: (ids, data) => entryActions.updateCards(ids, data),
      onMove: (ids, listId) => entryActions.moveCards(ids, listId),
      onTransfer: (ids, boardId, listId) => entryActions.transferCards(ids, boardId, listId),
      onArchive: (ids) => entryActions.archiveCards(ids),
      onDelete: (ids) => entryActions.deleteCards(ids),
      onClear: () => entryActions.clearCardSelection(),
      onBoardFetch: entryActions.fetchBoard,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(CardSelectionToolbar);
