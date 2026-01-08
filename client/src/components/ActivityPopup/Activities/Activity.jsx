import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { ActivityScopes } from '../../../constants/Enums';
import Paths from '../../../constants/Paths';
import ActivityLink from '../../ActivityLink';
import ActivityMessage from '../../ActivityMessage';
import User from '../../User';
import { IconType } from '../../Utils';

import * as s from './Activity.module.scss';

const Activity = React.memo(({ activity, createdAt, memberships, showCardDetails, showListDetails, showLabelDetails, showBoardDetails, showProjectDetails, onClose }) => {
  const [t] = useTranslation();

  const boardLinkVisible = showBoardDetails && activity.scope !== ActivityScopes.PROJECT && activity.scope !== ActivityScopes.USER;
  const projectLinkVisible = showProjectDetails && activity.scope !== ActivityScopes.USER;

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
      <ActivityLink
        activityTarget={activity.board}
        isVisible={boardLinkVisible}
        to={Paths.BOARDS.replace(':id', activity.board?.id)}
        icon={IconType.Board}
        titleNotAvailable={t('activity.noBoardAvailable')}
        className={s.board}
        onClose={onClose}
      />
      <ActivityLink
        activityTarget={activity.project}
        isVisible={projectLinkVisible}
        to={Paths.PROJECTS.replace(':id', activity.project?.id)}
        icon={IconType.Project}
        titleNotAvailable={t('activity.noProjectAvailable')}
        className={s.project}
        onClose={onClose}
      />
      <div className={s.contentText}>
        <ActivityMessage
          activity={activity}
          showCardDetails={showCardDetails}
          showListDetails={showListDetails}
          showLabelDetails={showLabelDetails}
          showBoardDetails={showBoardDetails}
          showProjectDetails={showProjectDetails}
        />
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
  showLabelDetails: PropTypes.bool.isRequired,
  showBoardDetails: PropTypes.bool.isRequired,
  showProjectDetails: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

Activity.defaultProps = {
  createdAt: undefined,
  memberships: undefined,
};

export default Activity;
