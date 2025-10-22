const crypto = require('crypto');

const valuesValidator = (value) => {
  return _.isPlainObject(value) && typeof value.userId === 'string' && typeof value.projectId === 'string' && typeof value.boardId === 'string' && (typeof value.listId === 'string' || value.listId == null);
};

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      custom: valuesValidator,
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    let mailId;
    let mail;

    do {
      mailId = crypto.randomBytes(8).toString('hex');
      /* eslint-disable-next-line no-await-in-loop */
      mail = await Mail.findOne({ mailId });
    } while (mail);

    const newMail = await Mail.create({
      ...inputs.values,
      mailId,
    }).fetch();

    return newMail;
  },
};
