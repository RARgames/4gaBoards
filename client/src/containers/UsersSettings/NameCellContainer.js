import { connect } from 'react-redux';

import NameCell from '../../components/Settings/UsersSettings/NameCell';
import selectors from '../../selectors';

const makeMapStateToProps = () => {
  return (state, { id }) => {
    const currentUser = selectors.selectCurrentUser(state);
    const isCurrentUser = currentUser.id === id;

    return {
      isCurrentUser,
    };
  };
};

export default connect(makeMapStateToProps)(NameCell);
