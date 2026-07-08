import ActionTypes from '../../constants/ActionTypes';

const initialState = {
  isFetching: false,
  documents: [],
  attachments: [],
  error: null,
};

// eslint-disable-next-line default-param-last
export default (state = initialState, { type, payload }) => {
  switch (type) {
    case ActionTypes.MEDIA_FETCH:
      return {
        ...state,
        isFetching: true,
        error: null,
      };
    case ActionTypes.MEDIA_FETCH__SUCCESS:
      return {
        ...state,
        isFetching: false,
        documents: payload.documents,
        attachments: payload.attachments,
      };
    case ActionTypes.MEDIA_FETCH__FAILURE:
      return {
        ...state,
        isFetching: false,
        error: payload.error,
      };
    default:
      return state;
  }
};
