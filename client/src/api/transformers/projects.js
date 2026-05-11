// eslint-disable-next-line import-x/prefer-default-export
export const transformProject = (project) => ({
  ...project,
  ...(project.createdAt && {
    createdAt: new Date(project.createdAt),
  }),
  ...(project.updatedAt && {
    updatedAt: new Date(project.updatedAt),
  }),
});
