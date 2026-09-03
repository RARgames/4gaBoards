import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import Paths from '../../constants/Paths';
import BoardContainer from '../../containers/BoardContainer';
import BoardsContainer from '../../containers/BoardsContainer';
import NotificationCenterContainer from '../../containers/NotificationCenterContainer';
import TeamOverviewContainer from '../../containers/TeamOverviewContainer';
import TimesheetContainer from '../../containers/TimesheetContainer';
import CalendarContainer from '../../containers/Project/CalendarContainer';
import DocumentsContainer from '../../containers/Project/DocumentsContainer';
import GanttContainer from '../../containers/Project/GanttContainer';
import MediaContainer from '../../containers/Project/MediaContainer';
import ProjectMembersContainer from '../../containers/Project/ProjectMembersContainer';
import ProjectNavContainer from '../../containers/Project/ProjectNavContainer';
import TeamPlannerContainer from '../../containers/Project/TeamPlannerContainer';
import WikiContainer from '../../containers/Project/WikiContainer';
import ProjectsContainer from '../../containers/ProjectsContainer';
import SettingsContainer from '../../containers/Settings/SettingsContainer';
import SidebarContainer from '../../containers/SidebarContainer';
import { Loader, LoaderSize } from '../Utils';

import * as s from './Static.module.scss';

