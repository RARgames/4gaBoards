import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import NotificationFilter from '../NorificationFilter';
import NotificationActionsPopup from '../NotificationActionsPopup';
import Notifications from '../Notifications';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './NotificationCenter.module.scss';

const NotificationCenter = React.memo(({ items, filteredItems, onUpdate, onMarkAllAs, onDelete, onDeleteAll, onChangeFilterQuery }) => {
  const [t] = useTranslation();
  const unreadCount = items.filter((item) => !item.isRead).length;
  const totalCount = items.length;

  return (
    <div className={s.wrapperFullScreen}>
      <div className={s.header}>
        <div className={s.title}>
          {totalCount > 0 && (
            <Trans i18nKey="common.notificationsWithCount" values={{ unread: unreadCount, total: totalCount }}>
              <span className={s.notificationCount} />
            </Trans>
          )}
          {totalCount === 0 && t('common.notifications')}
          <div className={s.actionsWrapper}>
            <NotificationActionsPopup onMarkAllAs={onMarkAllAs} onDeleteAll={onDeleteAll} position="bottom-start" hideCloseButton>
              <Button style={ButtonStyle.IconCentered} title={t('common.notificationActions')}>
                <Icon type={IconType.EllipsisVertical} size={IconSize.Size12} />
              </Button>
            </NotificationActionsPopup>
          </div>
        </div>
        <NotificationFilter defaultValue="" items={items} filteredItems={filteredItems} onChangeFilterQuery={onChangeFilterQuery} />
      </div>
      {totalCount > 0 ? (
        <div className={clsx(s.content, gs.scrollableY)}>
          <Notifications items={filteredItems} isFullScreen onUpdate={onUpdate} onDelete={onDelete} onClose={() => {}} />
        </div>
      ) : (
        <div className={s.noUnread}>{t('common.noUnreadNotifications')}</div>
      )}
    </div>
  );
});

NotificationCenter.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  filteredItems: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onMarkAllAs: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onDeleteAll: PropTypes.func.isRequired,
  onChangeFilterQuery: PropTypes.func.isRequired,
};

export default NotificationCenter;
