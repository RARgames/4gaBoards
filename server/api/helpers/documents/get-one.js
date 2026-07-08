module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      required: true,
    },
  },

  async fn(inputs) {
    return Document.findOne(inputs.criteria);
  },
};
