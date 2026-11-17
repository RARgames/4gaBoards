import React, { useCallback, useEffect } from 'react';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import PropTypes from 'prop-types';

import DroppableTypes from '../../constants/DroppableTypes';
import Paths from '../../constants/Paths';
import BoardActionsContainer from '../../containers/BoardActionsContainer';
import BoardViewContainer from '../../containers/BoardViewContainer';
import CardModalContainer from '../../containers/CardModalContainer';
import ListViewContainer from '../../containers/ListViewContainer';
import { dropAnimation } from '../../lib/hooks/use-drop-animation';
import { withPathView, getPathView, stripPathView } from '../../utils/path-view';
import Background from '../Background';

import * as s from './Board.module.scss';

const Board = React.memo(({ id, board, cardId, isCardModalOpened, pathname, pathView, defaultView, onNavigatePush, onNavigateReplace }) => {
  const viewMode = pathView || defaultView;

  const setViewMode = useCallback((view) => onNavigatePush(withPathView(cardId ? Paths.CARDS.replace(':id', cardId) : Paths.BOARDS.replace(':id', id), view)), [onNavigatePush, id, cardId]);

  // Remove unknown/malformed view segments
  useEffect(() => {
    if (getPathView(pathname) === null && stripPathView(pathname) !== pathname) {
      onNavigateReplace(stripPathView(pathname));
    }
  }, [pathname, onNavigateReplace]);

  useEffect(
    () =>
      monitorForElements({
        canMonitor: ({ source }) => source.data.type !== DroppableTypes.PROJECT && source.data.type !== DroppableTypes.BOARD, // Sidebar projects/boards have their own drop animation handling
        onGenerateDragPreview: dropAnimation.onGenerateDragPreview,
        onDragStart: dropAnimation.onDragStart,
        onDrag: dropAnimation.onDrag,
        onDrop(args) {
          dropAnimation.onDrop(args);
        },
      }),
    [],
  );

  return (
    <div className={s.container}>
      {board?.background && <Background type={board.background.type} name={board.background.name} imageUrl={board.backgroundImage?.url} />}
      <BoardActionsContainer boardId={id} viewMode={viewMode} onViewModeChange={setViewMode} />
      <div className={s.wrapper}>
        {viewMode === 'board' ? <BoardViewContainer isCustomBackground={!!board?.background} /> : <ListViewContainer />}
        {isCardModalOpened && <CardModalContainer />}
      </div>
    </div>
  );
});

Board.propTypes = {
  id: PropTypes.string.isRequired,
  board: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  cardId: PropTypes.string,
  isCardModalOpened: PropTypes.bool.isRequired,
  pathname: PropTypes.string.isRequired,
  pathView: PropTypes.string,
  defaultView: PropTypes.string.isRequired,
  onNavigatePush: PropTypes.func.isRequired,
  onNavigateReplace: PropTypes.func.isRequired,
};

Board.defaultProps = {
  cardId: undefined,
  pathView: null,
};
export default Board;
