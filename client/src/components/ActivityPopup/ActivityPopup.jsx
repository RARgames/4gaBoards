import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import DueDate from '../DueDate';
import User from '../User';
import { Popup, withPopup } from '../Utils';

import * as s from './ActivityPopup.module.scss';

const ActivityStep = React.memo(({ title, createdAt, createdBy, updatedAt, updatedBy, onBack }) => {
  const [t] = useTranslation();

  return (
    <>
      <Popup.Header onBack={onBack}>{title}</Popup.Header>
      <Popup.Content>
        <div className={s.wrapper}>
          {createdAt && createdBy && (
            <div className={s.meta}>
              {t('common.activityCreated')}
              <User name={createdBy.name} avatarUrl={createdBy.avatarUrl} size="small" className={s.metaUser} />
              <DueDate value={createdAt} variant="listView" showUndefined />
            </div>
          )}
          {updatedAt && updatedBy && (
            <div className={s.meta}>
              {t('common.activityUpdated')}
              <User name={updatedBy.name} avatarUrl={updatedBy.avatarUrl} size="small" className={s.metaUser} />
              <DueDate value={updatedAt} variant="listView" showUndefined />
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
  onBack: PropTypes.func,
};

ActivityStep.defaultProps = {
  createdAt: undefined,
  createdBy: undefined,
  updatedAt: undefined,
  updatedBy: undefined,
  onBack: undefined,
};

export default withPopup(ActivityStep);
export { ActivityStep };
