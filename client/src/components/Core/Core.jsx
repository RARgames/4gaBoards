import React, { useEffect, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import HeaderContainer from '../../containers/HeaderContainer';
import StaticContainer from '../../containers/StaticContainer';
import Background from '../Background';
import { Loader, LoaderSize, Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';

import * as s from './Core.module.scss';

const Core = React.memo(({ isInitializing, isSocketDisconnected, currentProject, currentBoard, currentCard }) => {
  const [t] = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  const handleCollapse = useCallback(() => {
    setIsCollapsed(true);
  }, []);

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
        <div className={clsx(s.message, isCollapsed && s.messageCollapsed)}>
          <div className={s.messageHeader}>
            <Icon className={clsx(s.messageIcon, isCollapsed && s.messageIconCollapsed)} type={IconType.NoConnection} size={IconSize.Size20} />
            <div className={clsx(s.messageTitle, isCollapsed && s.collapsed)}>{t('common.noConnection')}</div>
            <Button style={ButtonStyle.Icon} title={t('common.close')} className={clsx(s.messageCloseButton, isCollapsed && s.collapsed)} onClick={handleCollapse}>
              <Icon className={s.messageCloseIcon} type={IconType.Close} size={IconSize.Size16} />
            </Button>
          </div>
          <div className={clsx(s.messageContent, isCollapsed && s.collapsed)}>{t('common.allChangesWillBeAutomaticallySaved')}</div>
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
