// eslint-disable-next-line import/prefer-default-export
export const transformChartView = (chartView) => ({
  ...chartView,
  ...(chartView.createdAt && {
    createdAt: new Date(chartView.createdAt),
  }),
  ...(chartView.updatedAt && {
    updatedAt: new Date(chartView.updatedAt),
  }),
});
