import ActionTypes from '../../constants/ActionTypes';

const initialState = {
  isFetching: false,
  items: [],
  error: null,
};

// eslint-disable-next-line default-param-last
export default (state = initialState, { type, payload }) => {
  switch (type) {
    case ActionTypes.PROJECT_MEMBERS_OVERVIEW_FETCH:
      return {
        ...state,
        isFetching: true,
        error: null,
      };
    case ActionTypes.PROJECT_MEMBERS_OVERVIEW_FETCH__SUCCESS:
      return {
        ...state,
        isFetching: false,
        items: payload.items,
      };
    case ActionTypes.PROJECT_MEMBERS_OVERVIEW_FETCH__FAILURE:
      return {
        ...state,
        isFetching: false,
        error: payload.error,
      };
    default:
      return state;
  }
};
