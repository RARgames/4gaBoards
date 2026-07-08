import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Media from '../../components/Project/Media';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state) => {
  const { projectId } = selectors.selectPath(state);
  const { isFetching, documents, attachments } = selectors.selectMedia(state);

  return {
    projectId,
    isFetching,
    documents,
    attachments,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onMediaFetch: entryActions.fetchMedia,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Media);
