import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import PropTypes from 'prop-types';

import { ActivityTypes } from '../../../constants/Enums';
import User from '../../User';

import * as s from './Item.module.scss';

const Item = React.memo(({ type, data, user, createdAt, boardMemberships }) => {
  const [t] = useTranslation();

  // TODO fully rewrite contentNodes
  let contentNode;
  switch (type) {
    case ActivityTypes.DUPLICATE_CARD:
      contentNode = (
        <Trans
          i18nKey="common.userDuplicatedThisCard"
          values={{
            user: user.name,
            list: data.list.name,
          }}
        />
      );

      break;
    case ActivityTypes.CREATE_CARD:
      contentNode = (
        <Trans
          i18nKey="common.userAddedThisCardToList"
          values={{
            user: user.name,
            list: data.list.name,
          }}
        >
          {/* <span className={s.author}>{user.name}</span> */}
          <span className={s.text}>
            {' added this card to '}
            {data.list.name}
          </span>
        </Trans>
      );

      break;
    case ActivityTypes.MOVE_CARD:
      contentNode = (
        <Trans
          i18nKey="common.userMovedThisCardFromListToList"
          values={{
            user: user.name,
            fromList: data.fromList.name,
            toList: data.toList.name,
          }}
        >
          {/* <span className={s.author}>{user.name}</span> */}
          <span className={s.text}>
            {' moved this card from '}
            {data.fromList.name}
            {' to '}
            {data.toList.name}
          </span>
        </Trans>
      );

      break;
    default:
      contentNode = null;
  }

  return (
    <div className={s.content}>
      <span className={s.user}>
        <User name={user.name} avatarUrl={user.avatarUrl} size="tiny" isMember={boardMemberships.some((m) => m.user?.id === user.id)} isNotMemberTitle={t('common.noLongerBoardMember')} />
      </span>
      <span className={s.author}>{user.name}</span>
      {createdAt && <span className={s.date}>{t('format:dateTime', { postProcess: 'formatDate', value: createdAt })} </span>}
      <div className={s.contentText}>{contentNode}</div>
    </div>
  );
});

Item.propTypes = {
  type: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  createdAt: PropTypes.instanceOf(Date),
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

Item.defaultProps = {
  createdAt: undefined,
};

export default Item;
