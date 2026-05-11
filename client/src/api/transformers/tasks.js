export const transformTask = (task) => ({
  ...task,
  ...(task.createdAt && {
    createdAt: new Date(task.createdAt),
  }),
  ...(task.updatedAt && {
    updatedAt: new Date(task.updatedAt),
  }),
  ...(task.dueDate && {
    dueDate: new Date(task.dueDate),
  }),
});

export const transformTaskData = (data) => ({
  ...data,
  ...(data.dueDate && {
    dueDate: data.dueDate.toISOString(),
  }),
});
