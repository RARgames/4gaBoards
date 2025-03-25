import React from 'react';
import PropTypes from 'prop-types';

const DefaultCell = React.memo(({ value, title, cellClassName }) => {
  return (
    <div className={cellClassName}>
      <div title={title}>{value}</div>
    </div>
  );
});

DefaultCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]).isRequired,
  title: PropTypes.string,
  cellClassName: PropTypes.string,
};

DefaultCell.defaultProps = {
  title: '',
  cellClassName: '',
};

export default DefaultCell;
