module.exports = {
  inputs: {
    record: {
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

    const template = await BoardTemplate.destroyOne(inputs.record.id);

    if (template) {
      const isInstanceScope = template.isGlobal;
      await sails.helpers.actions.createOne.with({
        values: {
          ...(isInstanceScope ? {} : { userAccount: currentUser }),
          scope: isInstanceScope ? Action.Scopes.INSTANCE : Action.Scopes.USER,
          type: Action.Types.BOARD_TEMPLATE_DELETE,
          data: {
            boardTemplateId: template.id,
            name: template.name,
            isGlobal: template.isGlobal,
          },
        },
        currentUser,
        request: inputs.request,
      });

      if (template.isGlobal) {
        const users = await sails.helpers.users.getMany();

        users.forEach((user) => {
          sails.sockets.broadcast(`user:${user.id}`, 'boardTemplateDelete', { item: template }, inputs.request);
        });
      } else {
        sails.sockets.broadcast(`user:${template.createdById}`, 'boardTemplateDelete', { item: template }, inputs.request);
      }
    }
    return template;
  },
};
