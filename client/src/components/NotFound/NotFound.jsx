import React, { useEffect, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import HeaderContainer from '../../containers/HeaderContainer';
import { Loader, LoaderSize, Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';

import * as s from './NotFound.module.scss';

const NotFound = React.memo(({ isInitializing, isSocketDisconnected }) => {
  const [t] = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const mainTitle = '4ga Boards';

  useEffect(() => {
    document.title = `${t('common.pageNotFound', { context: 'title' })} | ${mainTitle}`;
  }, [t]);

  const handleCollapse = useCallback(() => {
    setIsCollapsed(true);
  }, []);

  return (
    <>
      {isInitializing ? (
        <Loader size={LoaderSize.Massive} />
      ) : (
        <>
          <HeaderContainer />
          <h1 className={s.text}>{t('common.pageNotFound', { context: 'title' })}</h1>
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

NotFound.propTypes = {
  isInitializing: PropTypes.bool.isRequired,
  isSocketDisconnected: PropTypes.bool.isRequired,
};

export default NotFound;
