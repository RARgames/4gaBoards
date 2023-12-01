import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Comment, Icon, Loader, Visibility } from 'semantic-ui-react';

import classNames from 'classnames';
import { ActivityTypes } from '../../../constants/Enums';
import CommentAdd from './CommentAdd';
import Item from './Item';

import styles from './Activities.module.scss';
import cStyles from '../CardModal.module.scss';
import gStyles from '../../../globalStyles.module.scss';

const Activities = React.memo(
  ({
    items,
    isFetching,
    isAllFetched,
    isDetailsVisible,
    isDetailsFetching,
    canEdit,
    canEditAllComments,
    onFetch,
    onDetailsToggle,
    onCommentCreate,
    onCommentUpdate,
    onCommentDelete,
    toggleCommShown,
    commShown,
  }) => {
    const [t] = useTranslation();

    const handleToggleDetailsClick = useCallback(() => {
      if (!commShown) {
        toggleCommShown(true);
        if (!isDetailsVisible) {
          onDetailsToggle(true);
        }
      } else {
        onDetailsToggle(!isDetailsVisible);
      }
    }, [commShown, isDetailsVisible, onDetailsToggle, toggleCommShown]);

    const handleCommentUpdate = useCallback(
      (id, data) => {
        onCommentUpdate(id, data);
      },
      [onCommentUpdate],
    );

    const handleCommentDelete = useCallback(
      (id) => {
        onCommentDelete(id);
      },
      [onCommentDelete],
    );

    // TODO fix activities not in order - by date
    // TODO add number of comments

    return (
      <div className={cStyles.contentModule}>
        <div className={cStyles.moduleHeader}>
          <Icon name="comments" className={cStyles.moduleIcon} />
          {t('common.actions')}
          <Button onClick={toggleCommShown} className={classNames(gStyles.iconButtonSolid, cStyles.iconButtonToggle)}>
            <Icon fitted size="small" name={commShown ? 'minus' : 'add'} />
          </Button>
          <Button content={isDetailsVisible && commShown ? t('action.hideDetails') : t('action.showDetails')} className={styles.toggleButton} onClick={handleToggleDetailsClick} />
        </div>
        <div className={cStyles.moduleBody}>
          {commShown && (
            <>
              {canEdit && <CommentAdd onCreate={onCommentCreate} />}
              <Comment.Group>
                {items.map((item) =>
                  item.type === ActivityTypes.COMMENT_CARD ? (
                    <Item.Comment
                      key={item.id}
                      data={item.data}
                      createdAt={item.createdAt}
                      isPersisted={item.isPersisted}
                      user={item.user}
                      canEdit={(item.user.isCurrent && canEdit) || canEditAllComments}
                      onUpdate={(data) => handleCommentUpdate(item.id, data)}
                      onDelete={() => handleCommentDelete(item.id)}
                    />
                  ) : (
                    <Item key={item.id} type={item.type} data={item.data} createdAt={item.createdAt} user={item.user} />
                  ),
                )}
              </Comment.Group>
            </>
          )}
          {isFetching || isDetailsFetching ? <Loader active inverted inline="centered" size="small" className={styles.loader} /> : !isAllFetched && <Visibility fireOnMount onOnScreen={onFetch} />}
        </div>
      </div>
    );
  },
);

Activities.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isFetching: PropTypes.bool.isRequired,
  isAllFetched: PropTypes.bool.isRequired,
  isDetailsVisible: PropTypes.bool.isRequired,
  isDetailsFetching: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  canEditAllComments: PropTypes.bool.isRequired,
  onFetch: PropTypes.func.isRequired,
  onDetailsToggle: PropTypes.func.isRequired,
  onCommentCreate: PropTypes.func.isRequired,
  onCommentUpdate: PropTypes.func.isRequired,
  onCommentDelete: PropTypes.func.isRequired,
  toggleCommShown: PropTypes.func.isRequired,
  commShown: PropTypes.bool.isRequired,
};

export default Activities;
