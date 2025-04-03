import React from 'react';
import PropTypes from 'prop-types';

import DueDate from '../../../DueDate';

const DateCell = React.memo(({ date, cellClassName }) => {
  if (!date) {
    return null;
  }

  return (
    <div className={cellClassName}>
      <DueDate value={date} variant="listView" />
    </div>
  );
});

DateCell.propTypes = {
  date: PropTypes.instanceOf(Date),
  cellClassName: PropTypes.string,
};

DateCell.defaultProps = {
  date: undefined,
  cellClassName: '',
};

export default DateCell;
