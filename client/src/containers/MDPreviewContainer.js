import { connect } from 'react-redux';

import { MDPreview } from '../components/Utils/Markdown';
import selectors from '../selectors';

const mapStateToProps = (state) => {
  const { preferredDetailsFont } = selectors.selectCurrentUserPrefs(state);

  return {
    preferredDetailsFont,
  };
};

export default connect(mapStateToProps)(MDPreview);
