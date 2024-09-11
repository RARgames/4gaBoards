import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation, Trans } from 'react-i18next';
import { Loader, LoaderSize } from '../Utils';

import ProjectsContainer from '../../containers/ProjectsContainer';
import BoardContainer from '../../containers/BoardContainer';
import SettingsContainer from '../../containers/Settings/SettingsContainer';
import MainSidebarContainer from '../../containers/MainSidebarContainer';
import Paths from '../../constants/Paths';

import styles from './Static.module.scss';

function Static({ path, projectId, cardId, board }) {
  const [t] = useTranslation();
  // TODO fully implement MainSidebar
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
      <div className={classNames(styles.wrapper, styles.wrapperFlex)}>
        <SettingsContainer path={path} />
      </div>
    );
  }

  if (projectId === undefined) {
    return (
      <div className={styles.wrapper}>
        <MainSidebarContainer path={path}>
          <ProjectsContainer />
        </MainSidebarContainer>
      </div>
    );
  }

  if (cardId === null) {
    return (
      <div className={classNames(styles.wrapper, styles.wrapperFlex)}>
        <div className={styles.message}>
          <h1>{t('common.cardNotFound', { context: 'title' })}</h1>
        </div>
      </div>
    );
  }

  if (board === null) {
    return (
      <div className={classNames(styles.wrapper, styles.wrapperFlex)}>
        <div className={styles.message}>
          <h1>{t('common.boardNotFound', { context: 'title' })}</h1>
        </div>
      </div>
    );
  }

  if (projectId === null) {
    return (
      <div className={classNames(styles.wrapper, styles.wrapperFlex)}>
        <div className={styles.message}>
          <h1>{t('common.projectNotFound', { context: 'title' })}</h1>
        </div>
      </div>
    );
  }

  if (board === undefined) {
    return (
      <div className={classNames(styles.wrapper, styles.wrapperFlex, styles.wrapperProject)}>
        <MainSidebarContainer path={path}>
          <div className={styles.message}>
            <h1 className={styles.messageTitle}>{t('common.openBoard', { context: 'title' })}</h1>
            <div className={styles.messageContent}>
              <Trans i18nKey="common.createNewOneOrSelectExistingOne" />
            </div>
          </div>
        </MainSidebarContainer>
      </div>
    );
  }

  if (board.isFetching) {
    return (
      <div className={classNames(styles.wrapper, styles.wrapperLoader, styles.wrapperProject)}>
        <Loader size={LoaderSize.Massive} />
      </div>
    );
  }

  return (
    <div className={classNames(styles.wrapper, styles.wrapperFlex, styles.wrapperBoard)}>
      <MainSidebarContainer path={path}>
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
