// eslint-disable-next-line import/prefer-default-export
export const transformComment = (comment) => ({
  ...comment,
  ...(comment.createdAt && {
    createdAt: new Date(comment.createdAt),
  }),
  ...(comment.updatedAt && {
    updatedAt: new Date(comment.updatedAt),
  }),
});
