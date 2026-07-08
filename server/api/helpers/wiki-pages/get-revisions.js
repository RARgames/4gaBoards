module.exports = {
  inputs: {
    wikiPageId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    limit: {
      type: 'number',
      defaultsTo: 20,
    },
  },

  async fn(inputs) {
    return WikiPageRevision.find({ wikiPageId: inputs.wikiPageId }).sort('createdAt DESC').limit(inputs.limit);
  },
};
