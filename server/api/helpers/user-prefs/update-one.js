const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      custom: valuesValidator,
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    emailAlreadyInUse: {},
    usernameAlreadyInUse: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    const userPrefs = await UserPrefs.updateOne({ id: inputs.record.id }).set({ ...values });

    sails.sockets.broadcast(
      `user:${inputs.record.id}`,
      'userPrefsUpdate',
      {
        item: userPrefs,
      },
      inputs.request,
    );

    return userPrefs;
  },
};
