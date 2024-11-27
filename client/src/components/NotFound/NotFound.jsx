import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation, Trans } from 'react-i18next';
import { Loader, LoaderSize } from '../Utils';
import HeaderContainer from '../../containers/HeaderContainer';

import * as s from './NotFound.module.scss';

const NotFound = React.memo(({ isInitializing, isSocketDisconnected }) => {
  const [t] = useTranslation();
  const mainTitle = '4ga Boards';

  useEffect(() => {
    document.title = `${t('common.pageNotFound', { context: 'title' })} | ${mainTitle}`;
  }, [t]);

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

NotFound.propTypes = {
  isInitializing: PropTypes.bool.isRequired,
  isSocketDisconnected: PropTypes.bool.isRequired,
};

export default NotFound;
