import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityScopes } from '@4gaboards/enums';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import logo from '../../assets/images/4gaLogo512w.png';
import Paths from '../../constants/Paths';
import ActivityLabel from '../ActivityLabel';
import ActivityLink from '../ActivityLink';
import ActivityMessage from '../ActivityMessage';
import User from '../User';
import { Button, ButtonVariant, Icon, IconType, IconSize, LinkifiedTextRenderer } from '../Utils';

import * as s from './Notifications.module.scss';

const Notifications = React.memo(({ items, isFullScreen, onUpdate, onDelete, onSystemNotificationSubmitResponse, onClose }) => {
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

  const handleAnswerButtonClick = useCallback(
    (id, answer) => {
      onSystemNotificationSubmitResponse(id, answer);
    },
    [onSystemNotificationSubmitResponse],
  );

  return items.map((item) => {
    // System notification
    if (!item.activity) {
      return (
        <div key={item.id} className={clsx(s.item, item.isRead && s.itemRead, isFullScreen && s.itemFullScreen)}>
          <ActivityLabel scope={ActivityScopes.SYSTEM} />
          <div className={s.wrapper}>
            <div className={s.itemHeader}>
              <span className={clsx(s.user, s.systemUser)}>
                <User name="4ga Boards" avatarUrl={logo} size="tiny" />
              </span>
              <span className={s.author}>4ga Boards</span>
              {item.createdAt && <span className={s.date}>{t('format:dateTime', { postProcess: 'formatDate', value: item.createdAt })} </span>}
              <Button
                variant={ButtonVariant.Icon}
                onClick={() => handleUpdate(item.id, { isRead: !item.isRead })}
                className={clsx(s.firstItemButton, s.itemButton)}
                title={item.isRead ? t('activity.markAsUnread') : t('activity.markAsRead')}
              >
                <Icon type={item.isRead ? IconType.EyeSlash : IconType.Eye} size={IconSize.Size14} />
              </Button>
              <Button variant={ButtonVariant.Icon} onClick={() => handleDelete(item.id)} className={s.itemButton} title={t('activity.delete')}>
                <Icon type={IconType.Trash} size={IconSize.Size14} />
              </Button>
            </div>
            <span className={s.systemTitle}>{item.systemTitle}</span>
            <span className={s.systemContent}>
              <LinkifiedTextRenderer isInline text={item.systemContent} linkClassName={s.link} />
            </span>
            {item.systemType === 'poll' && Array.isArray(item.systemAnswers) && (
              <div className={s.systemNotificationResponseWrapper}>
                <div className={s.answers}>
                  {item.systemAnswers.map((answer) => (
                    <Button key={answer} variant={ButtonVariant.Default} onClick={() => handleAnswerButtonClick(item.id, answer)} className={s.answer}>
                      {answer}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

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
              to={Paths.BOARDS.replace(':id', item.activity.board?.id || item.activity.boardId)}
              toAvailable={Boolean(item.activity.board || item.activity.boardId)}
              icon={IconType.Board}
              titleNotAvailable={t('activity.noBoardAvailable')}
              className={s.board}
              onClose={onClose}
            />
            <ActivityLink
              activityTarget={item.activity.project}
              isVisible={projectLinkVisible}
              to={Paths.PROJECTS.replace(':id', item.activity.project?.id || item.activity.projectId)}
              toAvailable={Boolean(item.activity.project || item.activity.projectId)}
              icon={IconType.Project}
              titleNotAvailable={t('activity.noProjectAvailable')}
              className={s.project}
              onClose={onClose}
            />
            <Button
              variant={ButtonVariant.Icon}
              onClick={() => handleUpdate(item.id, { isRead: !item.isRead })}
              className={clsx(s.firstItemButton, s.itemButton)}
              title={item.isRead ? t('activity.markAsUnread') : t('activity.markAsRead')}
            >
              <Icon type={item.isRead ? IconType.EyeSlash : IconType.Eye} size={IconSize.Size14} />
            </Button>
            <Button variant={ButtonVariant.Icon} onClick={() => handleDelete(item.id)} className={s.itemButton} title={t('activity.delete')}>
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
  onSystemNotificationSubmitResponse: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Notifications;
