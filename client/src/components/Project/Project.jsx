import React from 'react';

import BoardsContainer from '../../containers/BoardsContainer';

import styles from './Project.module.scss';

const Project = React.memo(() => {
  return (
    <div className={styles.wrapper}>
      <BoardsContainer />
    </div>
  );
});

Project.propTypes = {};

export default Project;
