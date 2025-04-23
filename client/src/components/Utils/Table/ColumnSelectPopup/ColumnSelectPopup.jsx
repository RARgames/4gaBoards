import React, { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { Button, ButtonStyle } from '../../Button';
import { Checkbox, CheckboxSize } from '../../Checkbox';
import withPopup from '../../Popup';
import Popup from '../../PopupElements';

import * as s from './ColumnSelectPopup.module.scss';

const ColumnSelectStep = React.memo(({ table, fitScreen, userPrefsKeys, skipColumns, onResetColumnWidths, onResetColumnVisibility, onUserPrefsUpdate, onBack }) => {
  const [t] = useTranslation();
  const [visibilityState, setVisibilityState] = useState(table.getState().columnVisibility);

  const handleColumnToggleVisibilityClick = useCallback(
    (column) => {
      const currentVisibility = visibilityState[column.id];

      column.toggleVisibility(!currentVisibility);
      setVisibilityState((prevState) => ({
        ...prevState,
        [column.id]: !currentVisibility,
      }));
    },
    [visibilityState],
  );

  const handleSelectDefaultClick = useCallback(() => {
    onResetColumnVisibility();
    setTimeout(() => {
      setVisibilityState(table.getState().columnVisibility);
    }, 0);
  }, [onResetColumnVisibility, table]);

  const handleSelectAllClick = useCallback(() => {
    const newVisibilityState = table.getAllColumns().reduce((acc, column) => {
      if (skipColumns.includes(column.id)) {
        return acc;
      }
      acc[column.id] = true;
      return acc;
    }, {});
    setVisibilityState(newVisibilityState);
    table.setColumnVisibility(newVisibilityState);
  }, [table, skipColumns]);

  const handleSelectNoneClick = useCallback(() => {
    const newVisibilityState = table.getAllColumns().reduce((acc, column) => {
      if (skipColumns.includes(column.id)) {
        return acc;
      }
      acc[column.id] = false;
      return acc;
    }, {});
    setVisibilityState(newVisibilityState);
    table.setColumnVisibility(newVisibilityState);
  }, [table, skipColumns]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onResetColumnWidths(true, fitScreen);
      onUserPrefsUpdate({
        [userPrefsKeys.columnVisibility]: visibilityState,
      });
    }, 0);

    return () => clearTimeout(timeout);
  }, [fitScreen, onResetColumnWidths, onUserPrefsUpdate, userPrefsKeys.columnVisibility, visibilityState]);

  return (
    <>
      <Popup.Header onBack={onBack}>{t('common.selectColumns')}</Popup.Header>
      <Popup.Content>
        <div>
          {table.getAllColumns().map((column) => {
            if (skipColumns.includes(column.id)) {
              return null;
            }
            return (
              <div key={column.id}>
                <Checkbox
                  checked={visibilityState[column.id]}
                  size={CheckboxSize.Size14}
                  className={s.checkbox}
                  onChange={() => handleColumnToggleVisibilityClick(column)}
                  title={t('common.toggleColumnVisibility')}
                />
                <span>{column.columnDef.header}</span>
                {column.columnDef.header !== column.columnDef.meta.headerTitle && <span className={s.headerTitle}>{column.columnDef.meta.headerTitle}</span>}
              </div>
            );
          })}
          <Button style={ButtonStyle.NoBackground} title={t('common.selectDefault')} onClick={handleSelectDefaultClick} className={s.selectDefaultButton}>
            {t('common.selectDefault')}
          </Button>
          <Button style={ButtonStyle.NoBackground} title={t('common.selectAll')} onClick={handleSelectAllClick}>
            {t('common.selectAll')}
          </Button>
          <Button style={ButtonStyle.NoBackground} title={t('common.selectNone')} onClick={handleSelectNoneClick}>
            {t('common.selectNone')}
          </Button>
        </div>
      </Popup.Content>
    </>
  );
});

ColumnSelectStep.propTypes = {
  table: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  fitScreen: PropTypes.bool.isRequired,
  userPrefsKeys: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  skipColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
  onResetColumnWidths: PropTypes.func.isRequired,
  onResetColumnVisibility: PropTypes.func.isRequired,
  onUserPrefsUpdate: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

ColumnSelectStep.defaultProps = {
  onBack: undefined,
};

export default withPopup(ColumnSelectStep);
export { ColumnSelectStep };
