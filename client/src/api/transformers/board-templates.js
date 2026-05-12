// eslint-disable-next-line import-x/prefer-default-export
export const transformBoardTemplate = (boardTemplate) => ({
  ...boardTemplate,
  ...(boardTemplate.createdAt && {
    createdAt: new Date(boardTemplate.createdAt),
  }),
  ...(boardTemplate.updatedAt && {
    updatedAt: new Date(boardTemplate.updatedAt),
  }),
});
