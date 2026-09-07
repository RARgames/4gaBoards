import React, { useCallback, useState, useTransition } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import DroppableTypes from '../../../constants/DroppableTypes';
import SwimlaneCellContainer from '../../../containers/SwimlaneCellContainer';
import { useLocalStorage } from '../../../hooks';
import User from '../../User';
import { Button, ButtonStyle, Checkbox, CheckboxSize, Icon, IconType, IconSize } from '../../Utils';

import * as gs from '../../../global.module.scss';
import * as s from './Swimlanes.module.scss';

// "Small List (3 cards)" -> "SM (3)". If the name has no trailing "(N ...)" parenthetical,
// returns just the uppercased first two characters (e.g. "Backlog" -> "BA").
const abbreviateListName = (name) => {
  const trimmed = (name || '').trim();
  const parenMatch = trimmed.match(/^(.*?)\s*\((\d+)[^)]*\)\s*$/);
  if (parenMatch) {
    const prefix = parenMatch[1].trim().slice(0, 2).toUpperCase();
    return prefix ? `${prefix} (${parenMatch[2]})` : `(${parenMatch[2]})`;
  }
  return trimmed.slice(0, 2).toUpperCase();
};

const SwimlanesView = React.memo(({ boardId, lists, swimlanes, isSelectionActive, onCardMove, onSelectAllToggle }) => {
  const [t] = useTranslation();
  const [setCollapsed, getCollapsed] = useLocalStorage(`swimlanes-collapsed-${boardId}`);
  const [setCollapsedCols, getCollapsedCols] = useLocalStorage(`swimlanes-collapsed-cols-${boardId}`);
  const [collapsedLanes, setCollapsedLanes] = useState(() => getCollapsed() || {});
  const [collapsedColumns, setCollapsedColumns] = useState(() => getCollapsedCols() || {});
  // Expanding a large column re-mounts a SwimlaneCell that may have to render hundreds of
  // Card + Draggable instances. Wrapping the toggle in a transition lets React keep the page
  // responsive (header swaps instantly, cards render at a lower priority).
  const [isExpansionPending, startExpansionTransition] = useTransition();

  const handleToggleLane = useCallback(
    (laneId) => {
      startExpansionTransition(() => {
        setCollapsedLanes((prev) => {
          const next = { ...prev, [laneId]: !prev[laneId] };
          setCollapsed(next);
          return next;
        });
      });
    },
    [setCollapsed],
  );

  const handleToggleColumn = useCallback(
    (listId, event) => {
      if (event) {
        event.stopPropagation();
      }
      startExpansionTransition(() => {
        setCollapsedColumns((prev) => {
          const next = { ...prev, [listId]: !prev[listId] };
          setCollapsedCols(next);
          return next;
        });
      });
    },
    [setCollapsedCols],
  );

  const handleDragEnd = useCallback(
    ({ draggableId, type, source, destination }) => {
      if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
        return;
      }
      if (type !== DroppableTypes.CARD) {
        return;
      }

      const cardId = draggableId.split(':')[1];
      const [, listId, laneId] = destination.droppableId.split(':');
      onCardMove(cardId, listId, laneId, destination.index);
    },
    [onCardMove],
  );

  const columnsTemplate = lists.map((list) => (collapsedColumns[list.id] ? 'var(--swimlaneColumnCollapsedWidth)' : 'var(--swimlaneColumnWidth)')).join(' ');
  const gridStyle = { gridTemplateColumns: `var(--swimlaneHeaderWidth) ${columnsTemplate}` };

  return (
    <div className={clsx(s.wrapper, gs.scrollableX, gs.scrollableY, isExpansionPending && s.wrapperPending)}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className={s.grid} style={gridStyle}>
          <div className={clsx(s.headerCell, s.cornerCell)} />
          {lists.map((list) => {
            const isColCollapsed = !!collapsedColumns[list.id];

            return (
              <div key={list.id} className={clsx(s.headerCell, s.listHeaderCell, isColCollapsed && s.listHeaderCellCollapsed)} title={list.name}>
                {/* Select-all for the column — same contextual rule as the board view's list header. */}
                {isSelectionActive && !isColCollapsed && (
                  <Checkbox
                    size={CheckboxSize.Size14}
                    checked={list.isAllSelected}
                    disabled={!list.hasCards}
                    title={t(list.isAllSelected ? 'common.deselectAllCardsInList' : 'common.selectAllCardsInList')}
                    className={s.columnSelectCheckbox}
                    ref={(element) => {
                      if (element) {
                        // eslint-disable-next-line no-param-reassign
                        element.indeterminate = list.isSomeSelected && !list.isAllSelected;
                      }
                    }}
                    onChange={() => onSelectAllToggle(list.id)}
                  />
                )}
                <Button style={ButtonStyle.Icon} title={list.name} onClick={(event) => handleToggleColumn(list.id, event)} className={s.columnToggleButton}>
                  <Icon type={IconType.TriangleDown} size={IconSize.Size8} className={clsx(s.columnToggleIcon, isColCollapsed && s.columnToggleIconCollapsed)} />
                  <span className={s.listName}>{isColCollapsed ? abbreviateListName(list.name) : list.name}</span>
                </Button>
              </div>
            );
          })}
          {swimlanes.map((lane) => {
            const isCollapsed = !!collapsedLanes[lane.id];

            return (
              <React.Fragment key={lane.id}>
                <div className={clsx(s.laneHeaderCell, isCollapsed && s.laneHeaderCellCollapsed)}>
                  <Button style={ButtonStyle.Icon} title={lane.isUnassigned ? t('common.unassigned') : lane.user.name} onClick={() => handleToggleLane(lane.id)} className={s.laneToggleButton}>
                    <Icon type={IconType.TriangleDown} size={IconSize.Size8} className={clsx(isCollapsed && s.laneToggleIconCollapsed)} />
                    {!lane.isUnassigned && <User name={lane.user.name} avatarUrl={lane.user.avatarUrl} size="card" />}
                    <span className={s.laneName}>{lane.isUnassigned ? t('common.unassigned') : lane.user.name}</span>
                  </Button>
                </div>
                {!isCollapsed &&
                  lists.map((list) =>
                    collapsedColumns[list.id] ? <div key={list.id} className={s.collapsedCell} /> : <SwimlaneCellContainer key={list.id} listId={list.id} laneId={lane.id} />,
                  )}
              </React.Fragment>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
});

SwimlanesView.propTypes = {
  boardId: PropTypes.string.isRequired,
  lists: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  swimlanes: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isSelectionActive: PropTypes.bool,
  onCardMove: PropTypes.func.isRequired,
  onSelectAllToggle: PropTypes.func.isRequired,
};

SwimlanesView.defaultProps = {
  isSelectionActive: false,
};

export default SwimlanesView;
