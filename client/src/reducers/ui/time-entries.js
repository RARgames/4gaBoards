import ActionTypes from '../../constants/ActionTypes';

const initialState = {
  error: null,
};

// eslint-disable-next-line default-param-last
export default (state = initialState, { type, payload }) => {
  switch (type) {
    case ActionTypes.TIME_ENTRY_CREATE:
    case ActionTypes.TIME_ENTRY_UPDATE:
    case ActionTypes.TIME_ENTRY_DELETE:
      return {
        ...state,
        error: null,
      };
    case ActionTypes.TIME_ENTRY_CREATE__FAILURE:
    case ActionTypes.TIME_ENTRY_UPDATE__FAILURE:
    case ActionTypes.TIME_ENTRY_DELETE__FAILURE:
      return {
        ...state,
        error: payload.error,
      };
    default:
      return state;
  }
};
