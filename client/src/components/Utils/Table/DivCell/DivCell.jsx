import React from 'react';
import PropTypes from 'prop-types';

const DivCell = React.memo(({ value, title, cellClassName, ariaLabel }) => {
  return (
    <div className={cellClassName} aria-label={ariaLabel} title={title}>
      {value}
    </div>
  );
});

DivCell.propTypes = {
  value: PropTypes.node,
  title: PropTypes.string,
  cellClassName: PropTypes.string,
  ariaLabel: PropTypes.string,
};

DivCell.defaultProps = {
  value: undefined,
  title: '',
  cellClassName: '',
  ariaLabel: undefined,
};

export default DivCell;
