import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useSteps } from '../../../../hooks';
import { Button, ButtonStyle } from '../../Button';
import withPopup from '../../Popup';
import Popup from '../../PopupElements';
import { ColumnSelectStep } from '../ColumnSelectPopup';

const StepTypes = {
  COLUMNS_SELECT: 'COLUMNS_SELECT',
};

const ActionsStep = React.memo(({ table, listViewFitScreen, onResetColumnWidths, onResetColumnSorting, onResetColumnVisibility, onUserPrefsUpdate, onClose }) => {
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();

  const handleSelectColumnsClick = useCallback(() => {
    openStep(StepTypes.COLUMNS_SELECT);
  }, [openStep]);

  const handleResetColumnVisibilityClick = useCallback(() => {
    onResetColumnVisibility();
    setTimeout(() => {
      onResetColumnWidths(false, listViewFitScreen);
      onUserPrefsUpdate({
        listViewColumnVisibility: table.getState().columnVisibility,
      });
    }, 0);
    onClose();
  }, [listViewFitScreen, onClose, onResetColumnVisibility, onResetColumnWidths, onUserPrefsUpdate, table]);

  const handleResetColumnWidths = useCallback(
    (fitScreen) => {
      onResetColumnWidths(false, fitScreen);
      onClose();
      setTimeout(() => {
        onUserPrefsUpdate({
          listViewFitScreen: fitScreen,
        });
      }, 0);
    },
    [onClose, onResetColumnWidths, onUserPrefsUpdate],
  );

  const handleResetColumnSorting = useCallback(() => {
    onResetColumnSorting();
    onClose();
  }, [onClose, onResetColumnSorting]);

  if (step) {
    switch (step.type) {
      case StepTypes.COLUMNS_SELECT:
        return (
          <ColumnSelectStep table={table} listViewFitScreen={listViewFitScreen} skipColumns={['actions']} onResetColumnWidths={onResetColumnWidths} onUserPrefsUpdate={onUserPrefsUpdate} onBack={handleBack} />
        );
      default:
    }
  }

  return (
    <>
      <Button style={ButtonStyle.PopupContext} content={t('common.selectColumns')} onClick={handleSelectColumnsClick} />
      <Button style={ButtonStyle.PopupContext} content={t('common.resetColumnVisibility')} onClick={handleResetColumnVisibilityClick} />
      <Popup.Separator />
      <Button style={ButtonStyle.PopupContext} content={t('common.resetColumnWidths')} onClick={() => handleResetColumnWidths(false)} />
      <Button style={ButtonStyle.PopupContext} content={t('common.resetColumnWidthsFitScreen')} onClick={() => handleResetColumnWidths(true)} />
      <Button style={ButtonStyle.PopupContext} content={t('common.resetColumnSorting')} onClick={handleResetColumnSorting} />
    </>
  );
});

ActionsStep.propTypes = {
  table: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  listViewFitScreen: PropTypes.bool.isRequired,
  onResetColumnWidths: PropTypes.func.isRequired,
  onResetColumnSorting: PropTypes.func.isRequired,
  onResetColumnVisibility: PropTypes.func.isRequired,
  onUserPrefsUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(ActionsStep);
