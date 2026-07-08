module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const chartView = await ChartView.destroyOne(inputs.record.id);

    if (chartView) {
      sails.sockets.broadcast(`project:${chartView.projectId}`, 'chartViewDelete', { item: chartView }, inputs.request);
    }

    return chartView;
  },
};
