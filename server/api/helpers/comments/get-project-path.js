module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      required: true,
    },
  },

  exits: {
    pathNotFound: {},
  },

  async fn(inputs) {
    const comment = await Comment.findOne(inputs.criteria);

    if (!comment) {
      throw 'pathNotFound';
    }

    const path = await sails.helpers.cards.getProjectPath(comment.cardId).intercept('pathNotFound', (nodes) => ({
      pathNotFound: {
        comment,
        ...nodes,
      },
    }));

    return {
      comment,
      ...path,
    };
  },
};
