import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import selectors from '../../selectors';
import entryActions from '../../entry-actions';

import AboutSettings from '../../components/Settings/AboutSettings';

const mapStateToProps = (state) => {
  const coreSettings = selectors.selectCoreSettings(state);

  return {
    demoMode: coreSettings.demoMode,
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
