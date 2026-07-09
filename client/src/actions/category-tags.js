import ActionTypes from '../constants/ActionTypes';

const fetchCategoryTags = () => ({
  type: ActionTypes.CATEGORY_TAGS_FETCH,
  payload: {},
});

fetchCategoryTags.success = (items) => ({
  type: ActionTypes.CATEGORY_TAGS_FETCH__SUCCESS,
  payload: {
    items,
  },
});

fetchCategoryTags.failure = (error) => ({
  type: ActionTypes.CATEGORY_TAGS_FETCH__FAILURE,
  payload: {
    error,
  },
});

const createCategoryTag = () => ({
  type: ActionTypes.CATEGORY_TAG_CREATE,
  payload: {},
});

createCategoryTag.success = (item) => ({
  type: ActionTypes.CATEGORY_TAG_CREATE__SUCCESS,
  payload: {
    item,
  },
});

createCategoryTag.failure = (error) => ({
  type: ActionTypes.CATEGORY_TAG_CREATE__FAILURE,
  payload: {
    error,
  },
});

export default {
  fetchCategoryTags,
  createCategoryTag,
};
