import React from 'react';
import PropTypes from 'prop-types';

import ProjectSettingsModalContainer from '../../containers/ProjectSettingsModalContainer';

const Project = React.memo(({ isSettingsModalOpened }) => {
  return isSettingsModalOpened && <ProjectSettingsModalContainer />;
});

Project.propTypes = {
  isSettingsModalOpened: PropTypes.bool.isRequired,
};

export default Project;
