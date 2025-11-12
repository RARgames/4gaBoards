import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Link } from 'react-router';
import PropTypes from 'prop-types';

import Paths from '../../constants/Paths';
import NotificationActionsPopup from '../NotificationActionsPopup';
import Notifications from '../Notifications';
import { Button, ButtonStyle, Icon, IconType, IconSize, Popup, withPopup } from '../Utils';

import * as s from './NotificationsPopup.module.scss';

const NotificationsStep = React.memo(({ items, onUpdate, onMarkAllAs, onDelete, onDeleteAll, onClose }) => {
  const [t] = useTranslation();

  const unreadCount = items.filter((item) => !item.isRead).length;
  const totalCount = items.length;

  return (
    <>
      <Popup.Header contentClassName={s.header}>
        {totalCount > 0 && (
          <Trans i18nKey="common.notificationsWithCount" values={{ unread: unreadCount, total: totalCount }}>
            <span className={s.notificationCount} />
          </Trans>
        )}
        {totalCount === 0 && t('common.notifications')}
        <div className={s.actionsWrapper}>
          <Link to={Paths.NOTIFICATIONS}>
            <Button style={ButtonStyle.Icon} title={t('common.openNotifications')} onClick={onClose}>
              <Icon type={IconType.FullScreen} size={IconSize.Size12} />
            </Button>
          </Link>
          <NotificationActionsPopup onMarkAllAs={onMarkAllAs} onDeleteAll={onDeleteAll} position="bottom-start" hideCloseButton>
            <Button style={ButtonStyle.Icon} title={t('common.notificationActions')}>
              <Icon type={IconType.EllipsisVertical} size={IconSize.Size12} />
            </Button>
          </NotificationActionsPopup>
        </div>
      </Popup.Header>
      <Popup.Content>
        <Notifications items={items} isFullScreen={false} onUpdate={onUpdate} onMarkAllAs={onMarkAllAs} onDelete={onDelete} onDeleteAll={onDeleteAll} onClose={onClose} />
      </Popup.Content>
    </>
  );
});

NotificationsStep.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onMarkAllAs: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onDeleteAll: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(NotificationsStep);
