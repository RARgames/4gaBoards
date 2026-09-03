import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Calendar from '../../components/Project/Calendar';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state) => {
  const { projectId } = selectors.selectPath(state);
  const schedulingData = selectors.selectSchedulingData(state, projectId);
  // Linked-calendar events are fetched by the component rather than kept in the ORM: they are
  // read-only, scoped to whatever range is on screen, and owned by the calendar provider.
  const accessToken = selectors.selectAccessToken(state);

  return {
    projectId,
    accessToken,
    schedulingData,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onBoardFetch: entryActions.fetchBoard,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Calendar);
