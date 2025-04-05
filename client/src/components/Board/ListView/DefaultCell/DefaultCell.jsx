import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const DefaultCell = React.memo(({ value, title, cellClassName, hideOnZero, getTitle }) => {
  const [t] = useTranslation();
  return (
    <div className={cellClassName}>
      <div title={getTitle ? getTitle(t, value) : title}>{typeof value === 'number' && hideOnZero && value === 0 ? '' : value}</div>
    </div>
  );
});

DefaultCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string,
  cellClassName: PropTypes.string,
  hideOnZero: PropTypes.bool,
  getTitle: PropTypes.func,
};

DefaultCell.defaultProps = {
  title: '',
  cellClassName: '',
  hideOnZero: false,
  getTitle: undefined,
};

export default DefaultCell;
