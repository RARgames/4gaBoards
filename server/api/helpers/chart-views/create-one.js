const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isPlainObject(value.project)) {
    return false;
  }

  if (!_.isString(value.type) || !value.type.trim()) {
    return false;
  }

  if (!_.isString(value.name) || !value.name.trim()) {
    return false;
  }

  if (!_.isFinite(value.position)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      custom: valuesValidator,
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

    const chartView = await ChartView.create({
      type: values.type,
      name: values.name,
      config: values.config || {},
      position: values.position,
      projectId: values.project.id,
      createdById: currentUser.id,
      updatedById: currentUser.id,
    }).fetch();

    if (chartView) {
      sails.sockets.broadcast(`project:${values.project.id}`, 'chartViewCreate', { item: chartView }, inputs.request);
    }

    return chartView;
  },
};
