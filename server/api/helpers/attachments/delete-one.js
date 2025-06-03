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
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { currentUser } = inputs;

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

      let card = await Card.findOne(attachment.cardId);
      if (card) {
        card = await Card.updateOne(card.id).set({ updatedById: currentUser.id });

        if (card) {
          sails.sockets.broadcast(`board:${card.boardId}`, 'cardUpdate', {
            item: {
              id: card.id,
              updatedAt: card.updatedAt,
              updatedById: card.updatedById,
            },
          });
        }
      }
    }

    return attachment;
  },
};
