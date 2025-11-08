import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Notifications from '../components/Notifications';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const mapStateToProps = (state) => {
  const items = selectors.selectNotificationsForCurrentUser(state);

  return {
    items,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onUpdate: entryActions.updateNotification,
      onMarkAllAs: entryActions.markAllNotificationsAs,
      onDelete: entryActions.deleteNotification,
      onDeleteAll: entryActions.deleteAllNotifications,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);
