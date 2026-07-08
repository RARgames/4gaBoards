import EntryActionTypes from '../constants/EntryActionTypes';

const fetchMedia = (projectId) => ({
  type: EntryActionTypes.MEDIA_FETCH,
  payload: {
    projectId,
  },
});

export default {
  fetchMedia,
};
