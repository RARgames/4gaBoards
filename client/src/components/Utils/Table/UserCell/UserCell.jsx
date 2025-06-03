import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import User from '../../../User';

const UserCell = React.memo(({ value, cellClassName }) => {
  return <div className={classNames(cellClassName)}>{value && <User name={value.name} avatarUrl={value.avatarUrl} size="card" />}</div>;
});

UserCell.propTypes = {
  value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  cellClassName: PropTypes.string,
};

UserCell.defaultProps = {
  value: undefined,
  cellClassName: '',
};

export default UserCell;
