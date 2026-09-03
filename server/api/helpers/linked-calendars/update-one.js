module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
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
    const values = _.pick(inputs.values, ['name', 'color', 'isEnabled', 'projectId']);

    // A re-entered feed URL clears the error state with it: the usual reason to change one is
    // that the old address was reset or wrong.
    if (inputs.values.feedUrl) {
      values.feedUrl = sails.helpers.utils.encryptSecret(inputs.values.feedUrl);
      values.status = LinkedCalendar.Statuses.ACTIVE;
      values.lastError = null;
    }

    return LinkedCalendar.updateOne({ id: inputs.record.id }).set({ ...values, updatedById: inputs.currentUser.id });
  },
};
