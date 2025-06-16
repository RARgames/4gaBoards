import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import User from '../../../User';

const UserCell = React.memo(({ value, isNotMemberTitle, cellClassName, getIsMember }) => {
  return <div className={classNames(cellClassName)}>{value && <User name={value.name} avatarUrl={value.avatarUrl} size="card" isMember={getIsMember(value.id)} isNotMemberTitle={isNotMemberTitle} />}</div>;
});

UserCell.propTypes = {
  value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  isNotMemberTitle: PropTypes.string,
  cellClassName: PropTypes.string,
  getIsMember: PropTypes.func,
};

UserCell.defaultProps = {
  value: undefined,
  isNotMemberTitle: undefined,
  cellClassName: '',
  getIsMember: () => true,
};

export default UserCell;
