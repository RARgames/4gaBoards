import ActionTypes from '../../constants/ActionTypes';

const initialState = {
  isFetching: false,
  items: [],
  error: null,
};

// eslint-disable-next-line default-param-last
export default (state = initialState, { type, payload }) => {
  switch (type) {
    case ActionTypes.CATEGORY_TAGS_FETCH:
      return {
        ...state,
        isFetching: true,
        error: null,
      };
    case ActionTypes.CATEGORY_TAGS_FETCH__SUCCESS:
      return {
        ...state,
        isFetching: false,
        items: payload.items,
      };
    case ActionTypes.CATEGORY_TAGS_FETCH__FAILURE:
      return {
        ...state,
        isFetching: false,
        error: payload.error,
      };
    case ActionTypes.CATEGORY_TAG_CREATE__SUCCESS:
      return {
        ...state,
        items: [...state.items, payload.item],
      };
    default:
      return state;
  }
};
