import React, { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { Checkbox, CheckboxSize } from '../../Checkbox';
import withPopup from '../../Popup';
import Popup from '../../PopupElements';

import * as s from './ColumnSelectPopup.module.scss';

const ColumnSelectStep = React.memo(({ table, fitScreen, userPrefsKeys, skipColumns, onResetColumnWidths, onUserPrefsUpdate, onBack }) => {
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
  onUserPrefsUpdate: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

ColumnSelectStep.defaultProps = {
  onBack: undefined,
};

export default withPopup(ColumnSelectStep);
export { ColumnSelectStep };
