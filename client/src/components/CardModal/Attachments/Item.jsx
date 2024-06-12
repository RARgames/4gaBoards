import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle, Icon, IconType, IconSize, Loader, LoaderSize } from '../../Utils';
import EditPopup from './EditPopup';

import styles from './Item.module.scss';

const Item = React.forwardRef(({ name, url, coverUrl, createdAt, isCover, isPersisted, canEdit, onCoverSelect, onCoverDeselect, onClick, onUpdate, onDelete }, ref) => {
  const [t] = useTranslation();

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
    } else {
      window.open(url, '_blank');
    }
  }, [onClick, url]);

  const handleToggleCoverClick = useCallback(
    (event) => {
      event.stopPropagation();

      if (isCover) {
        onCoverDeselect();
      } else {
        onCoverSelect();
      }
    },
    [isCover, onCoverSelect, onCoverDeselect],
  );

  if (!isPersisted) {
    return (
      <div className={classNames(styles.wrapper, styles.wrapperSubmitting)}>
        <Loader size={LoaderSize.Normal} />
      </div>
    );
  }

  const filename = url.split('/').pop();
  const extension = filename.slice((Math.max(0, filename.lastIndexOf('.')) || Infinity) + 1);

  return (
    <div ref={ref} className={styles.wrapper}>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className={styles.thumbnail} style={{ background: coverUrl && `url("${coverUrl}") center / cover` }} onClick={handleClick}>
        {coverUrl ? (
          isCover && (
            <div className={styles.imageSelected}>
              <Icon type={IconType.Star} size={IconSize.Size14} className={styles.imageIcon} />
            </div>
          )
        ) : (
          <span className={styles.extension}>{extension || '-'}</span>
        )}
      </div>
      <div className={styles.details}>
        <span className={styles.name}>{name}</span>
        <span className={styles.date}>{t('format:dateTime', { postProcess: 'formatDate', value: createdAt })}</span>
        {coverUrl && canEdit && (
          <Button
            style={ButtonStyle.NoBackground}
            title={isCover ? t('action.removeCover', { context: 'title' }) : t('action.makeCover', { context: 'title' })}
            onClick={handleToggleCoverClick}
            className={styles.optionButton}
          >
            <Icon type={IconType.WindowMaximize} size={IconSize.Size10} className={styles.optionIcon} />
            <span className={styles.optionText}>{isCover ? t('action.removeCover', { context: 'title' }) : t('action.makeCover', { context: 'title' })}</span>
          </Button>
        )}
      </div>
      {canEdit && (
        <div className={styles.popupWrapper}>
          <EditPopup defaultData={{ name }} onUpdate={onUpdate} onDelete={onDelete} position="left-start" offset={0}>
            <Button style={ButtonStyle.Icon} title={t('common.editAttachment')} className={styles.target}>
              <Icon type={IconType.Pencil} size={IconSize.Size10} />
            </Button>
          </EditPopup>
        </div>
      )}
    </div>
  );
});

Item.propTypes = {
  name: PropTypes.string.isRequired,
  url: PropTypes.string,
  coverUrl: PropTypes.string,
  createdAt: PropTypes.instanceOf(Date),
  isCover: PropTypes.bool.isRequired,
  isPersisted: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
  onCoverSelect: PropTypes.func.isRequired,
  onCoverDeselect: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

Item.defaultProps = {
  url: undefined,
  coverUrl: undefined,
  createdAt: undefined,
  onClick: undefined,
};

export default React.memo(Item);
