const crypto = require('crypto');

module.exports = {
  inputs: {
    listId: {
      type: 'string',
      allowNull: true,
    },
    boardId: {
      type: 'string',
      required: true,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
  },

  async fn({ listId, boardId, currentUser }) {
    const criteria = { userId: currentUser.id };

    if (listId) {
      criteria.listId = listId;
    } else {
      criteria.boardId = boardId;
      criteria.listId = null;
    }

    const existing = await Mail.findOne(criteria);
    if (!existing) {
      return null;
    }

    let mail;
    let newMailId;
    do {
      newMailId = crypto.randomBytes(8).toString('hex');
      /* eslint-disable-next-line no-await-in-loop */
      mail = await Mail.findOne({ mailId: newMailId });
    } while (mail);

    const updated = await Mail.updateOne({ id: existing.id }).set({
      mailId: newMailId,
      updatedAt: new Date().toUTCString(),
    });

    return updated;
  },
};
