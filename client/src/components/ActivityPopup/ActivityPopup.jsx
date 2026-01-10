import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import DueDate from '../DueDate';
import User from '../User';
import { Popup, withPopup } from '../Utils';
import Activities from './Activities';

import * as s from './ActivityPopup.module.scss';

const ActivityStep = React.memo(
  ({
    title,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
    memberships,
    isNotMemberTitle,
    activities,
    isFetching,
    isAllFetched,
    lastActivityId,
    hideCardDetails,
    hideListDetails,
    hideLabelDetails,
    hideBoardDetails,
    hideProjectDetails,
    onFetch,
    onBack,
    onClose,
  }) => {
    const [t] = useTranslation();

    return (
      <>
        <Popup.Header onBack={onBack} title={title} className={s.header}>
          {title}
        </Popup.Header>
        <Popup.Content className={s.content}>
          <div className={s.wrapper}>
            {(createdAt || createdBy) && (
              <div className={s.meta}>
                {t('common.activityCreated')}
                {createdBy && (
                  <User
                    name={createdBy.name}
                    avatarUrl={createdBy.avatarUrl}
                    size="small"
                    isMember={memberships ? memberships.some((m) => m.user?.id === createdBy.id) : true}
                    isNotMemberTitle={isNotMemberTitle}
                    className={s.metaUser}
                  />
                )}
                {createdAt && <DueDate value={createdAt} variant="listView" />}
              </div>
            )}
            {(updatedAt || updatedBy) && (
              <div className={s.meta}>
                {t('common.activityUpdated')}
                {updatedBy && (
                  <User
                    name={updatedBy.name}
                    avatarUrl={updatedBy.avatarUrl}
                    size="small"
                    isMember={memberships ? memberships.some((m) => m.user?.id === updatedBy.id) : true}
                    isNotMemberTitle={isNotMemberTitle}
                    className={s.metaUser}
                  />
                )}
                {updatedAt && <DueDate value={updatedAt} variant="listView" />}
              </div>
            )}
          </div>
          <Activities
            items={activities}
            isFetching={isFetching}
            isAllFetched={isAllFetched}
            lastActivityId={lastActivityId}
            memberships={memberships}
            hideCardDetails={hideCardDetails}
            hideListDetails={hideListDetails}
            hideLabelDetails={hideLabelDetails}
            hideBoardDetails={hideBoardDetails}
            hideProjectDetails={hideProjectDetails}
            onFetch={onFetch}
            onClose={onClose}
          />
        </Popup.Content>
      </>
    );
  },
);

ActivityStep.propTypes = {
  title: PropTypes.string.isRequired,
  createdAt: PropTypes.instanceOf(Date),
  createdBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  updatedAt: PropTypes.instanceOf(Date),
  updatedBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  memberships: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  isNotMemberTitle: PropTypes.string,
  activities: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isFetching: PropTypes.bool.isRequired,
  isAllFetched: PropTypes.bool.isRequired,
  lastActivityId: PropTypes.number,
  hideCardDetails: PropTypes.bool,
  hideListDetails: PropTypes.bool,
  hideLabelDetails: PropTypes.bool,
  hideBoardDetails: PropTypes.bool,
  hideProjectDetails: PropTypes.bool,
  onFetch: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func,
};

ActivityStep.defaultProps = {
  createdAt: undefined,
  createdBy: undefined,
  updatedAt: undefined,
  updatedBy: undefined,
  memberships: undefined,
  isNotMemberTitle: '',
  lastActivityId: undefined,
  hideCardDetails: false,
  hideListDetails: false,
  hideLabelDetails: false,
  hideBoardDetails: false,
  hideProjectDetails: false,
  onBack: undefined,
  onClose: () => {},
};

export default withPopup(ActivityStep);
export { ActivityStep };
