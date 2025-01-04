import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ProjectSettings from '../../components/Settings/ProjectSettings';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state) => {
  const users = selectors.selectUsers(state);
  const { projectId } = selectors.selectPath(state);
  const { name, background, backgroundImage, isBackgroundImageUpdating } = selectors.selectProject(state, projectId);
  const managers = selectors.selectManagersForProject(state, projectId);

  return {
    projectId,
    name,
    background,
    backgroundImage,
    isBackgroundImageUpdating,
    managers,
    allUsers: users,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onUpdate: entryActions.updateProject,
      onBackgroundImageUpdate: entryActions.updateProjectBackgroundImage,
      onDelete: entryActions.deleteProject,
      onManagerCreate: entryActions.createManagerInProject,
      onManagerDelete: entryActions.deleteProjectManager,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(ProjectSettings);
