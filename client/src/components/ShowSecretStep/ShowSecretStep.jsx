import React, { useCallback } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import PropTypes from 'prop-types';

import { Button, ButtonStyle, Popup, Icon, IconType, IconSize, withPopup } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './ShowSecretStep.module.scss';

const ShowSecretStep = React.memo(({ secret, onBack, onClose }) => {
  const [t] = useTranslation();

  const handleCopyClick = useCallback(() => {
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
          <Button style={ButtonStyle.Icon} title={t('common.copySecret')} onClick={handleCopyClick}>
            <Icon type={IconType.Copy} size={IconSize.Size12} />
          </Button>
          {secret}
        </div>
        <div className={gs.controls}>
          <Button style={ButtonStyle.Submit} content={t('common.close')} onClick={onClose} />
        </div>
      </Popup.Content>
    </>
  );
});

ShowSecretStep.propTypes = {
  secret: PropTypes.string.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

ShowSecretStep.defaultProps = {
  onBack: undefined,
};

export default withPopup(ShowSecretStep);
export { ShowSecretStep };
