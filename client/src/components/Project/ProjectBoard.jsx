import React, { useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import clsx from 'clsx';
import pick from 'lodash/pick';
import PropTypes from 'prop-types';

import Paths from '../../constants/Paths';
import BoardActionsPopup from '../BoardActionsPopup';
import { Button, ButtonVariant, Icon, IconType, IconSize, ProgressBar, ProgressBarSize } from '../Utils';

import * as s from './ProjectBoard.module.scss';

const ProjectBoard = React.memo(
  ({
    id,
    board,
    isAdmin,
    isProjectManager,
    templates,
    mailServiceAvailable,
    mailServiceInboundEmail,
    rightClickContextMenu,
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
    const boardActionsPopupRef = useRef(null);

    const handleContextMenu = useCallback(
      (e) => {
        if (!rightClickContextMenu) {
          return;
        }

        e.preventDefault(); // Prevent browser context menu from opening
        boardActionsPopupRef.current?.open();
      },
      [rightClickContextMenu],
    );

    return (
      <div className={clsx(s.boardWrapper)} onContextMenu={handleContextMenu}>
        {board.notificationsTotal > 0 && <span className={s.notification}>{board.notificationsTotal}</span>}
        <Link to={Paths.BOARDS.replace(':id', id)}>
          <div className={s.board}>
            <div title={board.name} className={s.boardTitle}>
              {board.name}
            </div>
            <div className={s.boardProgresses}>
              <div className={s.boardProgress}>
                {t('common.cards', { context: 'title' })}:
                <ProgressBar value={board.cardCompleted} total={board.cardTotal} size={ProgressBarSize.Tiny} className={s.boardProgressBar} />
                {!(board.cardCompleted === 0 && board.cardTotal === 0) && `${board.cardCompleted}/${board.cardTotal}`}
              </div>
              <div className={s.boardProgress}>
                {t('common.tasks')}:
                <ProgressBar value={board.taskCompleted} total={board.taskTotal} size={ProgressBarSize.Tiny} className={s.boardProgressBar} />
                {!(board.taskCompleted === 0 && board.taskTotal === 0) && `${board.taskCompleted}/${board.taskTotal}`}
              </div>
            </div>
          </div>
        </Link>
        <BoardActionsPopup
          ref={boardActionsPopupRef}
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
          onDelete={() => onDelete(id)}
          onFetch={() => onFetch(id)}
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
          wrapperClassName={s.boardActionsWrapper}
        >
          <Button variant={ButtonVariant.IconCentered} title={t('common.editBoard', { context: 'title' })} className={s.hoverButton}>
            <Icon type={IconType.EllipsisVertical} size={IconSize.Size13} />
          </Button>
        </BoardActionsPopup>
      </div>
    );
  },
);

ProjectBoard.propTypes = {
  id: PropTypes.string.isRequired,
  board: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isAdmin: PropTypes.bool.isRequired,
  isProjectManager: PropTypes.bool.isRequired,
  templates: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  mailServiceAvailable: PropTypes.bool.isRequired,
  mailServiceInboundEmail: PropTypes.string.isRequired,
  rightClickContextMenu: PropTypes.bool.isRequired,
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

export default ProjectBoard;
