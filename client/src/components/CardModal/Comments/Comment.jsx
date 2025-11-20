import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import ActivityPopup from '../../ActivityPopup';
import DeletePopup from '../../DeletePopup';
import User from '../../User';
import { Icon, IconType, IconSize, Button, ButtonStyle, MDPreview } from '../../Utils';
import CommentEdit from './CommentEdit';

import * as s from './Comment.module.scss';

const Comment = React.memo(
  ({
    cardId,
    cardName,
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
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
    boardMemberships,
    onUpdate,
    onDelete,
    onUserPrefsUpdate,
    onActivitiesFetch,
  }) => {
    const [t] = useTranslation();

    const commentEdit = useRef(null);

    const handleEditClick = useCallback(() => {
      commentEdit.current?.open();
    }, []);

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
          {canEdit && (
            <div className={s.buttons}>
              <Button style={ButtonStyle.Icon} title={t('common.editComment')} disabled={!isPersisted} onClick={handleEditClick} className={s.button}>
                <Icon type={IconType.Pencil} size={IconSize.Size10} className={s.buttonIcon} />
              </Button>
              <div className={s.popupWrapper}>
                <ActivityPopup
                  title={t('common.activityForComment', { name: user.name })}
                  createdAt={createdAt}
                  createdBy={createdBy}
                  updatedAt={updatedAt}
                  updatedBy={updatedBy}
                  memberships={boardMemberships}
                  isNotMemberTitle={t('common.noLongerBoardMember')}
                  cardId={cardId}
                  cardName={cardName}
                  activities={activities}
                  isFetching={isActivitiesFetching}
                  isAllFetched={isAllActivitiesFetched}
                  onFetch={onActivitiesFetch}
                  position="left-start"
                  offset={0}
                >
                  <Button style={ButtonStyle.Icon} title={t('common.checkActivity')} disabled={!isPersisted} className={s.button}>
                    <Icon type={IconType.Activity} size={IconSize.Size10} className={s.buttonIcon} />
                  </Button>
                </ActivityPopup>
              </div>
              <div className={s.popupWrapper}>
                <DeletePopup
                  title={t('common.deleteComment', { context: 'title' })}
                  content={t('common.areYouSureYouWantToDeleteThisComment')}
                  buttonContent={t('action.deleteComment')}
                  onConfirm={onDelete}
                  position="left-start"
                  offset={0}
                >
                  <Button style={ButtonStyle.Icon} title={t('common.deleteComment')} disabled={!isPersisted} className={s.button}>
                    <Icon type={IconType.Trash} size={IconSize.Size10} className={s.buttonIcon} />
                  </Button>
                </DeletePopup>
              </div>
            </div>
          )}
        </div>
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
    );
  },
);

Comment.propTypes = {
  cardId: PropTypes.string.isRequired,
  cardName: PropTypes.string.isRequired,
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
  createdAt: PropTypes.instanceOf(Date),
  createdBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  updatedAt: PropTypes.instanceOf(Date),
  updatedBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUserPrefsUpdate: PropTypes.func.isRequired,
  onActivitiesFetch: PropTypes.func.isRequired,
};

Comment.defaultProps = {
  createdAt: undefined,
  updatedAt: undefined,
  createdBy: undefined,
  updatedBy: undefined,
};

export default Comment;
