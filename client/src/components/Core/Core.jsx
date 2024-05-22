import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation, Trans } from 'react-i18next';
import { Loader } from 'semantic-ui-react';

import ModalTypes from '../../constants/ModalTypes';
import FixedContainer from '../../containers/FixedContainer';
import StaticContainer from '../../containers/StaticContainer';
import UserSettingsModalContainer from '../../containers/UserSettingsModalContainer';
import ProjectAddModalContainer from '../../containers/ProjectAddModalContainer';
import Background from '../Background';

import styles from './Core.module.scss';

const Core = React.memo(({ isInitializing, isSocketDisconnected, currentModal, currentProject, currentBoard, currentCard }) => {
  const [t] = useTranslation();
  const mainTitle = '4ga Boards';

  useEffect(() => {
    let title = `${mainTitle}`;
    if (currentProject) {
      title = `${currentProject.name} | ${mainTitle}`;
      if (currentBoard) {
        title = `${currentBoard.name} · ${currentProject.name} | ${mainTitle}`;
        if (currentCard) {
          title = `${currentCard.name} - ${currentBoard.name} · ${currentProject.name} | ${mainTitle}`;
        }
      }
    }
    document.title = title;
  }, [currentBoard, currentCard, currentProject]);

  return (
    <>
      {isInitializing ? (
        <Loader active size="massive" />
      ) : (
        <>
          {currentProject && currentProject.background && (
            <Background type={currentProject.background.type} name={currentProject.background.name} imageUrl={currentProject.backgroundImage && currentProject.backgroundImage.url} />
          )}
          <FixedContainer />
          <StaticContainer />
          {currentModal === ModalTypes.USER_SETTINGS && <UserSettingsModalContainer />}
          {currentModal === ModalTypes.PROJECT_ADD && <ProjectAddModalContainer />}
        </>
      )}
      {isSocketDisconnected && (
        <div className={styles.message}>
          <div className={styles.messageHeader}>{t('common.noConnectionToServer')}</div>
          <div className={styles.messageContent}>
            <Trans i18nKey="common.allChangesWillBeAutomaticallySavedAfterConnectionRestored">
              All changes will be automatically saved
              <br />
              after connection restored
            </Trans>
          </div>
        </div>
      )}
    </>
  );
});

Core.propTypes = {
  isInitializing: PropTypes.bool.isRequired,
  isSocketDisconnected: PropTypes.bool.isRequired,
  currentModal: PropTypes.oneOf(Object.values(ModalTypes)),
  currentProject: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  currentBoard: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  currentCard: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

Core.defaultProps = {
  currentModal: undefined,
  currentProject: undefined,
  currentBoard: undefined,
  currentCard: undefined,
};

export default Core;
