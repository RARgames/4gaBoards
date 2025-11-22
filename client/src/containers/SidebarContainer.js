import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Sidebar from '../components/Static/Sidebar';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const mapStateToProps = (state) => {
  const path = selectors.selectPathConstant(state);
  const { isAdmin } = selectors.selectCurrentUser(state);
  const { projectCreationAllEnabled } = selectors.selectCoreSettings(state);
  const { sidebarCompact } = selectors.selectCurrentUserPrefs(state);
  const { projects, filteredProjects } = selectors.selectProjectsForCurrentUser(state);
  const managedProjects = selectors.selectManagedProjectsForCurrentUser(state);
  const { projectId, boardId } = selectors.selectPath(state);
  const filter = selectors.selectFilterForCurrentUser(state);
  const filterQuery = filter?.query;
  const filterTarget = filter?.target;
  const {
    ui: {
      projectCreateForm: { data: defaultData, isSubmitting },
    },
  } = state;

  const selectMailCountForBoardId = selectors.makeSelectMailCountForBoardId();
  const selectMailsByBoardId = selectors.makeSelectMailsByBoardId();
  const mail = selectors.selectMailForCurrentUserByBoardId(state, boardId);
  const mailId = mail?.mailId ?? null;
  const mailCountForBoardId = selectMailCountForBoardId(state, boardId);
  const mailsForBoard = selectMailsByBoardId(state, boardId);

  return {
    path,
    projects,
    filteredProjects,
    managedProjects,
    currProjectId: projectId,
    currBoardId: boardId,
    isAdmin,
    canAddProject: projectCreationAllEnabled || isAdmin,
    defaultData,
    isSubmitting,
    filterQuery,
    filterTarget,
    sidebarCompact,
    mailId,
    mailCountForBoardId,
    mailsForBoard,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onProjectCreate: entryActions.createProject,
      onProjectUpdate: entryActions.updateProject,
      onBoardCreate: entryActions.createBoard,
      onBoardUpdate: entryActions.updateBoard,
      onBoardMove: entryActions.moveBoard,
      onBoardDelete: entryActions.deleteBoard,
      onBoardExport: entryActions.exportBoard,
      onChangeFilterQuery: entryActions.updateCurrentUserFilterQuery,
      onUserProjectUpdate: entryActions.updateUserProject,
      onMailCreate: (boardId) => entryActions.createMail({ boardId }),
      onMailUpdate: (boardId) => entryActions.updateMail({ boardId }),
      onMailDelete: (mailId) => entryActions.deleteMail(mailId),
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
