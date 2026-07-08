import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Wiki from '../../components/Project/Wiki';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state) => {
  const { projectId, wikiPageSlug } = selectors.selectPath(state);
  const wikiPages = selectors.selectWikiPagesForProject(state, projectId);
  const currentPage = wikiPageSlug ? selectors.selectWikiPageBySlug(state, projectId, wikiPageSlug) : undefined;
  const currentUser = selectors.selectCurrentUser(state);
  const isManager = selectors.selectIsCurrentUserManagerForCurrentProject(state);
  const membership = selectors.selectCurrentUserMembershipForProject(state, projectId);
  const { preferredDetailsFont } = selectors.selectCurrentUserPrefs(state);

  const canEdit = currentUser.isAdmin || isManager || !!(membership && membership.canEditWiki);

  const currentPageUpdatedByUser = currentPage && currentPage.updatedById ? selectors.selectUserById(state, currentPage.updatedById) : undefined;

  return {
    projectId,
    wikiPageSlug,
    wikiPages,
    currentPage,
    currentPageUpdatedByUser,
    canEdit,
    preferredDetailsFont,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onWikiPagesFetch: entryActions.fetchWikiPages,
      onWikiPageFetch: entryActions.fetchWikiPage,
      onCreate: entryActions.createWikiPageInProject,
      onUpdate: entryActions.updateWikiPage,
      onDelete: entryActions.deleteWikiPage,
      onRestoreRevision: entryActions.restoreWikiPageRevision,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Wiki);
