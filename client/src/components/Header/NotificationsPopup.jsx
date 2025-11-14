import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Link } from 'react-router';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import Paths from '../../constants/Paths';
import NotificationFilter from '../NorificationFilter';
import NotificationActionsPopup from '../NotificationActionsPopup';
import Notifications from '../Notifications';
import { Button, ButtonStyle, Icon, IconType, IconSize, Popup, withPopup } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './NotificationsPopup.module.scss';

const NotificationsStep = React.memo(({ items, filteredItems, onUpdate, onMarkAllAs, onDelete, onDeleteAll, onChangeFilterQuery, onClose }) => {
  const [t] = useTranslation();

  const unreadCount = items.filter((item) => !item.isRead).length;
  const totalCount = items.length;

  return (
    <>
      <Popup.Header className={s.headerWrapper} contentClassName={s.header}>
        <div className={s.title}>
          {totalCount > 0 && (
            <Trans i18nKey="common.notificationsWithCount" values={{ unread: unreadCount, total: totalCount }}>
              <span className={s.notificationCount} />
            </Trans>
          )}
          {totalCount === 0 && t('common.notifications')}
          <div className={s.actionsWrapper}>
            <Link to={Paths.NOTIFICATIONS}>
              <Button style={ButtonStyle.Icon} title={t('common.openNotificationCenter')} onClick={onClose}>
                <Icon type={IconType.FullScreen} size={IconSize.Size12} />
              </Button>
            </Link>
            <NotificationActionsPopup onMarkAllAs={onMarkAllAs} onDeleteAll={onDeleteAll} position="bottom-start" hideCloseButton>
              <Button style={ButtonStyle.Icon} title={t('common.notificationActions')}>
                <Icon type={IconType.EllipsisVertical} size={IconSize.Size12} />
              </Button>
            </NotificationActionsPopup>
          </div>
        </div>
        {totalCount > 0 && <NotificationFilter defaultValue="" items={items} filteredItems={filteredItems} onChangeFilterQuery={onChangeFilterQuery} className={s.filter} />}
      </Popup.Header>
      <Popup.Content>
        {totalCount > 0 ? (
          <div className={clsx(s.wrapper, gs.scrollableY)}>
            <Notifications items={filteredItems} isFullScreen={false} onUpdate={onUpdate} onDelete={onDelete} onClose={onClose} />
          </div>
        ) : (
          <div className={s.noUnread}>{t('common.noUnreadNotifications')}</div>
        )}
      </Popup.Content>
    </>
  );
});

NotificationsStep.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  filteredItems: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onMarkAllAs: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onDeleteAll: PropTypes.func.isRequired,
  onChangeFilterQuery: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(NotificationsStep);
