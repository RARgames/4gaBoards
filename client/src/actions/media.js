import ActionTypes from '../constants/ActionTypes';

const fetchMedia = () => ({
  type: ActionTypes.MEDIA_FETCH,
  payload: {},
});

fetchMedia.success = (documents, attachments) => ({
  type: ActionTypes.MEDIA_FETCH__SUCCESS,
  payload: {
    documents,
    attachments,
  },
});

fetchMedia.failure = (error) => ({
  type: ActionTypes.MEDIA_FETCH__FAILURE,
  payload: {
    error,
  },
});

export default {
  fetchMedia,
};
