import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import Paths from '../../constants/Paths';

import * as s from './TimesheetHeaderTabs.module.scss';

// Team Timesheets is admin-only (TeamOverview.jsx redirects non-admins away and the
// /api/time-entries/overview endpoint itself rejects non-admins server-side), so a normal member
// never has anywhere to switch to — they just get the plain page title, not a tab control that
// would imply a second view exists for them.
const TimesheetHeaderTabs = React.memo(({ isAdmin, active }) => {
  const [t] = useTranslation();

  if (!isAdmin) {
    return <h1 className={s.pageTitle}>{t('common.timesheet')}</h1>;
  }

  return (
    <div className={s.tabs}>
      <Link to={Paths.TIMESHEET} className={clsx(s.tab, active === 'individual' && s.tabActive)}>
        {t('common.individualTimesheet')}
      </Link>
      <Link to={Paths.TIMESHEET_TEAM} className={clsx(s.tab, active === 'team' && s.tabActive)}>
        {t('common.teamTimesheets')}
      </Link>
    </div>
  );
});

TimesheetHeaderTabs.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  active: PropTypes.oneOf(['individual', 'team']).isRequired,
};

export default TimesheetHeaderTabs;
