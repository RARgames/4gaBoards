import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation, Trans } from 'react-i18next';
import { Loader } from 'semantic-ui-react';

import ProjectsContainer from '../../containers/ProjectsContainer';
import BoardContainer from '../../containers/BoardContainer';
import SettingsContainer from '../../containers/Settings/SettingsContainer';
import Paths from '../../constants/Paths';

import styles from './Static.module.scss';

function Static({ projectId, cardId, board, path }) {
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
    ].includes(path)
  ) {
    return (
      <div className={styles.wrapper}>
        <SettingsContainer />
      </div>
    );
  }

  if (projectId === undefined) {
    return (
      <div className={styles.wrapper}>
        <ProjectsContainer />
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
        <div className={styles.message}>
          <h1 className={styles.messageTitle}>{t('common.openBoard', { context: 'title' })}</h1>
          <div className={styles.messageContent}>
            <Trans i18nKey="common.createNewOneOrSelectExistingOne" />
          </div>
        </div>
      </div>
    );
  }

  if (board.isFetching) {
    return (
      <div className={classNames(styles.wrapper, styles.wrapperLoader, styles.wrapperProject)}>
        <Loader active size="big" />
      </div>
    );
  }

  return (
    <div className={classNames(styles.wrapper, styles.wrapperFlex, styles.wrapperBoard)}>
      <BoardContainer />
    </div>
  );
}

Static.propTypes = {
  projectId: PropTypes.string,
  cardId: PropTypes.string,
  board: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  path: PropTypes.string.isRequired,
};

Static.defaultProps = {
  projectId: undefined,
  cardId: undefined,
  board: undefined,
};

export default Static;
