import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation, Trans } from 'react-i18next';
import { Loader } from 'semantic-ui-react';

import ModalTypes from '../../constants/ModalTypes';
import FixedContainer from '../../containers/FixedContainer';
import UserSettingsModalContainer from '../../containers/UserSettingsModalContainer';

import styles from './NotFound.module.scss';

const NotFound = React.memo(({ isInitializing, isSocketDisconnected, currentModal }) => {
  const [t] = useTranslation();
  const mainTitle = '4ga Boards';

  useEffect(() => {
    document.title = `${t('common.pageNotFound', { context: 'title' })} | ${mainTitle}`;
  }, [t]);

  return (
    <>
      {isInitializing ? (
        <Loader active size="massive" />
      ) : (
        <>
          <FixedContainer />
          <h1 className={styles.text}>{t('common.pageNotFound', { context: 'title' })}</h1>
          {currentModal === ModalTypes.USER_SETTINGS && <UserSettingsModalContainer />}
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

NotFound.propTypes = {
  isInitializing: PropTypes.bool.isRequired,
  isSocketDisconnected: PropTypes.bool.isRequired,
  currentModal: PropTypes.oneOf(Object.values(ModalTypes)),
};

NotFound.defaultProps = {
  currentModal: undefined,
};

export default NotFound;
