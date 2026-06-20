module.exports = {
  inputs: {
    board: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    // FUTURE this seems to be obsolete - all project managers should be also board memebers
    const projectManagerUserIds = await sails.helpers.projects.getManagerUserIds(inputs.board.projectId);
    const boardMemberUserIds = await sails.helpers.boards.getMemberUserIds(inputs.board.id);
    return _.union(projectManagerUserIds, boardMemberUserIds);
  },
};
