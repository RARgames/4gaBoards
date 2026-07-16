import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { isSortable, useSortable } from '@dnd-kit/react/sortable';
import clsx from 'clsx';
import pick from 'lodash/pick';
import PropTypes from 'prop-types';

import Paths from '../../constants/Paths';
import SortableTypes from '../../constants/SortableTypes';
import BoardActionsPopup from '../BoardActionsPopup';
import ConnectionsPopup from '../ConnectionsPopup';
import { Button, ButtonVariant, Icon, IconType, IconSize } from '../Utils';

import * as ss from './Sidebar.module.scss';
import * as s from './SidebarBoard.module.scss';

const SidebarBoard = React.memo(
  ({
    board,
    index,
    projectId,
    isProjectManager,
    isAdmin,
    currBoardId,
    boardRefs,
    boardTemplates,
    mailServiceAvailable,
    mailServiceInboundEmail,
    onBoardUpdate,
    onBoardDelete,
    onBoardExport,
    onBoardFetch,
    onBoardTemplateCreate,
    onBoardTemplateUpdate,
    onBoardTemplateDelete,
    onActivitiesBoardFetch,
    onMailTokenCreate,
    onMailTokenUpdate,
    onMailTokenDelete,
    onBoardMembershipUpdate,
  }) => {
    const [t] = useTranslation();
    const boardRefsCurrent = boardRefs.current;

    const { ref, handleRef, isDragging } = useSortable({
      id: board.id,
      index,
      group: projectId,
      type: SortableTypes.BOARD,
      accept: (source) => isSortable(source) && source.type === SortableTypes.BOARD && source.initialGroup === projectId,
      disabled: !board.isPersisted || !isProjectManager,
    });

    return (
      <div ref={ref} className={clsx(s.boardDraggable, isDragging && s.boardDragging)}>
        {board.isPersisted && (
          <div
            className={clsx(s.sidebarItemBoard, currBoardId === board.id && ss.sidebarItemActive)}
            // eslint-disable-next-line no-return-assign
            ref={(el) => (boardRefsCurrent[board.id] = el)}
          >
            {isProjectManager && (
              <div ref={handleRef}>
                <Button variant={ButtonVariant.Icon} title={t('common.reorderBoards')} className={clsx(s.reorderBoardsButton, s.hoverButton)}>
                  <Icon type={IconType.MoveUpDown} size={IconSize.Size13} />
                </Button>
              </div>
            )}
            <Link to={Paths.BOARDS.replace(':id', board.id)} className={clsx(ss.sidebarItemInner, !isProjectManager && s.boardCannotManage)}>
              <Button variant={ButtonVariant.NoBackground} content={board.name} className={clsx(s.boardButton, ss.sidebarButton)} />
            </Link>
            {board.isGithubConnected &&
              (isProjectManager ? (
                <ConnectionsPopup defaultData={pick(board, ['isGithubConnected', 'githubRepo'])} onUpdate={(data) => onBoardUpdate(board.id, data)} offset={30} position="right-start">
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
              templates={boardTemplates}
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
              onMembershipUpdate={onBoardMembershipUpdate}
              onUpdate={(data) => onBoardUpdate(board.id, data)}
              onExport={(data) => onBoardExport(board.id, data)}
              onFetch={() => onBoardFetch(board.id)}
              onDelete={() => onBoardDelete(board.id)}
              onActivitiesFetch={() => onActivitiesBoardFetch(board.id)}
              onMailTokenCreate={() => onMailTokenCreate(board.id)}
              onMailTokenUpdate={(mailTokenId) => onMailTokenUpdate(mailTokenId, board.id)}
              onMailTokenDelete={(mailTokenId) => onMailTokenDelete(mailTokenId)}
              onTemplateCreate={(data) => onBoardTemplateCreate(board.id, data)}
              onTemplateUpdate={onBoardTemplateUpdate}
              onTemplateDelete={onBoardTemplateDelete}
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
  isProjectManager: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  currBoardId: PropTypes.string,
  boardRefs: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  boardTemplates: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  mailServiceAvailable: PropTypes.bool.isRequired,
  mailServiceInboundEmail: PropTypes.string.isRequired,
  onBoardUpdate: PropTypes.func.isRequired,
  onBoardDelete: PropTypes.func.isRequired,
  onBoardExport: PropTypes.func.isRequired,
  onBoardFetch: PropTypes.func.isRequired,
  onBoardTemplateCreate: PropTypes.func.isRequired,
  onBoardTemplateUpdate: PropTypes.func.isRequired,
  onBoardTemplateDelete: PropTypes.func.isRequired,
  onActivitiesBoardFetch: PropTypes.func.isRequired,
  onMailTokenCreate: PropTypes.func.isRequired,
  onMailTokenUpdate: PropTypes.func.isRequired,
  onMailTokenDelete: PropTypes.func.isRequired,
  onBoardMembershipUpdate: PropTypes.func.isRequired,
};

SidebarBoard.defaultProps = {
  currBoardId: undefined,
};

export default SidebarBoard;
