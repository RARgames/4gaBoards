import React from 'react';
import PropTypes from 'prop-types';

import HeaderContainer from '../../containers/HeaderContainer';
import BoardActionsContainer from '../../containers/BoardActionsContainer';

import styles from './Fixed.module.scss';

function Fixed({ path, board }) {
  return (
    <div className={styles.wrapper}>
      <HeaderContainer path={path} />
      {board && !board.isFetching && <BoardActionsContainer />}
    </div>
  );
}

Fixed.propTypes = {
  path: PropTypes.string.isRequired,
  board: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

Fixed.defaultProps = {
  board: undefined,
};

export default Fixed;
