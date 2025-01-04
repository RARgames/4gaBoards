import React, { useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import PropTypes from 'prop-types';

import HeaderContainer from '../../containers/HeaderContainer';
import StaticContainer from '../../containers/StaticContainer';
import Background from '../Background';
import { Loader, LoaderSize } from '../Utils';

import * as s from './Core.module.scss';

const Core = React.memo(({ isInitializing, isSocketDisconnected, currentProject, currentBoard, currentCard }) => {
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
          <HeaderContainer />
          <StaticContainer />
        </>
      )}
      {isSocketDisconnected && (
        <div className={s.message}>
          <div className={s.messageHeader}>{t('common.noConnectionToServer')}</div>
          <div className={s.messageContent}>
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
