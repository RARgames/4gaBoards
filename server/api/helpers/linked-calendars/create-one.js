module.exports = {
  inputs: {
    values: {
      type: 'ref',
      required: true,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    const { values, currentUser } = inputs;

    const count = await LinkedCalendar.count();

    return LinkedCalendar.create({
      provider: values.provider,
      name: values.name,
      externalId: values.externalId || null,
      feedUrl: values.feedUrl ? sails.helpers.utils.encryptSecret(values.feedUrl) : null,
      color: values.color,
      isEnabled: _.isUndefined(values.isEnabled) ? true : values.isEnabled,
      position: (count + 1) * sails.config.custom.positionGap,
      connectionId: values.connectionId || null,
      projectId: values.projectId || null,
      createdById: currentUser.id,
      updatedById: currentUser.id,
    }).fetch();
  },
};
