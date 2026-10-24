import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import ActivityPopup from '../../ActivityPopup';
import DeletePopup from '../../DeletePopup';
import User from '../../User';
import { Icon, IconType, IconSize, Button, ButtonVariant, MDPreview } from '../../Utils';
import CommentActionsPopup from './CommentActionsPopup';
import CommentEdit from './CommentEdit';

import * as s from './Comment.module.scss';

const Comment = React.memo(
  ({
    data,
    isPersisted,
    user,
    canEdit,
    commentMode,
    isGithubConnected,
    githubRepo,
    preferredDetailsFont,
    activities,
    isActivitiesFetching,
    isAllActivitiesFetched,
    lastActivityId,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
    boardMemberships,
    rightClickContextMenu,
    onUpdate,
    onDelete,
    onUserPrefsUpdate,
    onActivitiesFetch,
  }) => {
    const [t] = useTranslation();

    const commentEdit = useRef(null);
    const commentActionsPopupRef = useRef(null);

    const handleEditClick = useCallback(() => {
      commentEdit.current?.open();
    }, []);

    const handleContextMenu = useCallback(
      (e) => {
        if (!rightClickContextMenu || !isPersisted) {
          return;
        }

        // Keep the native menu on links, inputs, etc.
        if (e.target.closest('a, input, textarea, [contenteditable="true"]')) {
          return;
        }

        e.preventDefault(); // Prevent browser context menu from opening
        commentActionsPopupRef.current?.openAt(e.clientX, e.clientY);
      },
      [rightClickContextMenu, isPersisted],
    );

    return (
      <div className={s.content}>
        <div className={s.title}>
          <span className={s.user}>
            <User name={user.name} avatarUrl={user.avatarUrl} size="tiny" isMember={boardMemberships.some((m) => m.user?.id === user.id)} isNotMemberTitle={t('common.noLongerBoardMember')} />
          </span>
          <span className={s.author}>{user.name}</span>
          {createdAt && <span className={s.date}>{t('format:dateTime', { postProcess: 'formatDate', value: createdAt })}</span>}
          {updatedAt && (
            <span className={s.edited} title={`${t('common.edited')} ${t('format:dateTime', { postProcess: 'formatDate', value: updatedAt })}`}>
              {t('common.edited')}
            </span>
          )}
          <div className={s.buttons}>
            {canEdit && (
              <Button variant={ButtonVariant.Icon} title={t('common.editComment')} disabled={!isPersisted} onClick={handleEditClick} className={s.button}>
                <Icon type={IconType.Pencil} size={IconSize.Size10} className={s.buttonIcon} />
              </Button>
            )}
            <div className={s.popupWrapper}>
              <ActivityPopup
                title={t('common.activityForComment', { name: user.name })}
                createdAt={createdAt}
                createdBy={createdBy}
                updatedAt={updatedAt}
                updatedBy={updatedBy}
                memberships={boardMemberships}
                isNotMemberTitle={t('common.noLongerBoardMember')}
                activities={activities}
                isFetching={isActivitiesFetching}
                isAllFetched={isAllActivitiesFetched}
                lastActivityId={lastActivityId}
                hideCardDetails
                onFetch={onActivitiesFetch}
                position="left-start"
                offset={0}
              >
                <Button variant={ButtonVariant.Icon} title={t('common.checkActivity')} disabled={!isPersisted} className={s.button}>
                  <Icon type={IconType.Activity} size={IconSize.Size10} className={s.buttonIcon} />
                </Button>
              </ActivityPopup>
            </div>
            {canEdit && (
              <div className={s.popupWrapper}>
                <DeletePopup
                  title={t('common.deleteComment', { context: 'title' })}
                  content={t('common.areYouSureYouWantToDeleteThisComment')}
                  buttonContent={t('common.deleteComment')}
                  onConfirm={onDelete}
                  position="left-start"
                  offset={0}
                >
                  <Button variant={ButtonVariant.Icon} title={t('common.deleteComment')} disabled={!isPersisted} className={s.button}>
                    <Icon type={IconType.Trash} size={IconSize.Size10} className={s.buttonIcon} />
                  </Button>
                </DeletePopup>
              </div>
            )}
            {rightClickContextMenu && (
              <div className={s.popupWrapper}>
                <CommentActionsPopup
                  ref={commentActionsPopupRef}
                  userName={user.name}
                  text={data.text}
                  canEdit={canEdit}
                  createdAt={createdAt}
                  createdBy={createdBy}
                  updatedAt={updatedAt}
                  updatedBy={updatedBy}
                  boardMemberships={boardMemberships}
                  activities={activities}
                  isActivitiesFetching={isActivitiesFetching}
                  isAllActivitiesFetched={isAllActivitiesFetched}
                  lastActivityId={lastActivityId}
                  onEdit={handleEditClick}
                  onDelete={onDelete}
                  onActivitiesFetch={onActivitiesFetch}
                  hideCloseButton
                >
                  <span className={s.contextMenuAnchor} aria-hidden="true" />
                </CommentActionsPopup>
              </div>
            )}
          </div>
        </div>
        <div onContextMenu={handleContextMenu}>
          <CommentEdit
            ref={commentEdit}
            defaultData={data}
            placeholder={t('common.enterComment')}
            commentMode={commentMode}
            isGithubConnected={isGithubConnected}
            githubRepo={githubRepo}
            preferredDetailsFont={preferredDetailsFont}
            onUpdate={onUpdate}
            onUserPrefsUpdate={onUserPrefsUpdate}
          >
            <MDPreview source={data.text} isGithubConnected={isGithubConnected} githubRepo={githubRepo} preferredDetailsFont={preferredDetailsFont} className={s.preview} />
          </CommentEdit>
        </div>
      </div>
    );
  },
);

Comment.propTypes = {
  data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isPersisted: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  commentMode: PropTypes.string.isRequired,
  isGithubConnected: PropTypes.bool.isRequired,
  githubRepo: PropTypes.string.isRequired,
  preferredDetailsFont: PropTypes.string.isRequired,
  activities: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isActivitiesFetching: PropTypes.bool.isRequired,
  isAllActivitiesFetched: PropTypes.bool.isRequired,
  lastActivityId: PropTypes.string,
  createdAt: PropTypes.instanceOf(Date),
  createdBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  updatedAt: PropTypes.instanceOf(Date),
  updatedBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  rightClickContextMenu: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUserPrefsUpdate: PropTypes.func.isRequired,
  onActivitiesFetch: PropTypes.func.isRequired,
};

Comment.defaultProps = {
  lastActivityId: undefined,
  createdAt: undefined,
  updatedAt: undefined,
  createdBy: undefined,
  updatedBy: undefined,
};

export default Comment;
