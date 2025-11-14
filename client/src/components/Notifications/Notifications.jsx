import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import truncate from 'lodash/truncate';
import PropTypes from 'prop-types';

import ActivityMessage from '../ActivityMessage';
import User from '../User';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';

import * as s from './Notifications.module.scss';

const Notifications = React.memo(({ items, isFullScreen, onUpdate, onDelete, onClose }) => {
  const [t] = useTranslation();
  const truncateLength = 30;

  const handleUpdate = useCallback(
    (id, data) => {
      onUpdate(id, data);
    },
    [onUpdate],
  );

  const handleDelete = useCallback(
    (id) => {
      onDelete(id);
    },
    [onDelete],
  );

  return items.map((item) => {
    if (!item.activity) return null;
    const projectName = truncate(item.activity.project?.name, { length: truncateLength });
    const boardName = truncate(item.activity.board?.name, { length: truncateLength });

    return (
      <div key={item.id} className={clsx(s.item, item.isRead && s.itemRead, isFullScreen && s.itemFullScreen)}>
        <div className={s.itemHeader}>
          <span className={s.user}>
            <User name={item.activity.user.name} avatarUrl={item.activity.user.avatarUrl} size="tiny" />
          </span>
          <span className={s.author}>{item.activity.user.name}</span>
          {item.activity.createdAt && <span className={s.date}>{t('format:dateTime', { postProcess: 'formatDate', value: item.activity.createdAt })} </span>}
          <span className={clsx(s.board, !boardName && s.empty)} title={boardName || t('activity.noBoardAvailable')}>
            {boardName}
          </span>
          <span className={clsx(s.project, !projectName && s.empty)} title={projectName || t('activity.noProjectAvailable')}>
            {projectName}
          </span>
          <Button
            style={ButtonStyle.Icon}
            onClick={() => handleUpdate(item.id, { isRead: !item.isRead })}
            className={clsx(s.firstItemButton, s.itemButton)}
            title={item.isRead ? t('activity.markAsUnread') : t('activity.markAsRead')}
          >
            <Icon type={item.isRead ? IconType.EyeSlash : IconType.Eye} size={IconSize.Size14} />
          </Button>
          <Button style={ButtonStyle.Icon} onClick={() => handleDelete(item.id)} className={s.itemButton} title={t('activity.delete')}>
            <Icon type={IconType.Trash} size={IconSize.Size14} />
          </Button>
        </div>
        <span className={s.itemContent}>
          <ActivityMessage activity={item.activity} card={item.card} isTruncated isCardLinked onClose={onClose} />
        </span>
      </div>
    );
  });
});

Notifications.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isFullScreen: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Notifications;
