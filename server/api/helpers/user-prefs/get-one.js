const criteriaValidator = (value) => _.isString(value) || _.isPlainObject(value);

module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      custom: criteriaValidator,
      required: true,
    },
  },

  async fn(inputs) {
    const criteria = {};

    if (_.isString(inputs.criteria)) {
      criteria.id = inputs.criteria;
    } else if (_.isPlainObject(inputs.criteria)) {
      Object.assign(criteria, inputs.criteria);
    }

    let userPrefs = await UserPrefs.findOne(criteria);
    if (!userPrefs) {
      userPrefs = await sails.helpers.userPrefs.createOne.with({ values: { id: criteria.id } });
    }

    return userPrefs;
  },
};
