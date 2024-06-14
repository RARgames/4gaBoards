import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { ActivityTypes } from '../../../constants/Enums';
import CommentAdd from './CommentAdd';
import Item from './Item';
import { Button, ButtonStyle, Icon, IconType, IconSize, Loader, LoaderSize } from '../../Utils';

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
    const visibilityRef = useRef(null);

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

    const handleVisibilityChange = useCallback(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onFetch();
          }
        });
      },
      [onFetch],
    );

    useEffect(() => {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      };

      const observer = new IntersectionObserver(handleVisibilityChange, options);
      if (visibilityRef.current) {
        observer.observe(visibilityRef.current);
      }

      return () => {
        observer.disconnect();
      };
    }, [handleVisibilityChange, onFetch, items]);

    // TODO fix activities not in order - by date
    // TODO add number of comments

    return (
      <div className={cStyles.contentModule}>
        <div className={cStyles.moduleHeader}>
          <Icon type={IconType.Comment} size={IconSize.Size20} className={cStyles.moduleIcon} />
          {t('common.actions')}
          <Button style={ButtonStyle.Icon} title={t('common.toggleComments')} onClick={toggleCommShown} className={cStyles.buttonToggle}>
            <Icon type={commShown ? IconType.Minus : IconType.Plus} size={IconSize.Size10} className={styles.icon} />
          </Button>
          <Button style={ButtonStyle.Icon} title={isDetailsVisible && commShown ? t('action.hideDetails') : t('action.showDetails')} onClick={handleToggleDetailsClick} className={styles.toggleButton}>
            {isDetailsVisible && commShown ? t('action.hideDetails') : t('action.showDetails')}
          </Button>
        </div>
        <div className={cStyles.moduleBody}>
          {commShown && (
            <>
              {canEdit && <CommentAdd onCreate={onCommentCreate} />}
              <div className={styles.comments}>
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
              </div>
            </>
          )}
          {isFetching || isDetailsFetching ? <Loader size={LoaderSize.Normal} /> : !isAllFetched && <div ref={visibilityRef} />}
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
