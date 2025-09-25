const path = require('path');
const rimraf = require('rimraf');

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    card: {
      type: 'ref',
      required: true,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
    skipMetaUpdate: {
      type: 'boolean',
      defaultsTo: false,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { currentUser, skipMetaUpdate } = inputs;

    if (inputs.record.id === inputs.card.coverAttachmentId) {
      await sails.helpers.cards.updateOne.with({
        record: inputs.card,
        values: {
          coverAttachmentId: null,
        },
        currentUser,
        request: inputs.request,
      });
    }

    await Attachment.updateOne(inputs.record.id).set({ updatedById: currentUser.id });
    const attachment = await Attachment.archiveOne(inputs.record.id);

    if (attachment) {
      const sameDirnameAttachments = await Attachment.find({
        dirname: attachment.dirname,
      });
      if (sameDirnameAttachments.length === 0) {
        try {
          rimraf.sync(path.join(sails.config.custom.attachmentsPath, attachment.dirname));
        } catch (error) {
          console.warn(error.stack); // eslint-disable-line no-console
        }
      }

      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'attachmentDelete',
        {
          item: attachment,
        },
        inputs.request,
      );

      await sails.helpers.actions.createOne.with({
        values: {
          card: inputs.card,
          scope: Action.Scopes.CARD,
          type: Action.Types.CARD_ATTACHMENT_DELETE,
          data: {
            attachmentId: attachment.id,
            attachmentName: attachment.name,
          },
        },
        currentUser,
      });

      await sails.helpers.cards.updateMeta.with({ id: attachment.cardId, currentUser, skipMetaUpdate });
    }

    return attachment;
  },
};
