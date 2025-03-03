import React, { useCallback } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Link } from 'react-router';
import classNames from 'classnames';
import truncate from 'lodash/truncate';
import PropTypes from 'prop-types';

import { ActivityTypes } from '../../constants/Enums';
import Paths from '../../constants/Paths';
import User from '../User';
import { Button, ButtonStyle, Icon, IconType, IconSize, Popup, withPopup } from '../Utils';

import * as gs from '../../globalStyles.module.scss';
import * as s from './NotificationsPopup.module.scss';

const NotificationsStep = React.memo(({ items, onDelete, onClose }) => {
  const [t] = useTranslation();

  const handleDelete = useCallback(
    (id) => {
      onDelete(id);
    },
    [onDelete],
  );

  const renderItemContent = useCallback(
    ({ activity, card }) => {
      switch (activity.type) {
        case ActivityTypes.MOVE_CARD:
          return (
            <Trans
              i18nKey="common.userMovedCardFromListToList"
              values={{
                user: activity.user.name,
                card: card.name,
                fromList: activity.data.fromList.name,
                toList: activity.data.toList.name,
              }}
            >
              {activity.user.name}
              {' moved '}
              <Link to={Paths.CARDS.replace(':id', card.id)} onClick={onClose}>
                {card.name}
              </Link>
              {' from '}
              {activity.data.fromList.name}
              {' to '}
              {activity.data.toList.name}
            </Trans>
          );
        case ActivityTypes.COMMENT_CARD: {
          const commentText = truncate(activity.data.text);

          return (
            <Trans
              i18nKey="common.userLeftNewCommentToCard"
              values={{
                user: activity.user.name,
                comment: commentText,
                card: card.name,
              }}
            >
              {activity.user.name}
              {` left a new comment «${commentText}» to `}
              <Link to={Paths.CARDS.replace(':id', card.id)} onClick={onClose}>
                {card.name}
              </Link>
            </Trans>
          );
        }
        default:
      }

      return null;
    },
    [onClose],
  );

  return (
    <>
      <Popup.Header>{t('common.notifications', { context: 'title' })}</Popup.Header>
      <Popup.Content>
        {items.length > 0 ? (
          <div className={classNames(s.wrapper, gs.scrollableY)}>
            {items.map((item) => (
              <div key={item.id} className={s.item}>
                {item.card && item.activity ? (
                  <>
                    <User name={item.activity.user.name} avatarUrl={item.activity.user.avatarUrl} size="large" />
                    <span className={s.itemContent}>{renderItemContent(item)}</span>
                  </>
                ) : (
                  <div className={s.itemDeleted}>{t('common.cardOrActionAreDeleted')}</div>
                )}
                <Button style={ButtonStyle.Icon} onClick={() => handleDelete(item.id)} className={s.itemButton}>
                  <Icon type={IconType.Trash} size={IconSize.Size14} />
                </Button>
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

export default withPopup(NotificationsStep);
