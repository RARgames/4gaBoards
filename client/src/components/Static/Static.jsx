import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Loader, LoaderSize } from '../Utils';

import ProjectsContainer from '../../containers/ProjectsContainer';
import BoardsContainer from '../../containers/BoardsContainer';
import BoardContainer from '../../containers/BoardContainer';
import SettingsContainer from '../../containers/Settings/SettingsContainer';
import MainSidebarContainer from '../../containers/MainSidebarContainer';
import Paths from '../../constants/Paths';

import * as styles from './Static.module.scss';

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
      Paths.SETTINGS_USERS,
      Paths.SETTINGS_PROJECT,
    ].includes(path)
  ) {
    return (
      <div className={styles.wrapper}>
        <MainSidebarContainer settingsOnly={path !== Paths.SETTINGS_PROJECT}>
          <SettingsContainer />
        </MainSidebarContainer>
      </div>
    );
  }

  if (projectId === undefined) {
    return (
      <div className={styles.wrapper}>
        <MainSidebarContainer>
          <ProjectsContainer />
        </MainSidebarContainer>
      </div>
    );
  }

  if (cardId === null) {
    return (
      <div className={styles.wrapper}>
        <MainSidebarContainer>
          <div className={styles.message}>
            <h1>{t('common.cardNotFound', { context: 'title' })}</h1>
          </div>
        </MainSidebarContainer>
      </div>
    );
  }

  if (board === null) {
    return (
      <div className={styles.wrapper}>
        <MainSidebarContainer>
          <div className={styles.message}>
            <h1>{t('common.boardNotFound', { context: 'title' })}</h1>
          </div>
        </MainSidebarContainer>
      </div>
    );
  }

  if (projectId === null) {
    return (
      <div className={styles.wrapper}>
        <MainSidebarContainer>
          <div className={styles.message}>
            <h1>{t('common.projectNotFound', { context: 'title' })}</h1>
          </div>
        </MainSidebarContainer>
      </div>
    );
  }

  if (board === undefined) {
    return (
      <div className={styles.wrapper}>
        <MainSidebarContainer>
          <BoardsContainer />
        </MainSidebarContainer>
      </div>
    );
  }

  if (board.isFetching) {
    return (
      <div className={styles.wrapper}>
        <MainSidebarContainer>
          <Loader size={LoaderSize.Massive} />
        </MainSidebarContainer>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <MainSidebarContainer>
        <BoardContainer />
      </MainSidebarContainer>
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
