import EntryActionTypes from '../constants/EntryActionTypes';

const closeModal = () => ({
  type: EntryActionTypes.MODAL_CLOSE,
  payload: {},
});

export default {
  closeModal,
};
