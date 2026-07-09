module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      defaultsTo: {},
    },
  },

  async fn(inputs) {
    return CategoryTag.find(inputs.criteria);
  },
};
