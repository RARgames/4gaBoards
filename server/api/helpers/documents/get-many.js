module.exports = {
  inputs: {
    projectId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  async fn(inputs) {
    return Document.find({ projectId: inputs.projectId }).sort('createdAt DESC');
  },
};
