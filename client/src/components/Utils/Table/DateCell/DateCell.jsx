import React from 'react';
import PropTypes from 'prop-types';

import DueDate from '../../../DueDate';

const DateCell = React.memo(({ date, cellClassName, className, showUndefined }) => {
  if (!date && !showUndefined) {
    return null;
  }

  return (
    <div className={cellClassName}>
      <DueDate value={date} variant="listView" className={className} showUndefined={showUndefined} />
    </div>
  );
});

DateCell.propTypes = {
  date: PropTypes.instanceOf(Date),
  cellClassName: PropTypes.string,
  className: PropTypes.string,
  showUndefined: PropTypes.bool,
};

DateCell.defaultProps = {
  date: undefined,
  cellClassName: '',
  className: '',
  showUndefined: false,
};

export default DateCell;
