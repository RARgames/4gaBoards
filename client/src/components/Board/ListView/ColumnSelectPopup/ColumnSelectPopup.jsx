import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { Popup, Checkbox, CheckboxSize, withPopup } from '../../../Utils';

import * as s from './ColumnSelectPopup.module.scss';

const ColumnSelectStep = React.memo(({ table, skipColumns, onResetColumnWidths, onBack }) => {
  const [t] = useTranslation();

  const handleColumnToggleVisibilityClick = useCallback(
    (column) => {
      column.toggleVisibility(!column.getIsVisible());
      setTimeout(() => {
        onResetColumnWidths();
      }, 0);
    },
    [onResetColumnWidths],
  );

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
                  checked={column.getIsVisible()}
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
  skipColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
  onResetColumnWidths: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

ColumnSelectStep.defaultProps = {
  onBack: undefined,
};

export default withPopup(ColumnSelectStep);
export { ColumnSelectStep };