function Static({ path, projectId, cardId, board }) {
  const [t] = useTranslation();
  if (
    [
      Paths.SETTINGS,
      Paths.SETTINGS_PROFILE,
      Paths.SETTINGS_PREFERENCES,
      Paths.SETTINGS_ACCOUNT,
      Paths.SETTINGS_AUTHENTICATION,
      Paths.SETTINGS_ABOUT,
      Paths.SETTINGS_INSTANCE,
      Paths.SETTINGS_CALENDAR,
      Paths.SETTINGS_USERS,
      Paths.SETTINGS_MEMBERS,
      Paths.SETTINGS_PROJECT,
    ].includes(path)
  ) {
    return (
      <div className={s.wrapper}>
        <SidebarContainer settingsOnly={path !== Paths.SETTINGS_PROJECT}>
          <SettingsContainer />
        </SidebarContainer>
      </div>
    );
  }

  if (path === Paths.NOTIFICATIONS) {
    return (
      <div className={s.wrapper}>
        <SidebarContainer>
          <NotificationCenterContainer />
        </SidebarContainer>
      </div>
    );
  }

  if (path === Paths.TIMESHEET) {
    return (
      <div className={s.wrapper}>
        <SidebarContainer>
          <TimesheetContainer />
        </SidebarContainer>
      </div>
    );
  }

  if (path === Paths.TIMESHEET_TEAM) {
    return (
      <div className={s.wrapper}>
        <SidebarContainer>
          <TeamOverviewContainer />
        </SidebarContainer>
      </div>
    );
  }

  if (path === Paths.PROJECT_MEMBERS) {
    if (projectId === null) {
      return (
        <div className={s.wrapper}>
          <SidebarContainer>
            <div className={s.message}>
              <h1>{t('common.projectNotFound', { context: 'title' })}</h1>
            </div>
          </SidebarContainer>
        </div>
      );
    }

    return (
      <div className={s.wrapper}>
        <SidebarContainer>
          <ProjectMembersContainer />
        </SidebarContainer>
      </div>
    );
  }

  if (path === Paths.PROJECT_WIKI || path === Paths.PROJECT_WIKI_PAGE) {
    if (projectId === null) {
      return (
        <div className={s.wrapper}>
          <SidebarContainer>
            <div className={s.message}>
              <h1>{t('common.projectNotFound', { context: 'title' })}</h1>
            </div>
          </SidebarContainer>
        </div>
      );
    }

    return (
      <div className={s.wrapper}>
        <SidebarContainer>
          <WikiContainer />
        </SidebarContainer>
      </div>
    );
  }

  if (path === Paths.PROJECT_DOCUMENTS) {
    if (projectId === null) {
      return (
        <div className={s.wrapper}>
          <SidebarContainer>
            <div className={s.message}>
              <h1>{t('common.projectNotFound', { context: 'title' })}</h1>
            </div>
          </SidebarContainer>
        </div>
      );
    }

    return (
      <div className={s.wrapper}>
        <SidebarContainer>
          <DocumentsContainer />
        </SidebarContainer>
      </div>
    );
  }

  if (path === Paths.PROJECT_GANTT) {
    if (projectId === null) {
      return (
        <div className={s.wrapper}>
          <SidebarContainer>
            <div className={s.message}>
              <h1>{t('common.projectNotFound', { context: 'title' })}</h1>
            </div>
          </SidebarContainer>
        </div>
      );
    }

    return (
      <div className={s.wrapper}>
        <SidebarContainer>
          <GanttContainer />
        </SidebarContainer>
      </div>
    );
  }

  if (path === Paths.PROJECT_MEDIA) {
    if (projectId === null) {
      return (
        <div className={s.wrapper}>
          <SidebarContainer>
            <div className={s.message}>
              <h1>{t('common.projectNotFound', { context: 'title' })}</h1>
            </div>
          </SidebarContainer>
        </div>
      );
    }

    return (
      <div className={s.wrapper}>
        <SidebarContainer>
          <MediaContainer />
        </SidebarContainer>
      </div>
    );
  }

  if (path === Paths.PROJECT_CALENDAR) {
    if (projectId === null) {
      return (
        <div className={s.wrapper}>
          <SidebarContainer>
            <div className={s.message}>
              <h1>{t('common.projectNotFound', { context: 'title' })}</h1>
            </div>
          </SidebarContainer>
        </div>
      );
    }

    return (
      <div className={s.wrapper}>
        <SidebarContainer>
          <CalendarContainer />
        </SidebarContainer>
      </div>
    );
  }

  if (path === Paths.PROJECT_TEAM_PLANNER) {
    if (projectId === null) {
      return (
        <div className={s.wrapper}>
          <SidebarContainer>
            <div className={s.message}>
              <h1>{t('common.projectNotFound', { context: 'title' })}</h1>
            </div>
          </SidebarContainer>
        </div>
      );
    }

    return (
      <div className={s.wrapper}>
        <SidebarContainer>
          <TeamPlannerContainer />
        </SidebarContainer>
      </div>
    );
  }

  if (projectId === undefined) {
    return (
      <div className={s.wrapper}>
        <SidebarContainer>
          <ProjectsContainer />
        </SidebarContainer>
      </div>
    );
  }

  if (cardId === null) {
    return (
      <div className={s.wrapper}>
        <SidebarContainer>
          <div className={s.message}>
            <h1>{t('common.cardNotFound', { context: 'title' })}</h1>
          </div>
        </SidebarContainer>
      </div>
    );
  }

  if (board === null) {
    return (
      <div className={s.wrapper}>
        <SidebarContainer>
          <div className={s.message}>
            <h1>{t('common.boardNotFound', { context: 'title' })}</h1>
          </div>
        </SidebarContainer>
      </div>
    );
  }

  if (projectId === null) {
    return (
      <div className={s.wrapper}>
        <SidebarContainer>
          <div className={s.message}>
            <h1>{t('common.projectNotFound', { context: 'title' })}</h1>
          </div>
        </SidebarContainer>
      </div>
    );
  }

  if (board === undefined) {
    return (
      <div className={s.wrapper}>
        <SidebarContainer>
          <div className={s.projectContent}>
            <ProjectNavContainer />
            <div className={s.projectContentBody}>
              <BoardsContainer />
            </div>
          </div>
        </SidebarContainer>
      </div>
    );
  }

  if (board.isFetching) {
    return (
      <div className={s.wrapper}>
        <SidebarContainer>
          <Loader size={LoaderSize.Massive} />
        </SidebarContainer>
      </div>
    );
  }

  return (
    <div className={s.wrapper}>
      <SidebarContainer>
        <div className={s.projectContent}>
          <ProjectNavContainer />
          <div className={s.projectContentBody}>
            <BoardContainer />
          </div>
        </div>
      </SidebarContainer>
    </div>
  );
}

Static.propTypes = {
  path: PropTypes.string.isRequired,
  projectId: PropTypes.string,
  cardId: PropTypes.string,
  board: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

Static.defaultProps = {
  projectId: undefined,
  cardId: undefined,
  board: undefined,
};

export default Static;
