import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Comment, Loader, Visibility } from 'semantic-ui-react';

import { ActivityTypes } from '../../../constants/Enums';
import CommentAdd from './CommentAdd';
import Item from './Item';
import { Icons, IconType, IconSize } from '../../Icons';
import { ButtonTmp, ButtonType } from '../../Utils/Button';

import styles from './Activities.module.scss';
import cStyles from '../CardModal.module.scss';

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
          <Icons type={IconType.Comment} size={IconSize.Size20} className={cStyles.moduleIcon} />
          {t('common.actions')}
          <ButtonTmp type={ButtonType.Icon} title={t('common.toggleComments')} onClick={toggleCommShown} className={cStyles.buttonToggle}>
            <Icons type={commShown ? IconType.Minus : IconType.Add} size={IconSize.Size10} className={styles.icon} />
          </ButtonTmp>
          <ButtonTmp
            type={ButtonType.Icon}
            title={isDetailsVisible && commShown ? t('action.hideDetails') : t('action.showDetails')}
            onClick={handleToggleDetailsClick}
            className={styles.toggleButton}
          >
            {isDetailsVisible && commShown ? t('action.hideDetails') : t('action.showDetails')}
          </ButtonTmp>
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
