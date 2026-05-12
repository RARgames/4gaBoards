const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isPlainObject(value.data)) {
    return false;
  }

  if (!Array.isArray(value.data.lists) || !Array.isArray(value.data.labels)) {
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

    const template = await BoardTemplate.create({
      ...values,
      createdById: currentUser.id,
    }).fetch();

    if (template) {
      const isInstanceScope = template.isGlobal;
      const listNames = values.data.lists.map((list) => list.name);
      const labelNames = values.data.labels.map((label) => label.name);

      await sails.helpers.actions.createOne.with({
        values: {
          ...(isInstanceScope ? {} : { userAccount: currentUser }),
          scope: isInstanceScope ? Action.Scopes.INSTANCE : Action.Scopes.USER,
          type: Action.Types.BOARD_TEMPLATE_CREATE,
          data: {
            boardTemplateId: template.id,
            name: template.name,
            isGlobal: template.isGlobal,
            listNames,
            labelNames,
          },
        },
        currentUser,
        request: inputs.request,
      });

      if (template.isGlobal) {
        const users = await sails.helpers.users.getMany();

        users.forEach((user) => {
          sails.sockets.broadcast(`user:${user.id}`, 'boardTemplateCreate', { item: template }, inputs.request);
        });
      } else {
        sails.sockets.broadcast(`user:${template.createdById}`, 'boardTemplateCreate', { item: template }, inputs.request);
      }
    }

    return template;
  },
};
