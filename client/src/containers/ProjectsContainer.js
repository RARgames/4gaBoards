import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Projects from '../components/Projects';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const mapStateToProps = (state) => {
  const { projects } = selectors.selectProjectsForCurrentUser(state);
  const filteredProjects = selectors.selectFilteredProjectsWithDetailsForCurrentUser(state);
  const isFiltered = selectors.selectIsFilteredForCurrentUser(state);
  const { projectCreationAllEnabled } = selectors.selectCoreSettings(state);
  const { isAdmin } = selectors.selectCurrentUser(state);
  const {
    ui: {
      projectCreateForm: { data: defaultData, isSubmitting },
    },
  } = state;
  const { rightClickContextMenu } = selectors.selectCurrentUserPrefs(state);
  const managedProjects = selectors.selectManagedProjectsForCurrentUser(state);
  const boardTemplates = selectors.selectBoardTemplatesForCurrentUser(state);

  return {
    projects,
    filteredProjects,
    isFiltered,
    canAdd: projectCreationAllEnabled || isAdmin,
    defaultData,
    isSubmitting,
    rightClickContextMenu,
    managedProjects,
    boardTemplates,
    isAdmin,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onCreate: entryActions.createProject,
      onUpdate: entryActions.updateProject,
      onBoardCreate: entryActions.createBoard,
      onBoardTemplateUpdate: entryActions.updateBoardTemplate,
      onBoardTemplateDelete: entryActions.deleteBoardTemplate,
      onActivitiesProjectFetch: entryActions.fetchProjectActivities,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Projects);
