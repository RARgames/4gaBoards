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

    const template = await BoardTemplate.updateOne(inputs.record.id).set({ updatedById: currentUser.id, ...values });

    if (template) {
      const isInstanceScope = template.isGlobal;
      await sails.helpers.actions.createOne.with({
        values: {
          ...(isInstanceScope ? {} : { userAccount: currentUser }),
          scope: isInstanceScope ? Action.Scopes.INSTANCE : Action.Scopes.USER,
          type: Action.Types.BOARD_TEMPLATE_UPDATE,
          data: {
            boardTemplateId: template.id,
            name: template.name,
            ...(values.name && { prevName: inputs.record.name }),
            ...(values.isGlobal !== undefined && { prevIsGlobal: inputs.record.isGlobal, isGlobal: template.isGlobal }),
          },
        },
        currentUser,
        request: inputs.request,
      });

      if (template.isGlobal || inputs.record.isGlobal) {
        const users = await sails.helpers.users.getMany();

        users.forEach((user) => {
          sails.sockets.broadcast(`user:${user.id}`, 'boardTemplateUpdate', { item: template }, inputs.request);
        });
      } else {
        sails.sockets.broadcast(`user:${template.createdById}`, 'boardTemplateUpdate', { item: template }, inputs.request);
      }
    }
    return template;
  },
};
