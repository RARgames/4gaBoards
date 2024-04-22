import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Comment, Icon } from 'semantic-ui-react';
import { Markdown } from '../../../lib/custom-ui';

import CommentEdit from './CommentEdit';
import User from '../../User';
import DeletePopup from '../../DeletePopup';

import styles from './ItemComment.module.scss';

const ItemComment = React.memo(({ data, createdAt, isPersisted, user, canEdit, onUpdate, onDelete }) => {
  const [t] = useTranslation();

  const commentEdit = useRef(null);

  const handleEditClick = useCallback(() => {
    commentEdit.current.open();
  }, []);

  return (
    <Comment>
      <div className={classNames(styles.content)}>
        <div className={styles.title}>
          <span className={styles.user}>
            <User name={user.name} avatarUrl={user.avatarUrl} size="tiny" />
          </span>
          <span className={styles.author}>{user.name}</span>
          <span className={styles.date}>
            {t('format:dateTime', {
              postProcess: 'formatDate',
              value: createdAt,
            })}
          </span>
          {canEdit && (
            <Comment.Actions className={styles.buttons}>
              <Comment.Action title={t('common.editComment')} as="button" disabled={!isPersisted} onClick={handleEditClick} className={styles.button}>
                <Icon fitted size="small" name="pencil" />
              </Comment.Action>
              <DeletePopup
                title={t('common.deleteComment', { context: 'title' })}
                content={t('common.areYouSureYouWantToDeleteThisComment')}
                buttonContent={t('action.deleteComment')}
                onConfirm={onDelete}
              >
                <Comment.Action title={t('common.deleteComment')} as="button" disabled={!isPersisted} className={styles.button}>
                  <Icon fitted size="small" name="trash" />
                </Comment.Action>
              </DeletePopup>
            </Comment.Actions>
          )}
        </div>
        <CommentEdit ref={commentEdit} defaultData={data} onUpdate={onUpdate}>
          <div className={styles.text}>
            <Markdown linkTarget="_blank">{data.text}</Markdown>
          </div>
        </CommentEdit>
      </div>
    </Comment>
  );
});

ItemComment.propTypes = {
  data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  createdAt: PropTypes.instanceOf(Date).isRequired,
  isPersisted: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default ItemComment;
