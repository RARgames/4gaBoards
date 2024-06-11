import React from 'react';
import PropTypes from 'prop-types';

import HeaderContainer from '../../containers/HeaderContainer';
import ProjectContainer from '../../containers/ProjectContainer';
import BoardActionsContainer from '../../containers/BoardActionsContainer';

import styles from './Fixed.module.scss';

function Fixed({ path, projectId, board }) {
  return (
    <div className={styles.wrapper}>
      <HeaderContainer path={path} />
      {projectId && <ProjectContainer />}
      {board && !board.isFetching && <BoardActionsContainer />}
    </div>
  );
}

Fixed.propTypes = {
  path: PropTypes.string.isRequired,
  projectId: PropTypes.string,
  board: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

Fixed.defaultProps = {
  projectId: undefined,
  board: undefined,
};

export default Fixed;
