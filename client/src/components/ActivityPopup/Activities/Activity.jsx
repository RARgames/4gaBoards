import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import ActivityMessage from '../../ActivityMessage';
import User from '../../User';

import * as s from './Activity.module.scss';

const Activity = React.memo(({ activity, createdAt, boardMemberships, showCardDetails }) => {
  const [t] = useTranslation();

  return (
    <div className={s.content}>
      <span className={s.user}>
        <User
          name={activity.user.name}
          avatarUrl={activity.user.avatarUrl}
          size="tiny"
          isMember={boardMemberships.some((m) => m.user?.id === activity.user.id)}
          isNotMemberTitle={t('common.noLongerBoardMember')}
        />
      </span>
      <span className={s.author}>{activity.user.name}</span>
      {createdAt && <span className={s.date}>{t('format:dateTime', { postProcess: 'formatDate', value: createdAt })} </span>}
      <div className={s.contentText}>
        <ActivityMessage activity={activity} showCardDetails={showCardDetails} />
      </div>
    </div>
  );
});

Activity.propTypes = {
  activity: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  createdAt: PropTypes.instanceOf(Date),
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  showCardDetails: PropTypes.bool.isRequired,
};

Activity.defaultProps = {
  createdAt: undefined,
};

export default Activity;
