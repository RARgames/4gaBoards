import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { ActivityScopes } from '../../constants/Enums';
import Paths from '../../constants/Paths';
import ActivityLabel from '../ActivityLabel';
import ActivityLink from '../ActivityLink';
import ActivityMessage from '../ActivityMessage';
import User from '../User';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';

import * as s from './Notifications.module.scss';

const Notifications = React.memo(({ items, isFullScreen, onUpdate, onDelete, onClose }) => {
  const [t] = useTranslation();

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
    const boardLinkVisible = item.activity.scope !== ActivityScopes.PROJECT && item.activity.scope !== ActivityScopes.USER && item.activity.scope !== ActivityScopes.INSTANCE;
    const projectLinkVisible = item.activity.scope !== ActivityScopes.USER && item.activity.scope !== ActivityScopes.INSTANCE;
    return (
      <div key={item.id} className={clsx(s.item, item.isRead && s.itemRead, isFullScreen && s.itemFullScreen)}>
        <ActivityLabel scope={item.activity.scope} />
        <div className={s.wrapper}>
          <div className={s.itemHeader}>
            <span className={s.user}>
              <User name={item.activity.user.name} avatarUrl={item.activity.user.avatarUrl} size="tiny" />
            </span>
            <span className={s.author}>{item.activity.user.name}</span>
            {item.activity.createdAt && <span className={s.date}>{t('format:dateTime', { postProcess: 'formatDate', value: item.activity.createdAt })} </span>}
            <ActivityLink
              activityTarget={item.activity.board}
              isVisible={boardLinkVisible}
              to={Paths.BOARDS.replace(':id', item.activity.board?.id)}
              icon={IconType.Board}
              titleNotAvailable={t('activity.noBoardAvailable')}
              className={s.board}
              onClose={onClose}
            />
            <ActivityLink
              activityTarget={item.activity.project}
              isVisible={projectLinkVisible}
              to={Paths.PROJECTS.replace(':id', item.activity.project?.id)}
              icon={IconType.Project}
              titleNotAvailable={t('activity.noProjectAvailable')}
              className={s.project}
              onClose={onClose}
            />
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
            <ActivityMessage activity={item.activity} isTruncated onClose={onClose} />
          </span>
        </div>
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
