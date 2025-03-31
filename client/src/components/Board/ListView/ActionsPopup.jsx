import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useSteps } from '../../../hooks';
import { Button, ButtonStyle, withPopup } from '../../Utils';
import { ColumnSelectStep } from './ColumnSelectPopup';

const StepTypes = {
  COLUMNS_SELECT: 'COLUMNS_SELECT',
};

const ActionsStep = React.memo(({ table, onResetColumnWidths, onResetColumnSorting, onResetColumnVisibility, onClose }) => {
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();

  const handleSelectColumnsClick = useCallback(() => {
    openStep(StepTypes.COLUMNS_SELECT);
  }, [openStep]);

  const handleResetColumnVisibilityClick = useCallback(() => {
    onResetColumnVisibility();
    setTimeout(() => {
      onResetColumnWidths();
    }, 0);
    onClose();
  }, [onClose, onResetColumnVisibility, onResetColumnWidths]);

  if (step) {
    switch (step.type) {
      case StepTypes.COLUMNS_SELECT:
        return <ColumnSelectStep table={table} onResetColumnWidths={onResetColumnWidths} skipColumns={['actions']} onBack={handleBack} />;
      default:
    }
  }

  return (
    <>
      <Button style={ButtonStyle.PopupContext} content={t('common.resetColumnWidths')} onClick={onResetColumnWidths} />
      <Button style={ButtonStyle.PopupContext} content={t('common.selectColumns', { context: 'title' })} onClick={handleSelectColumnsClick} />
      <Button style={ButtonStyle.PopupContext} content={t('common.resetColumnSorting')} onClick={onResetColumnSorting} />
      <Button style={ButtonStyle.PopupContext} content={t('common.resetColumnVisibility')} onClick={handleResetColumnVisibilityClick} />
    </>
  );
});

ActionsStep.propTypes = {
  table: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onResetColumnWidths: PropTypes.func.isRequired,
  onResetColumnSorting: PropTypes.func.isRequired,
  onResetColumnVisibility: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(ActionsStep);
