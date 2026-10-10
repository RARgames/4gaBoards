import React, { useEffect, useState } from 'react';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import PropTypes from 'prop-types';

import DroppableTypes from '../../constants/DroppableTypes';
import BoardActionsContainer from '../../containers/BoardActionsContainer';
import BoardViewContainer from '../../containers/BoardViewContainer';
import CardModalContainer from '../../containers/CardModalContainer';
import ListViewContainer from '../../containers/ListViewContainer';
import { dropAnimation } from '../../lib/hooks/use-drop-animation';

import * as s from './Board.module.scss';

const Board = React.memo(({ id, isCardModalOpened, defaultView }) => {
  const [viewMode, setViewMode] = useState(defaultView);

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
  isCardModalOpened: PropTypes.bool.isRequired,
  defaultView: PropTypes.string.isRequired,
};
export default Board;
