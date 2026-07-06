import { connect } from 'react-redux';

import CardMoveStep from '../components/CardMoveStep';
import selectors from '../selectors';

// The projects-to-lists tree is only needed once the move step is actually opened,
// so it's selected here instead of being computed and passed down by every card.
const mapStateToProps = (state) => ({
  projectsToLists: selectors.selectProjectsToListsForCurrentUser(state),
});

export default connect(mapStateToProps)(CardMoveStep);
