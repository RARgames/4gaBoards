import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import ActivityPopup from '../../ActivityPopup';
import DeletePopup from '../../DeletePopup';
import User from '../../User';
import { MDPreview, Icon, IconType, IconSize, Button, ButtonStyle } from '../../Utils';
import CommentEdit from './CommentEdit';

import * as s from './ItemComment.module.scss';

const ItemComment = React.memo(({ data, isPersisted, user, canEdit, commentMode, isGithubConnected, githubRepo, createdAt, createdBy, updatedAt, updatedBy, onUpdate, onDelete, onUserPrefsUpdate }) => {
  const [t] = useTranslation();

  const commentEdit = useRef(null);

  const handleEditClick = useCallback(() => {
    commentEdit.current?.open();
  }, []);

  return (
    <div className={s.content}>
      <div className={s.title}>
        <span className={s.user}>
          <User name={user.name} avatarUrl={user.avatarUrl} size="tiny" />
        </span>
        <span className={s.author}>{user.name}</span>
        <span className={s.date}>{t('format:dateTime', { postProcess: 'formatDate', value: createdAt })}</span>
        {updatedAt !== null && (
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
              <ActivityPopup title={t('common.activityForComment', { name: user.name })} createdAt={createdAt} createdBy={createdBy} updatedAt={updatedAt} updatedBy={updatedBy} position="left-start" offset={0}>
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
        onUpdate={onUpdate}
        onUserPrefsUpdate={onUserPrefsUpdate}
      >
        <MDPreview source={data.text} isGithubConnected={isGithubConnected} githubRepo={githubRepo} className={s.preview} />
      </CommentEdit>
    </div>
  );
});

ItemComment.propTypes = {
  data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isPersisted: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  commentMode: PropTypes.string.isRequired,
  isGithubConnected: PropTypes.bool.isRequired,
  githubRepo: PropTypes.string.isRequired,
  createdAt: PropTypes.instanceOf(Date).isRequired,
  createdBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  updatedAt: PropTypes.instanceOf(Date),
  updatedBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUserPrefsUpdate: PropTypes.func.isRequired,
};

ItemComment.defaultProps = {
  updatedAt: null,
  createdBy: undefined,
  updatedBy: undefined,
};

export default ItemComment;
