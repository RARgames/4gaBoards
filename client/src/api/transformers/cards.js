export const transformCard = (card) => ({
  ...card,
  ...(card.dueDate && {
    dueDate: new Date(card.dueDate),
  }),
  ...(card.timer && {
    timer: {
      ...card.timer,
      ...(card.timer.startedAt && {
        startedAt: new Date(card.timer.startedAt),
      }),
    },
  }),
  ...(card.createdAt && {
    createdAt: new Date(card.createdAt),
  }),
  ...(card.updatedAt && {
    updatedAt: new Date(card.updatedAt),
  }),
});

export const transformCardData = (data) => ({
  ...data,
  ...(data.dueDate && {
    dueDate: data.dueDate.toISOString(),
  }),
  ...(data.timer && {
    timer: {
      ...data.timer,
      ...(data.timer.startedAt && {
        startedAt: data.timer.startedAt.toISOString(),
      }),
    },
  }),
});
