const COMPLETED_LIST_KEYWORDS = ['common.done', 'done', 'closed', 'finished', 'complete', 'completed'];

module.exports = {
  sync: true,

  inputs: {
    name: {
      type: 'string',
      required: true,
    },
  },

  fn(inputs) {
    const { name } = inputs;
    return COMPLETED_LIST_KEYWORDS.includes(name.trim().toLowerCase());
  },
};
