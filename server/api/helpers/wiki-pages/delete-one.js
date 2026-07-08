module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    withChildren: {
      type: 'boolean',
      defaultsTo: false,
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
    const { record, withChildren } = inputs;

    if (withChildren) {
      let idsToDelete = [record.id];
      let frontierIds = [record.id];

      while (frontierIds.length > 0) {
        const children = await WikiPage.find({ parentId: frontierIds }).select(['id']); // eslint-disable-line no-await-in-loop

        frontierIds = children.map((child) => child.id);
        idsToDelete = [...idsToDelete, ...frontierIds];
      }

      await WikiPageRevision.destroy({ wikiPageId: idsToDelete });
      await WikiPage.destroy({ id: idsToDelete });

      idsToDelete.forEach((id) => {
        sails.sockets.broadcast(`project:${record.projectId}`, 'wikiPageDelete', { item: { id } }, inputs.request);
      });
    } else {
      const children = await WikiPage.find({ parentId: record.id });

      if (children.length > 0) {
        await WikiPage.update({ parentId: record.id }).set({ parentId: record.parentId || null });

        children.forEach((child) => {
          sails.sockets.broadcast(`project:${record.projectId}`, 'wikiPageUpdate', { item: { id: child.id, parentId: record.parentId || null } }, inputs.request);
        });
      }

      await WikiPageRevision.destroy({ wikiPageId: record.id });
      await WikiPage.destroyOne(record.id);

      sails.sockets.broadcast(`project:${record.projectId}`, 'wikiPageDelete', { item: { id: record.id } }, inputs.request);
    }

    return record;
  },
};
