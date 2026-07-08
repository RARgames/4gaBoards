module.exports = {
  inputs: {
    projectId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    title: {
      type: 'string',
      required: true,
    },
    excludeId: {
      type: 'string',
    },
  },

  async fn(inputs) {
    const base = _.kebabCase(inputs.title) || 'page';

    const siblings = await WikiPage.find({ projectId: inputs.projectId }).select(['id', 'slug']);
    const takenSlugs = new Set(siblings.filter((sibling) => sibling.id !== inputs.excludeId).map((sibling) => sibling.slug));

    if (!takenSlugs.has(base)) {
      return base;
    }

    let suffix = 2;
    while (takenSlugs.has(`${base}-${suffix}`)) {
      suffix += 1;
    }

    return `${base}-${suffix}`;
  },
};
