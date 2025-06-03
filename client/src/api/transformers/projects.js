// eslint-disable-next-line import/prefer-default-export
export const transformProject = (project) => ({
  ...project,
  ...(project.createdAt && {
    createdAt: new Date(project.createdAt),
  }),
  ...(project.updatedAt && {
    updatedAt: new Date(project.updatedAt),
  }),
});
