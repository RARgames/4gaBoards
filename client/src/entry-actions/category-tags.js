import EntryActionTypes from '../constants/EntryActionTypes';

const fetchCategoryTags = () => ({
  type: EntryActionTypes.CATEGORY_TAGS_FETCH,
  payload: {},
});

const createCategoryTag = (data) => ({
  type: EntryActionTypes.CATEGORY_TAG_CREATE,
  payload: {
    data,
  },
});

export default {
  fetchCategoryTags,
  createCategoryTag,
};
