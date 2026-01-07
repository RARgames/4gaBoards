import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import Paths from '../../../constants/Paths';
import ActivityMessage from '../../ActivityMessage';
import User from '../../User';
import { Icon, IconType, IconSize } from '../../Utils';

import * as s from './Activity.module.scss';

const Activity = React.memo(({ activity, createdAt, memberships, showCardDetails, showListDetails, showBoardDetails, showProjectDetails, onClose }) => {
  const [t] = useTranslation();

  return (
    <div className={s.content}>
      <span className={s.user}>
        <User
          name={activity.user.name}
          avatarUrl={activity.user.avatarUrl}
          size="tiny"
          isMember={memberships ? memberships.some((m) => m.user?.id === activity.user.id) : true}
          isNotMemberTitle={t('common.noLongerBoardMember')}
        />
      </span>
      <span className={s.author}>{activity.user.name}</span>
      {createdAt && <span className={s.date}>{t('format:dateTime', { postProcess: 'formatDate', value: createdAt })} </span>}
      {showBoardDetails && (
        <Link to={Paths.BOARDS.replace(':id', activity.board?.id)} className={clsx(s.board, !activity.board?.name && s.empty)} title={activity.board?.name} onClick={onClose}>
          <Icon type={IconType.Board} size={IconSize.Size13} className={s.iconLink} />
          {activity.board?.name}
        </Link>
      )}
      {showProjectDetails && (
        <Link to={Paths.PROJECTS.replace(':id', activity.project?.id)} className={clsx(s.project, !activity.project?.name && s.empty)} title={activity.project?.name} onClick={onClose}>
          {activity.project?.name}
        </Link>
      )}
      <div className={s.contentText}>
        <ActivityMessage activity={activity} showCardDetails={showCardDetails} showListDetails={showListDetails} showBoardDetails={showBoardDetails} showProjectDetails={showProjectDetails} />
      </div>
    </div>
  );
});

Activity.propTypes = {
  activity: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  createdAt: PropTypes.instanceOf(Date),
  memberships: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  showCardDetails: PropTypes.bool.isRequired,
  showListDetails: PropTypes.bool.isRequired,
  showBoardDetails: PropTypes.bool.isRequired,
  showProjectDetails: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

Activity.defaultProps = {
  createdAt: undefined,
  memberships: undefined,
};

export default Activity;
