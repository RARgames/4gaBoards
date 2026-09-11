import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import Paths from '../../../constants/Paths';
import { Icon, IconType, IconSize } from '../../Utils';

import * as s from './ProjectNav.module.scss';

const ProjectNav = React.memo(({ projectId, path, isManager, isAdmin }) => {
  const [t] = useTranslation();

  const tabs = [
    { path: Paths.PROJECTS, icon: IconType.Board, label: t('common.boards_title') },
    { path: Paths.PROJECT_GANTT, icon: IconType.Activity, label: t('common.gantt') },
    { path: Paths.PROJECT_CALENDAR, icon: IconType.Calendar, label: t('common.calendar') },
    { path: Paths.PROJECT_TEAM_PLANNER, icon: IconType.AddressCard, label: t('common.teamPlanner') },
    { path: Paths.PROJECT_WIKI, icon: IconType.List, label: t('common.wiki'), activePaths: [Paths.PROJECT_WIKI, Paths.PROJECT_WIKI_PAGE] },
    { path: Paths.PROJECT_DOCUMENTS, icon: IconType.Attach, label: t('common.documents') },
    { path: Paths.PROJECT_MEDIA, icon: IconType.Image, label: t('common.media') },
  ];

  const managerTabs = [{ path: Paths.PROJECT_MEMBERS, icon: IconType.Users, label: t('common.members') }];

  const isTabActive = useCallback(
    (tab) => {
      if (tab.path === Paths.PROJECTS) {
        return path === Paths.PROJECTS || path === Paths.BOARDS || path === Paths.CARDS;
      }

      return (tab.activePaths || [tab.path]).includes(path);
    },
    [path],
  );

  const renderTab = (tab) => (
    <Link key={tab.path} to={tab.path.replace(':id', projectId)} title={tab.label} className={clsx(s.tab, isTabActive(tab) && s.tabActive)}>
      <Icon type={tab.icon} size={IconSize.Size16} className={s.tabIcon} />
      <span className={s.tabLabel}>{tab.label}</span>
      {/* TODO: counts are styled and rendered when a tab supplies one, but nothing
          plumbs them in yet - ProjectNav is presentational and has no container.
          Boards/Documents/Members are the three worth wiring. */}
      {tab.count != null && <span className={s.tabCount}>{tab.count}</span>}
    </Link>
  );

  return (
    <div className={s.wrapper}>
      {tabs.map(renderTab)}
      {(isManager || isAdmin) && (
        <>
          <span className={s.divider} />
          {managerTabs.map(renderTab)}
        </>
      )}
    </div>
  );
});

ProjectNav.propTypes = {
  projectId: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  isManager: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
};

export default ProjectNav;
