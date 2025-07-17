import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import ActivityMessage from '../ActivityMessage';
import User from '../User';
import { Button, ButtonStyle, Icon, IconType, IconSize, Popup, withPopup } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './NotificationsPopup.module.scss';

const NotificationsStep = React.memo(({ items, onDelete, onClose }) => {
  const [t] = useTranslation();

  const handleDelete = useCallback(
    (id) => {
      onDelete(id);
    },
    [onDelete],
  );

  return (
    <>
      <Popup.Header>{t('common.notifications', { context: 'title' })}</Popup.Header>
      <Popup.Content>
        {items.length > 0 ? (
          <div className={clsx(s.wrapper, gs.scrollableY)}>
            {items.map((item) => (
              <div key={item.id} className={s.item}>
                {item.card && item.activity ? (
                  <>
                    <div className={s.itemHeader}>
                      <span className={s.user}>
                        <User name={item.activity.user.name} avatarUrl={item.activity.user.avatarUrl} size="tiny" />
                      </span>
                      <span className={s.author}>{item.activity.user.name}</span>
                      {item.activity.createdAt && <span className={s.date}>{t('format:dateTime', { postProcess: 'formatDate', value: item.activity.createdAt })} </span>}
                      <Button style={ButtonStyle.Icon} onClick={() => handleDelete(item.id)} className={s.itemButton}>
                        <Icon type={IconType.Trash} size={IconSize.Size14} />
                      </Button>
                    </div>
                    <span className={s.itemContent}>
                      <ActivityMessage activity={item.activity} card={item.card} isTruncated isCardLinked onClose={onClose} />
                    </span>
                  </>
                ) : (
                  <div className={s.itemDeleted}>{t('common.cardOrActionAreDeleted')}</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          t('common.noUnreadNotifications')
        )}
      </Popup.Content>
    </>
  );
});

NotificationsStep.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(NotificationsStep, { isWidthAuto: true });
