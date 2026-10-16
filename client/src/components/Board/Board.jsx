import React, { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import PropTypes from 'prop-types';

import DroppableTypes from '../../constants/DroppableTypes';
import Paths from '../../constants/Paths';
import BoardActionsContainer from '../../containers/BoardActionsContainer';
import BoardViewContainer from '../../containers/BoardViewContainer';
import CardModalContainer from '../../containers/CardModalContainer';
import ListViewContainer from '../../containers/ListViewContainer';
import { dropAnimation } from '../../lib/hooks/use-drop-animation';
import { withPathView, getPathView } from '../../utils/path-view';

import * as s from './Board.module.scss';

const Board = React.memo(({ id, cardId, isCardModalOpened, pathView, defaultView }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const viewMode = pathView || defaultView;

  const setViewMode = useCallback((view) => navigate(withPathView(cardId ? Paths.CARDS.replace(':id', cardId) : Paths.BOARDS.replace(':id', id), view)), [navigate, id, cardId]);

  // Remove unknown/malformed view segments
  useEffect(() => {
    const currentView = getPathView(pathname);
    if (currentView === null) {
      navigate(withPathView(pathname, null), { replace: true });
    }
  }, [pathname, navigate]);

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
      <BoardActionsContainer boardId={id} viewMode={viewMode} onViewModeChange={setViewMode} />
      <div className={s.wrapper}>
        {viewMode === 'board' ? <BoardViewContainer /> : <ListViewContainer />}
        {isCardModalOpened && <CardModalContainer />}
      </div>
    </div>
  );
});

Board.propTypes = {
  id: PropTypes.string.isRequired,
  cardId: PropTypes.string,
  isCardModalOpened: PropTypes.bool.isRequired,
  pathView: PropTypes.string,
  defaultView: PropTypes.string.isRequired,
};

Board.defaultProps = {
  cardId: undefined,
  pathView: null,
};
export default Board;
