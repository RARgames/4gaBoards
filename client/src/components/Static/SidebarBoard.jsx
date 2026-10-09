import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { attachClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import clsx from 'clsx';
import pick from 'lodash/pick';
import PropTypes from 'prop-types';

import DroppableTypes from '../../constants/DroppableTypes';
import Paths from '../../constants/Paths';
import { dragKey, getDragData, useDropAnimation } from '../../lib/hooks/use-drop-animation';
import { useSidebarDropSlot } from '../../lib/hooks/use-sidebar-drop-slot';
import BoardActionsPopup from '../BoardActionsPopup';
import ConnectionsPopup from '../ConnectionsPopup';
import { Button, ButtonVariant, Icon, IconType, IconSize } from '../Utils';

import * as gs from '../../global.module.scss';
import * as ss from './Sidebar.module.scss';
import * as s from './SidebarBoard.module.scss';

const SidebarBoard = React.memo(
  ({
    board,
    index,
    projectId,
    isActive,
    isAdmin,
    isProjectManager,
    templates,
    mailServiceAvailable,
    mailServiceInboundEmail,
    boardRefs,
    onUpdate,
    onExport,
    onFetch,
    onDelete,
    onMembershipUpdate,
    onActivitiesFetch,
    onMailTokenCreate,
    onMailTokenUpdate,
    onMailTokenDelete,
    onTemplateCreate,
    onTemplateUpdate,
    onTemplateDelete,
  }) => {
    const [t] = useTranslation();
    const wrapperRef = useRef(null);
    const boardRef = useRef(null);
    const handleRef = useRef(null);
    const boardRefsCurrent = boardRefs.current;
    const { id, isPersisted } = board;

    const key = dragKey('board', id);
    const isDragging = useSidebarDropSlot((slot) => !!slot && slot.type === DroppableTypes.BOARD && slot.id === id);
    const placeholderHeight = useSidebarDropSlot((slot) => (slot && slot.type === DroppableTypes.BOARD && slot.parentId === projectId && slot.placeholderIndex === index ? slot.height : null));

    useEffect(() => {
      // DnD: only the handle starts the drag, and the whole board is a drop target (drop above/below it)
      const wrapper = wrapperRef.current;
      const boardElement = boardRef.current;

      if (!wrapper || !boardElement) {
        return undefined;
      }

      const data = { type: DroppableTypes.BOARD, id, parentId: projectId, index };

      return combine(
        draggable({
          element: wrapper,
          dragHandle: handleRef.current || undefined,
          canDrag: () => isPersisted && isProjectManager,
          getInitialData: ({ input }) => ({
            ...data,
            height: boardElement.offsetHeight,
            ...getDragData(boardElement, input, key),
          }),
        }),
        dropTargetForElements({
          element: wrapper,
          canDrop: ({ source }) => source.data.type === DroppableTypes.BOARD && source.data.parentId === projectId,
          getData: ({ input }) =>
            attachClosestEdge(data, {
              input,
              element: boardElement,
              allowedEdges: ['top', 'bottom'],
            }),
        }),
      );
    }, [id, projectId, index, isPersisted, key, isProjectManager]);

    useDropAnimation(boardRef, key);

    return (
      <div ref={wrapperRef} className={s.boardDraggable}>
        {placeholderHeight !== null && <div style={{ height: placeholderHeight }} />}
        {isPersisted && (
          <div
            className={clsx(s.sidebarItemBoard, isActive && ss.sidebarItemActive, isDragging && gs.hidden)}
            ref={(el) => {
              boardRef.current = el;
              boardRefsCurrent[id] = el;
            }}
          >
            {isProjectManager && (
              <div ref={handleRef}>
                <Button variant={ButtonVariant.Icon} title={t('common.reorderBoards')} className={clsx(s.reorderBoardsButton, s.hoverButton)}>
                  <Icon type={IconType.MoveUpDown} size={IconSize.Size13} />
                </Button>
              </div>
            )}
            <Link to={Paths.BOARDS.replace(':id', id)} className={clsx(ss.sidebarItemInner, !isProjectManager && s.boardCannotManage)}>
              <Button variant={ButtonVariant.NoBackground} content={board.name} className={clsx(s.boardButton, ss.sidebarButton)} />
            </Link>
            {board.isGithubConnected &&
              (isProjectManager ? (
                <ConnectionsPopup defaultData={pick(board, ['isGithubConnected', 'githubRepo'])} onUpdate={(data) => onUpdate(id, data)} offset={30} position="right-start">
                  <Icon
                    type={IconType.GitHub}
                    size={IconSize.Size13}
                    className={clsx(s.github, board.notificationsTotal > 0 && s.githubNotifications)}
                    title={t('common.connectedToGithub', { repo: board.githubRepo })}
                  />
                </ConnectionsPopup>
              ) : (
                <div>
                  <Icon
                    type={IconType.GitHub}
                    size={IconSize.Size13}
                    className={clsx(s.github, board.notificationsTotal > 0 && s.githubNotifications)}
                    title={t('common.connectedToGithub', { repo: board.githubRepo })}
                  />
                </div>
              ))}
            {board.notificationsTotal > 0 && <span className={ss.notification}>{board.notificationsTotal}</span>}
            <BoardActionsPopup
              activities={board.activities}
              isActivitiesFetching={board.isActivitiesFetching}
              isAllActivitiesFetched={board.isAllActivitiesFetched}
              lastActivityId={board.lastActivityId}
              defaultDataRename={pick(board, 'name')}
              defaultDataGithub={pick(board, ['isGithubConnected', 'githubRepo'])}
              createdAt={board.createdAt}
              createdBy={board.createdBy}
              updatedAt={board.updatedAt}
              updatedBy={board.updatedBy}
              memberships={board.memberships}
              templates={templates}
              boardName={board.name}
              isAdmin={isAdmin}
              mailTokens={board.mailTokens}
              mailTokenCount={board.mailTokenCount}
              mailServiceAvailable={mailServiceAvailable}
              mailServiceInboundEmail={mailServiceInboundEmail}
              isProjectManager={isProjectManager}
              canEdit={board.canEdit}
              isFetching={board.isFetching}
              boardMembershipId={board.boardMembershipId}
              hideCompletedLists={board.hideCompletedLists}
              onMembershipUpdate={onMembershipUpdate}
              onUpdate={(data) => onUpdate(id, data)}
              onExport={(data) => onExport(id, data)}
              onFetch={() => onFetch(id)}
              onDelete={() => onDelete(id)}
              onActivitiesFetch={() => onActivitiesFetch(id)}
              onMailTokenCreate={() => onMailTokenCreate(id)}
              onMailTokenUpdate={(mailTokenId) => onMailTokenUpdate(mailTokenId, id)}
              onMailTokenDelete={(mailTokenId) => onMailTokenDelete(mailTokenId)}
              onTemplateCreate={(data) => onTemplateCreate(id, data)}
              onTemplateUpdate={onTemplateUpdate}
              onTemplateDelete={onTemplateDelete}
              position="right-start"
              offset={10}
              hideCloseButton
            >
              <Button variant={ButtonVariant.Icon} title={t('common.editBoard', { context: 'title' })} className={s.hoverButton}>
                <Icon type={IconType.EllipsisVertical} size={IconSize.Size13} />
              </Button>
            </BoardActionsPopup>
          </div>
        )}
      </div>
    );
  },
);

SidebarBoard.propTypes = {
  board: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  index: PropTypes.number.isRequired,
  projectId: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isProjectManager: PropTypes.bool.isRequired,
  templates: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  mailServiceAvailable: PropTypes.bool.isRequired,
  mailServiceInboundEmail: PropTypes.string.isRequired,
  boardRefs: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  onFetch: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onMembershipUpdate: PropTypes.func.isRequired,
  onActivitiesFetch: PropTypes.func.isRequired,
  onMailTokenCreate: PropTypes.func.isRequired,
  onMailTokenUpdate: PropTypes.func.isRequired,
  onMailTokenDelete: PropTypes.func.isRequired,
  onTemplateCreate: PropTypes.func.isRequired,
  onTemplateUpdate: PropTypes.func.isRequired,
  onTemplateDelete: PropTypes.func.isRequired,
};

export default SidebarBoard;
