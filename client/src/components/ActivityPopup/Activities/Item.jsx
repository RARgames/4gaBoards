import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import ActivityMessage from '../../ActivityMessage';
import User from '../../User';

import * as s from './Item.module.scss';

const Item = React.memo(({ type, data, user, createdAt, boardMemberships }) => {
  const [t] = useTranslation();

  return (
    <div className={s.content}>
      <span className={s.user}>
        <User name={user.name} avatarUrl={user.avatarUrl} size="tiny" isMember={boardMemberships.some((m) => m.user?.id === user.id)} isNotMemberTitle={t('common.noLongerBoardMember')} />
      </span>
      <span className={s.author}>{user.name}</span>
      {createdAt && <span className={s.date}>{t('format:dateTime', { postProcess: 'formatDate', value: createdAt })} </span>}
      <div className={s.contentText}>
        <ActivityMessage activity={{ type, data, user }} />
      </div>
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
