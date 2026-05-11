import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import NotificationCenter from '../components/NotificationCenter';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const mapStateToProps = (state) => {
  const { notifications: items, filteredNotifications: filteredItems } = selectors.selectNotificationsForCurrentUser(state);
  const filter = selectors.selectNotificationFilterForCurrentUser(state);

  return {
    items,
    filteredItems,
    filter,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onUpdate: entryActions.updateNotification,
      onMarkAllAs: entryActions.markAllNotificationsAs,
      onDelete: entryActions.deleteNotification,
      onDeleteAll: entryActions.deleteAllNotifications,
      onChangeFilterQuery: entryActions.updateCurrentUserNotificationFilterQuery,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(NotificationCenter);
