import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { ActivityScopes } from '../../../constants/Enums';
import ActivityMessage from '../../ActivityMessage';
import User from '../../User';

import * as s from './Item.module.scss';

const Item = React.memo(({ cardId, cardName, scope, type, data, user, createdAt, boardMemberships }) => {
  const [t] = useTranslation();

  return (
    <div className={s.content}>
      <span className={s.user}>
        <User name={user.name} avatarUrl={user.avatarUrl} size="tiny" isMember={boardMemberships.some((m) => m.user?.id === user.id)} isNotMemberTitle={t('common.noLongerBoardMember')} />
      </span>
      <span className={s.author}>{user.name}</span>
      {createdAt && <span className={s.date}>{t('format:dateTime', { postProcess: 'formatDate', value: createdAt })} </span>}
      <div className={s.contentText}>
        <ActivityMessage activity={{ scope, type, data, user, userId: user?.id }} card={{ id: cardId, name: cardName }} />
      </div>
    </div>
  );
});

Item.propTypes = {
  cardId: PropTypes.string,
  cardName: PropTypes.string,
  scope: PropTypes.oneOf(Object.values(ActivityScopes)).isRequired,
  type: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  createdAt: PropTypes.instanceOf(Date),
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

Item.defaultProps = {
  cardId: undefined,
  cardName: undefined,
  createdAt: undefined,
};

export default Item;
