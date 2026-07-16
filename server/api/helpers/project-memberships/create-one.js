const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isString(value.projectId)) {
    return false;
  }

  if (!_.isString(value.userId)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    values: {
      type: 'json',
      required: true,
      custom: valuesValidator,
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
    const { values } = inputs;

    const [lastMembership] = await ProjectMembership.find({ userId: values.userId }).sort('position DESC').limit(1);
    values.position = (lastMembership?.position || 0) + sails.config.custom.positionGap;

    const projectMembership = await ProjectMembership.findOrCreate(
      {
        projectId: values.projectId,
        userId: values.userId,
      },
      { ...values },
    ).tolerate('E_UNIQUE');

    return {
      projectMembership,
    };
  },
};
