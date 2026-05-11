import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import * as s from './DefaultCell.module.scss';

const DefaultCell = React.memo(({ value, title, cellClassName, cellClassNameInner, hideOnZero, showEmpty, getTitle }) => {
  const [t] = useTranslation();

  let cellValue = value;
  if (typeof value === 'number') {
    cellValue = value;
    if (hideOnZero && value === 0) {
      cellValue = '';
    }
  }
  if (showEmpty && value === undefined) {
    cellValue = '-';
  }

  return (
    <div className={clsx(cellClassName)}>
      <div className={clsx(s.cell, cellClassNameInner)} title={getTitle ? getTitle(t, value) : title}>
        {cellValue}
      </div>
    </div>
  );
});

DefaultCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string,
  cellClassName: PropTypes.string,
  cellClassNameInner: PropTypes.string,
  hideOnZero: PropTypes.bool,
  showEmpty: PropTypes.bool,
  getTitle: PropTypes.func,
};

DefaultCell.defaultProps = {
  value: undefined,
  title: '',
  cellClassName: '',
  cellClassNameInner: '',
  hideOnZero: false,
  showEmpty: false,
  getTitle: undefined,
};

export default DefaultCell;
