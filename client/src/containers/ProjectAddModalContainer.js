import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import entryActions from '../entry-actions';
import ProjectAddModal from '../components/ProjectAddModal';

const mapStateToProps = (state) => {
  const {
    ui: {
      projectCreateForm: { data: defaultData, isSubmitting },
    },
  } = state;

  return {
    defaultData,
    isSubmitting,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onCreate: entryActions.createProject,
      onClose: entryActions.closeModal,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(ProjectAddModal);
