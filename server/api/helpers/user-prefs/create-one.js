const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    values: {
      type: 'json',
      custom: valuesValidator,
      required: true,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
  },

  exits: {
    idAlreadyInUse: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    const userPrefs = await UserPrefs.create({
      ...values,
    })
      .intercept(
        {
          message: 'Unexpected error from database adapter: conflicting key value violates exclusion constraint "id"',
        },
        'idAlreadyInUse',
      )
      .fetch();

    return userPrefs;
  },
};
