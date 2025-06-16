import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import DueDate from '../DueDate';
import User from '../User';
import { Popup, withPopup } from '../Utils';

import * as s from './ActivityPopup.module.scss';

const ActivityStep = React.memo(({ title, createdAt, createdBy, updatedAt, updatedBy, memberships, isNotMemberTitle, onBack }) => {
  const [t] = useTranslation();

  return (
    <>
      <Popup.Header onBack={onBack}>{title}</Popup.Header>
      <Popup.Content>
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
      </Popup.Content>
    </>
  );
});

ActivityStep.propTypes = {
  title: PropTypes.string.isRequired,
  createdAt: PropTypes.instanceOf(Date),
  createdBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  updatedAt: PropTypes.instanceOf(Date),
  updatedBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  memberships: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  isNotMemberTitle: PropTypes.string.isRequired,
  onBack: PropTypes.func,
};

ActivityStep.defaultProps = {
  createdAt: undefined,
  createdBy: undefined,
  updatedAt: undefined,
  updatedBy: undefined,
  memberships: undefined,
  onBack: undefined,
};

export default withPopup(ActivityStep);
export { ActivityStep };
