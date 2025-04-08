import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useSteps } from '../../../../hooks';
import { Button, ButtonStyle } from '../../Button';
import { Checkbox, CheckboxSize } from '../../Checkbox';
import withPopup from '../../Popup';
import Popup from '../../PopupElements';
import { ColumnSelectStep } from '../ColumnSelectPopup';

import * as s from './ActionsPopup.module.scss';

const StepTypes = {
  COLUMNS_SELECT: 'COLUMNS_SELECT',
};

const ActionsStep = React.memo(({ table, fitScreen, userPrefsKeys, onResetColumnWidths, onResetColumnSorting, onResetColumnVisibility, onUserPrefsUpdate, onClose }) => {
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();

  const handleSelectColumnsClick = useCallback(() => {
    openStep(StepTypes.COLUMNS_SELECT);
  }, [openStep]);

  const handleResetColumnVisibilityClick = useCallback(() => {
    onResetColumnVisibility();
    setTimeout(() => {
      onResetColumnWidths(false, fitScreen);
      onUserPrefsUpdate({
        [userPrefsKeys.columnVisibility]: table.getState().columnVisibility,
      });
    }, 0);
    onClose();
  }, [fitScreen, onClose, onResetColumnVisibility, onResetColumnWidths, onUserPrefsUpdate, table, userPrefsKeys.columnVisibility]);

  const handleResetColumnWidths = useCallback(
    (fitScreenVariant) => {
      onResetColumnWidths(false, fitScreenVariant);
      onClose();
      setTimeout(() => {
        onUserPrefsUpdate({
          [userPrefsKeys.fitScreen]: fitScreenVariant,
        });
      }, 0);
    },
    [onClose, onResetColumnWidths, onUserPrefsUpdate, userPrefsKeys.fitScreen],
  );

  const handleResetColumnSorting = useCallback(() => {
    onResetColumnSorting();
    onClose();
  }, [onClose, onResetColumnSorting]);

  if (step) {
    switch (step.type) {
      case StepTypes.COLUMNS_SELECT:
        return (
          <ColumnSelectStep
            table={table}
            fitScreen={fitScreen}
            userPrefsKeys={userPrefsKeys}
            skipColumns={['actions']}
            onResetColumnWidths={onResetColumnWidths}
            onUserPrefsUpdate={onUserPrefsUpdate}
            onBack={handleBack}
          />
        );
      default:
    }
  }

  return (
    <>
      <Button style={ButtonStyle.PopupContext} content={t('common.selectColumns')} onClick={handleSelectColumnsClick} />
      <Button style={ButtonStyle.PopupContext} content={t('common.resetColumnVisibility')} onClick={handleResetColumnVisibilityClick} />
      <Popup.Separator />
      <Button style={ButtonStyle.PopupContext} title={t('common.resetColumnWidths')} onClick={() => handleResetColumnWidths(false)} className={s.buttonWithCheckbox}>
        <Checkbox checked={!fitScreen} size={CheckboxSize.Size14} readOnly />
        {t('common.resetColumnWidths')}
      </Button>
      <Button style={ButtonStyle.PopupContext} title={t('common.resetColumnWidthsFitScreen')} onClick={() => handleResetColumnWidths(true)} className={s.buttonWithCheckbox}>
        <Checkbox checked={fitScreen} size={CheckboxSize.Size14} readOnly />
        {t('common.resetColumnWidthsFitScreen')}
      </Button>
      <Popup.Separator />
      <Button style={ButtonStyle.PopupContext} content={t('common.resetColumnSorting')} onClick={handleResetColumnSorting} />
    </>
  );
});

ActionsStep.propTypes = {
  table: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  fitScreen: PropTypes.bool.isRequired,
  userPrefsKeys: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onResetColumnWidths: PropTypes.func.isRequired,
  onResetColumnSorting: PropTypes.func.isRequired,
  onResetColumnVisibility: PropTypes.func.isRequired,
  onUserPrefsUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(ActionsStep);
