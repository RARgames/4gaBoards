import { createSelector } from 'redux-orm';

import orm from '../orm';
import getMeta from '../utils/get-meta';

export const makeSelectCommentById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Comment }, id) => {
      const commentModel = Comment.withId(id);

      if (!commentModel) {
        return commentModel;
      }

      return {
        ...commentModel.ref,
        ...getMeta(commentModel),
      };
    },
  );

export const selectCommentById = makeSelectCommentById();

export default {
  makeSelectCommentById,
  selectCommentById,
};
