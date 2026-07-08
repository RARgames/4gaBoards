const MAX_REVISIONS = 100;

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
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
    const { record, currentUser } = inputs;
    const values = { ...inputs.values };

    const isContentChanging = !_.isUndefined(values.content) && values.content !== record.content;
    const isTitleChanging = !_.isUndefined(values.title) && values.title !== record.title;

    if (isContentChanging || isTitleChanging) {
      await WikiPageRevision.create({
        wikiPageId: record.id,
        title: record.title,
        content: record.content,
        createdById: currentUser.id,
      });

      const revisionIds = await WikiPageRevision.find({ wikiPageId: record.id }).sort('createdAt DESC').select(['id']);
      if (revisionIds.length > MAX_REVISIONS) {
        await WikiPageRevision.destroy({
          id: revisionIds.slice(MAX_REVISIONS).map((revision) => revision.id),
        });
      }
    }

    if (isTitleChanging) {
      values.slug = await sails.helpers.wikiPages.generateSlug.with({
        projectId: record.projectId,
        title: values.title,
        excludeId: record.id,
      });
    }

    if (!_.isUndefined(values.position)) {
      const parentId = _.isUndefined(values.parentId) ? record.parentId : values.parentId || null;

      const siblings = await WikiPage.find({
        projectId: record.projectId,
        parentId,
        id: { '!=': record.id },
      });

      const { position, repositions } = sails.helpers.utils.insertToPositionables(values.position, siblings);
      values.position = position;

      await Promise.all(
        repositions.map(async ({ id, position: nextPosition }) => {
          await WikiPage.updateOne(id).set({ position: nextPosition });

          sails.sockets.broadcast(`project:${record.projectId}`, 'wikiPageUpdate', { item: { id, position: nextPosition } }, inputs.request);
        }),
      );
    }

    if (!_.isUndefined(values.parentId)) {
      values.parentId = values.parentId || null;
    }

    const wikiPage = await WikiPage.updateOne(record.id).set({
      ...values,
      updatedById: currentUser.id,
    });

    if (wikiPage) {
      sails.sockets.broadcast(`project:${record.projectId}`, 'wikiPageUpdate', { item: wikiPage }, inputs.request);
    }

    return wikiPage;
  },
};
