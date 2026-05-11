import ActionTypes from '../../constants/ActionTypes';

const initialState = {
  data: {
    email: '',
    password: '',
    policy: false,
  },
  isSubmitting: false,
  error: null,
};

// eslint-disable-next-line default-param-last
export default (state = initialState, { type, payload }) => {
  switch (type) {
    case ActionTypes.REGISTER:
      return {
        ...state,
        data: {
          ...state.data,
          ...payload.data,
        },
        isSubmitting: true,
      };
    case ActionTypes.REGISTER__SUCCESS:
      return initialState;
    case ActionTypes.REGISTER__FAILURE:
      return {
        ...state,
        isSubmitting: false,
        error: payload.error,
      };
    case ActionTypes.REGISTER_ERROR_CLEAR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};
