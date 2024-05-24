import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../../selectors';
import entryActions from '../../entry-actions';
import ProfileSettings from '../../components/Settings/ProfileSettings';

const mapStateToProps = (state) => {
  const { name, avatarUrl, phone, organization, isAvatarUpdating } = selectors.selectCurrentUser(state);

  return {
    name,
    avatarUrl,
    phone,
    organization,
    isAvatarUpdating,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onUpdate: entryActions.updateCurrentUser,
      onAvatarUpdate: entryActions.updateCurrentUserAvatar,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(ProfileSettings);
