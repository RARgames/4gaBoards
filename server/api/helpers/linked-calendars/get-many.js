module.exports = {
  inputs: {
    projectId: {
      type: 'string',
      allowNull: true,
    },
    enabledOnly: {
      type: 'boolean',
      defaultsTo: false,
    },
  },

  async fn(inputs) {
    const criteria = {};

    // A calendar with no project is instance-wide, so a project's calendars are its own plus
    // every unpinned one.
    if (inputs.projectId) {
      criteria.or = [{ projectId: inputs.projectId }, { projectId: null }];
    }

    if (inputs.enabledOnly) {
      criteria.isEnabled = true;
    }

    return LinkedCalendar.find(criteria).sort('position ASC');
  },
};
