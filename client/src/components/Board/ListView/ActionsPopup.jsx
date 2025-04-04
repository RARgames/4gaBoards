import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useSteps } from '../../../hooks';
import { Button, ButtonStyle, Popup, withPopup } from '../../Utils';
import { ColumnSelectStep } from './ColumnSelectPopup';

const StepTypes = {
  COLUMNS_SELECT: 'COLUMNS_SELECT',
};

const ActionsStep = React.memo(({ table, onResetColumnWidths, onResetColumnSorting, onResetColumnVisibility, onUserPrefsUpdate, onClose }) => {
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();

  const handleSelectColumnsClick = useCallback(() => {
    openStep(StepTypes.COLUMNS_SELECT);
  }, [openStep]);

  const handleResetColumnVisibilityClick = useCallback(() => {
    onResetColumnVisibility();
    setTimeout(() => {
      onResetColumnWidths();
      onUserPrefsUpdate({
        listViewColumnVisibility: table.getState().columnVisibility,
      });
    }, 0);
    onClose();
  }, [onClose, onResetColumnVisibility, onResetColumnWidths, onUserPrefsUpdate, table]);

  const handleResetColumnWidths = useCallback(() => {
    onResetColumnWidths();
    onClose();
  }, [onClose, onResetColumnWidths]);

  const handleResetColumnSorting = useCallback(() => {
    onResetColumnSorting();
    onClose();
  }, [onClose, onResetColumnSorting]);

  if (step) {
    switch (step.type) {
      case StepTypes.COLUMNS_SELECT:
        return <ColumnSelectStep table={table} onResetColumnWidths={onResetColumnWidths} skipColumns={['actions']} onUserPrefsUpdate={onUserPrefsUpdate} onBack={handleBack} />;
      default:
    }
  }

  return (
    <>
      <Button style={ButtonStyle.PopupContext} content={t('common.selectColumns')} onClick={handleSelectColumnsClick} />
      <Button style={ButtonStyle.PopupContext} content={t('common.resetColumnVisibility')} onClick={handleResetColumnVisibilityClick} />
      <Popup.Separator />
      <Button style={ButtonStyle.PopupContext} content={t('common.resetColumnWidths')} onClick={handleResetColumnWidths} />
      <Button style={ButtonStyle.PopupContext} content={t('common.resetColumnSorting')} onClick={handleResetColumnSorting} />
    </>
  );
});

ActionsStep.propTypes = {
  table: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onResetColumnWidths: PropTypes.func.isRequired,
  onResetColumnSorting: PropTypes.func.isRequired,
  onResetColumnVisibility: PropTypes.func.isRequired,
  onUserPrefsUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(ActionsStep);
