import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { Popup } from '../Utils';

const ExportConfirmationStep = React.memo(({ title, onBack, onClose }) => {
  const [t] = useTranslation();

  useEffect(() => {
    const timeout = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timeout);
  }, [onClose]);

  return (
    <>
      <Popup.Header onBack={onBack}>{title}</Popup.Header>
      <Popup.Content>{t('common.exportBoardExplanation', { context: 'title' })}</Popup.Content>
    </>
  );
});

ExportConfirmationStep.propTypes = {
  title: PropTypes.string.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

ExportConfirmationStep.defaultProps = {
  onBack: undefined,
};

export default ExportConfirmationStep;
