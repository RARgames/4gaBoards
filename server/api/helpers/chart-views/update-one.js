module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      required: true,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values, currentUser } = inputs;

    const chartView = await ChartView.updateOne(inputs.record.id).set({ ...values, updatedById: currentUser.id });

    if (chartView) {
      sails.sockets.broadcast(`project:${chartView.projectId}`, 'chartViewUpdate', { item: chartView }, inputs.request);
    }

    return chartView;
  },
};
