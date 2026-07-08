const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isPlainObject(value.project)) {
    return false;
  }

  if (!_.isString(value.title) || !value.title.trim()) {
    return false;
  }

  if (!_.isFinite(value.position)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      custom: valuesValidator,
      required: true,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values, currentUser } = inputs;
    const parentId = values.parentId || null;

    const slug = await sails.helpers.wikiPages.generateSlug.with({
      projectId: values.project.id,
      title: values.title,
    });

    const siblings = await WikiPage.find({ projectId: values.project.id, parentId });
    const { position, repositions } = sails.helpers.utils.insertToPositionables(values.position, siblings);

    await Promise.all(
      repositions.map(async ({ id, position: nextPosition }) => {
        await WikiPage.updateOne(id).set({ position: nextPosition });

        sails.sockets.broadcast(`project:${values.project.id}`, 'wikiPageUpdate', { item: { id, position: nextPosition } }, inputs.request);
      }),
    );

    const wikiPage = await WikiPage.create({
      title: values.title,
      slug,
      content: values.content || '',
      position,
      projectId: values.project.id,
      parentId,
      createdById: currentUser.id,
      updatedById: currentUser.id,
    }).fetch();

    if (wikiPage) {
      sails.sockets.broadcast(`project:${values.project.id}`, 'wikiPageCreate', { item: wikiPage }, inputs.request);
    }

    return wikiPage;
  },
};
