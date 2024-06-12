import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation, Trans } from 'react-i18next';
import { Loader, LoaderSize } from '../Utils';

import FixedContainer from '../../containers/FixedContainer';
import StaticContainer from '../../containers/StaticContainer';
import Background from '../Background';

import styles from './Core.module.scss';

const Core = React.memo(({ path, isInitializing, isSocketDisconnected, currentProject, currentBoard, currentCard }) => {
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
        <Loader size={LoaderSize.Massive} />
      ) : (
        <>
          {currentProject && currentProject.background && (
            <Background type={currentProject.background.type} name={currentProject.background.name} imageUrl={currentProject.backgroundImage && currentProject.backgroundImage.url} />
          )}
          <FixedContainer path={path} />
          <StaticContainer path={path} />
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
  path: PropTypes.string.isRequired,
  isInitializing: PropTypes.bool.isRequired,
  isSocketDisconnected: PropTypes.bool.isRequired,
  currentProject: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  currentBoard: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  currentCard: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

Core.defaultProps = {
  currentProject: undefined,
  currentBoard: undefined,
  currentCard: undefined,
};

export default Core;
