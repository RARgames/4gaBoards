import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { Popup, withViewportPopup } from '../Utils';

import * as s from './EmailVerificationStatusPopup.module.scss';

const EmailVerificationStatusPopup = React.memo(({ status, reason }) => {
  const [t] = useTranslation();

  return (
    <Popup.Content className={s.content} isMinContent>
      <div className={s.title}>{t(status === 'success' ? 'common.emailVerificationSuccess' : 'common.emailVerificationFailure', { context: 'title' })}</div>
      {status === 'error' && (
        <>
          <div className={s.details}>{t('common.pleaseTryAgain')}</div>
          <div className={s.details}>{t('common.reason', { reason })}</div>
        </>
      )}
    </Popup.Content>
  );
});

EmailVerificationStatusPopup.propTypes = {
  status: PropTypes.oneOf(['success', 'error']).isRequired,
  reason: PropTypes.string,
};

EmailVerificationStatusPopup.defaultProps = {
  reason: undefined,
};

export default withViewportPopup(EmailVerificationStatusPopup);
