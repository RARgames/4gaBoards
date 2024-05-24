import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import AboutSettings from '../../components/Settings/AboutSettings';

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AboutSettings);
