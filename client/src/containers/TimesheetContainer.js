import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Timesheet from '../components/Timesheet';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const mapStateToProps = (state) => {
  const currentUser = selectors.selectCurrentUser(state);
  const { projects } = selectors.selectProjectsForCurrentUser(state);
  const timeEntries = selectors.selectTimeEntries(state);
  const assignedCards = selectors.selectCardsAssignedToCurrentUser(state);
  const allCards = selectors.selectAllCardsForPicker(state);
  const users = selectors.selectUsers(state);
  const accessToken = selectors.selectAccessToken(state);
  const categoryTags = selectors.selectCategoryTags(state);

  return {
    currentUserId: currentUser ? currentUser.id : null,
    isAdmin: !!(currentUser && currentUser.isAdmin),
    projects,
    timeEntries,
    assignedCards,
    allCards,
    users,
    accessToken,
    categoryTags: categoryTags.items,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onFetch: entryActions.fetchTimeEntries,
      onCreate: entryActions.createTimeEntry,
      onUpdate: entryActions.updateTimeEntry,
      onDelete: entryActions.deleteTimeEntry,
      onFetchCategoryTags: entryActions.fetchCategoryTags,
      onCreateCategoryTag: entryActions.createCategoryTag,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Timesheet);
