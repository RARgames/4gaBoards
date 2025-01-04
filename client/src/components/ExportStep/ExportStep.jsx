import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { Popup } from '../Utils';

// eslint-disable-next-line no-unused-vars
const ExportStep = React.memo(({ title, onBack, onClose }) => {
  const [t] = useTranslation();

  return (
    <>
      <Popup.Header onBack={onBack}>{title}</Popup.Header>
      <Popup.Content>{t('common.exportBoardExplanation', { context: 'title' })}</Popup.Content>
    </>
  );
});

ExportStep.propTypes = {
  title: PropTypes.string.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

ExportStep.defaultProps = {
  onBack: undefined,
};

export default ExportStep;
