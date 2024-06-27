import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { MDPreview, Icon, IconType, IconSize, Button, ButtonStyle } from '../../Utils';
import CommentEdit from './CommentEdit';
import User from '../../User';
import DeletePopup from '../../DeletePopup';

import styles from './ItemComment.module.scss';

const ItemComment = React.memo(({ data, createdAt, isPersisted, user, canEdit, commentMode, isGithubConnected, githubRepo, onUpdate, onDelete, onCurrentUserUpdate }) => {
  const [t] = useTranslation();

  const commentEdit = useRef(null);

  const handleEditClick = useCallback(() => {
    commentEdit.current.open();
  }, []);

  return (
    <div className={styles.content}>
      <div className={styles.title}>
        <span className={styles.user}>
          <User name={user.name} avatarUrl={user.avatarUrl} size="tiny" />
        </span>
        <span className={styles.author}>{user.name}</span>
        <span className={styles.date}>{t('format:dateTime', { postProcess: 'formatDate', value: createdAt })}</span>
        {canEdit && (
          <div className={styles.buttons}>
            <Button style={ButtonStyle.Icon} title={t('common.editComment')} disabled={!isPersisted} onClick={handleEditClick} className={styles.button}>
              <Icon type={IconType.Pencil} size={IconSize.Size10} className={styles.buttonIcon} />
            </Button>
            <div className={styles.popupWrapper}>
              <DeletePopup
                title={t('common.deleteComment', { context: 'title' })}
                content={t('common.areYouSureYouWantToDeleteThisComment')}
                buttonContent={t('action.deleteComment')}
                onConfirm={onDelete}
                position="left-start"
                offset={0}
              >
                <Button style={ButtonStyle.Icon} title={t('common.deleteComment')} disabled={!isPersisted} className={styles.button}>
                  <Icon type={IconType.Trash} size={IconSize.Size10} className={styles.buttonIcon} />
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
        onCurrentUserUpdate={onCurrentUserUpdate}
      >
        <MDPreview source={data.text} isGithubConnected={isGithubConnected} githubRepo={githubRepo} className={styles.preview} />
      </CommentEdit>
    </div>
  );
});

ItemComment.propTypes = {
  data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  createdAt: PropTypes.instanceOf(Date).isRequired,
  isPersisted: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  commentMode: PropTypes.string.isRequired,
  isGithubConnected: PropTypes.bool.isRequired,
  githubRepo: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCurrentUserUpdate: PropTypes.func.isRequired,
};

export default ItemComment;
