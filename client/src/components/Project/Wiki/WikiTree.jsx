import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Link } from 'react-router';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import Config from '../../../constants/Config';
import Paths from '../../../constants/Paths';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../../Utils';

import * as s from './WikiTree.module.scss';

const DROPPABLE_TYPE = 'WIKI_PAGE_TREE';
const ROOT_DROPPABLE_ID = 'wiki-root';

const buildChildrenByParentId = (pages) => {
  const childrenByParentId = {};

  pages.forEach((page) => {
    const key = page.parentId || ROOT_DROPPABLE_ID;
    (childrenByParentId[key] || (childrenByParentId[key] = [])).push(page);
  });

  Object.keys(childrenByParentId).forEach((key) => {
    childrenByParentId[key].sort((a, b) => a.position - b.position);
  });

  return childrenByParentId;
};

const droppableIdFor = (parentId) => `wiki-parent:${parentId || ROOT_DROPPABLE_ID}`;

const parseDroppableId = (droppableId) => {
  const raw = droppableId.replace('wiki-parent:', '');
  return raw === ROOT_DROPPABLE_ID ? null : raw;
};

const WikiTree = React.memo(({ projectId, pages, currentSlug, canEdit, onCreate, onUpdate }) => {
  const [t] = useTranslation();
  const [collapsedIds, setCollapsedIds] = useState(() => new Set());

  const childrenByParentId = useMemo(() => buildChildrenByParentId(pages), [pages]);

  const handleToggleCollapse = useCallback((id) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleDragEnd = useCallback(
    ({ draggableId, source, destination }) => {
      if (!destination) {
        return;
      }

      const sourceParentId = parseDroppableId(source.droppableId);
      const destinationParentId = parseDroppableId(destination.droppableId);

      if (sourceParentId === destinationParentId && source.index === destination.index) {
        return;
      }

      const destinationSiblings = (childrenByParentId[destinationParentId || ROOT_DROPPABLE_ID] || []).filter((page) => page.id !== draggableId);

      const prevPage = destinationSiblings[destination.index - 1];
      const nextPage = destinationSiblings[destination.index];

      let position;
      if (!prevPage && !nextPage) {
        position = Config.POSITION_GAP;
      } else if (!nextPage) {
        position = prevPage.position + Config.POSITION_GAP;
      } else if (!prevPage) {
        position = nextPage.position / 2;
      } else {
        position = prevPage.position + (nextPage.position - prevPage.position) / 2;
      }

      onUpdate(draggableId, {
        parentId: destinationParentId || null,
        position,
      });
    },
    [childrenByParentId, onUpdate],
  );

  const renderLevel = (parentId, depth) => {
    const children = childrenByParentId[parentId || ROOT_DROPPABLE_ID] || [];

    return (
      <Droppable droppableId={droppableIdFor(parentId)} type={DROPPABLE_TYPE}>
        {(provided) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {children.map((page, index) => {
              const isCollapsed = collapsedIds.has(page.id);
              const hasChildren = !!childrenByParentId[page.id];

              return (
                <Draggable key={page.id} draggableId={page.id} index={index} isDragDisabled={!canEdit}>
                  {(dragProvided) => (
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    <div ref={dragProvided.innerRef} {...dragProvided.draggableProps}>
                      <div className={clsx(s.item, page.slug === currentSlug && s.itemActive)} style={{ paddingLeft: 8 + depth * 16 }}>
                        <Button
                          style={ButtonStyle.Icon}
                          title={isCollapsed ? t('common.expand') : t('common.collapse')}
                          className={clsx(s.caret, !hasChildren && s.caretHidden)}
                          onClick={() => handleToggleCollapse(page.id)}
                        >
                          {hasChildren && <Icon type={IconType.TriangleDown} size={IconSize.Size8} className={clsx(s.caretIcon, isCollapsed && s.caretIconCollapsed)} />}
                        </Button>
                        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                        <div {...dragProvided.dragHandleProps} className={s.dragHandle}>
                          <Link to={Paths.PROJECT_WIKI_PAGE.replace(':id', projectId).replace(':slug', page.slug)} className={s.link}>
                            {page.title}
                          </Link>
                        </div>
                        {canEdit && (
                          <Button style={ButtonStyle.Icon} title={t('common.addChildPage')} className={s.addChildButton} onClick={() => onCreate(page.id)}>
                            <Icon type={IconType.Plus} size={IconSize.Size10} />
                          </Button>
                        )}
                      </div>
                      {!isCollapsed && hasChildren && renderLevel(page.id, depth + 1)}
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  };

  return (
    <div className={s.wrapper}>
      <div className={s.header}>
        {canEdit && (
          <Button style={ButtonStyle.NoBackground} title={t('action.addWikiPage')} className={s.newPageButton} onClick={() => onCreate(null)}>
            <Icon type={IconType.Plus} size={IconSize.Size13} className={s.newPageButtonIcon} />
            {t('action.addWikiPage')}
          </Button>
        )}
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>{renderLevel(null, 0)}</DragDropContext>
    </div>
  );
});

WikiTree.propTypes = {
  projectId: PropTypes.string.isRequired,
  pages: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currentSlug: PropTypes.string,
  canEdit: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

WikiTree.defaultProps = {
  currentSlug: undefined,
};

export default WikiTree;
