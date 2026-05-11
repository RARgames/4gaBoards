import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import ColorPickerPopup from '../../../ColorPickerPopup';

import * as s from './ColorCell.module.scss';

const ColorCell = React.memo(({ value, name, title, cellClassName, cellClassNameInner, getTitle, onUpdate }) => {
  const [t] = useTranslation();

  return (
    <div className={clsx(s.wrapper, cellClassName)}>
      <ColorPickerPopup defaultValue={value} onUpdate={(newValue) => onUpdate(name, newValue)}>
        <div className={clsx(s.cell, cellClassNameInner)} title={getTitle ? getTitle(t, value) : title} style={{ backgroundColor: value }} />
      </ColorPickerPopup>
    </div>
  );
});

ColorCell.propTypes = {
  value: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  title: PropTypes.string,
  cellClassName: PropTypes.string,
  cellClassNameInner: PropTypes.string,
  getTitle: PropTypes.func,
  onUpdate: PropTypes.func.isRequired,
};

ColorCell.defaultProps = {
  title: '',
  cellClassName: '',
  cellClassNameInner: '',
  getTitle: undefined,
};

export default ColorCell;
