// eslint-disable-next-line import/prefer-default-export
export const transformTimeEntry = (timeEntry) => ({
  ...timeEntry,
  startedAt: new Date(timeEntry.startedAt),
  endedAt: new Date(timeEntry.endedAt),
  ...(timeEntry.createdAt && {
    createdAt: new Date(timeEntry.createdAt),
  }),
  ...(timeEntry.updatedAt && {
    updatedAt: new Date(timeEntry.updatedAt),
  }),
});
