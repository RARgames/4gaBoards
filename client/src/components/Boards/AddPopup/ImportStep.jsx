import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { FilePicker, Popup } from '../../../lib/custom-ui';
import { Icon, IconType, IconSize } from '../../Utils/Icon';
import { ButtonTmp, ButtonStyle } from '../../Utils/Button';

import styles from './ImportStep.module.scss';

const ImportStep = React.memo(({ onSelect, onBack }) => {
  const [t] = useTranslation();

  const handleFileSelect = useCallback(
    (type, file) => {
      onSelect({
        type,
        file,
      });

      onBack();
    },
    [onSelect, onBack],
  );

  return (
    <>
      <Popup.Header onBack={onBack}>{t('common.importBoard', { context: 'title' })}</Popup.Header>
      <Popup.Content>
        <FilePicker onSelect={(file) => handleFileSelect('trello', file)} accept=".json">
          <ButtonTmp style={ButtonStyle.NoBackground} title={t('common.fromTrello')} className={styles.button}>
            <Icon type={IconType.Trello} size={IconSize.Size14} className={styles.icon} />
            {t('common.fromTrello')}
          </ButtonTmp>
        </FilePicker>
      </Popup.Content>
    </>
  );
});

ImportStep.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default ImportStep;
