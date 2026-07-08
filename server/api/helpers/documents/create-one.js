const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isPlainObject(value.project)) {
    return false;
  }

  if (!_.isString(value.name) || !value.name.trim()) {
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

    const document = await Document.create({
      ..._.omit(values, ['project']),
      projectId: values.project.id,
      createdById: currentUser.id,
      updatedById: currentUser.id,
    }).fetch();

    if (document) {
      sails.sockets.broadcast(`project:${values.project.id}`, 'documentCreate', { item: document }, inputs.request);
    }

    return document;
  },
};
