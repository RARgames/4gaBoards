import React, { useCallback } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import PropTypes from 'prop-types';

import { Button, ButtonStyle, Popup, Icon, IconType, IconSize, withPopup } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './ShowSecretStep.module.scss';

const ShowSecretStep = React.memo(({ id, secret, onBack, onClose }) => {
  const [t] = useTranslation();

  const handleIdCopyClick = useCallback(() => {
    navigator.clipboard.writeText(id);
  }, [id]);

  const handleSecretCopyClick = useCallback(() => {
    navigator.clipboard.writeText(secret);
  }, [secret]);

  return (
    <>
      <Popup.Header onBack={onBack}>{t('common.secret')}</Popup.Header>
      <Popup.Content>
        <div className={s.secretDisclaimer}>
          <Trans i18nKey="common.secretDisclaimer" />
        </div>
        <div className={s.secretWrapper}>
          {t('common.clientId')}:
          <Button style={ButtonStyle.Icon} title={t('common.copyClientId')} onClick={handleIdCopyClick}>
            <Icon type={IconType.Copy} size={IconSize.Size12} />
          </Button>
          <span>{id || t('common.generating')}</span>
        </div>
        <div className={s.secretWrapper}>
          {t('common.clientSecret')}:
          <Button style={ButtonStyle.Icon} title={t('common.copyClientSecret')} onClick={handleSecretCopyClick}>
            <Icon type={IconType.Copy} size={IconSize.Size12} />
          </Button>
          <span>{secret || t('common.generating')}</span>
        </div>
        <div className={gs.controls}>
          <Button style={ButtonStyle.Submit} content={t('common.close')} onClick={onClose} />
        </div>
      </Popup.Content>
    </>
  );
});

ShowSecretStep.propTypes = {
  id: PropTypes.string,
  secret: PropTypes.string,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

ShowSecretStep.defaultProps = {
  id: null,
  secret: null,
  onBack: undefined,
};

export default withPopup(ShowSecretStep);
export { ShowSecretStep };
