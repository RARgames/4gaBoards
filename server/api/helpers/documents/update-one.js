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
    const { values, currentUser } = inputs;

    const document = await Document.updateOne(inputs.record.id).set({ ...values, updatedById: currentUser.id });

    if (document) {
      sails.sockets.broadcast(`project:${document.projectId}`, 'documentUpdate', { item: document }, inputs.request);
    }

    return document;
  },
};
