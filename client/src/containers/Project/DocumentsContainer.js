import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Documents from '../../components/Project/Documents';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state) => {
  const { projectId } = selectors.selectPath(state);
  const documents = selectors.selectDocumentsForProject(state, projectId).map((document) => ({
    ...document,
    createdBy: document.createdById ? selectors.selectUserById(state, document.createdById) : undefined,
  }));
  const currentUser = selectors.selectCurrentUser(state);
  const isManager = selectors.selectIsCurrentUserManagerForCurrentProject(state);
  const membership = selectors.selectCurrentUserMembershipForProject(state, projectId);

  const canManage = currentUser.isAdmin || isManager || !!(membership && membership.canManageDocuments);

  return {
    projectId,
    documents,
    currentUserId: currentUser.id,
    isAdmin: currentUser.isAdmin,
    isManager,
    canManage,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onDocumentsFetch: entryActions.fetchDocuments,
      onCreate: entryActions.createDocumentInProject,
      onUpdate: entryActions.updateDocument,
      onDelete: entryActions.deleteDocument,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Documents);
