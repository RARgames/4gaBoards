import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import AboutSettings from '../../components/Settings/AboutSettings';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state) => {
  const { demoMode } = selectors.selectCoreSettings(state);

  return {
    demoMode,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onGettingStartedProjectImport: entryActions.importGettingStartedProject,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(AboutSettings);
