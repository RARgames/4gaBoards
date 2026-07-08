module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    revision: {
      type: 'ref',
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
    const { record, revision, currentUser } = inputs;

    await WikiPageRevision.create({
      wikiPageId: record.id,
      title: record.title,
      content: record.content,
      createdById: currentUser.id,
    });

    const slug =
      revision.title !== record.title
        ? await sails.helpers.wikiPages.generateSlug.with({
            projectId: record.projectId,
            title: revision.title,
            excludeId: record.id,
          })
        : record.slug;

    const wikiPage = await WikiPage.updateOne(record.id).set({
      title: revision.title,
      content: revision.content,
      slug,
      updatedById: currentUser.id,
    });

    if (wikiPage) {
      sails.sockets.broadcast(`project:${record.projectId}`, 'wikiPageUpdate', { item: wikiPage }, inputs.request);
    }

    return wikiPage;
  },
};
