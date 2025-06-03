// eslint-disable-next-line import/prefer-default-export
export const transformBoard = (board) => ({
  ...board,
  ...(board.createdAt && {
    createdAt: new Date(board.createdAt),
  }),
  ...(board.updatedAt && {
    updatedAt: new Date(board.updatedAt),
  }),
});
