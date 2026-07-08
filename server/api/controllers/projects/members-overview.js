const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
};

module.exports = {
  inputs: {
    projectId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    projectNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const project = await Project.findOne(inputs.projectId);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const { isAdmin, isManager } = await sails.helpers.projects.getMembershipContext.with({ projectId: project.id, currentUser });

    if (!isAdmin && !isManager) {
      throw Errors.PROJECT_NOT_FOUND; // Forbidden
    }

    const boards = await sails.helpers.projects.getBoards(project.id);
    const boardIds = sails.helpers.utils.mapRecords(boards);

    const [projectManagers, projectMemberships, boardMemberships] = await Promise.all([
      sails.helpers.projectManagers.getMany({ projectId: project.id }),
      sails.helpers.projectMemberships.getMany({ projectId: project.id }),
      sails.helpers.boardMemberships.getMany({ boardId: boardIds }),
    ]);

    const userIds = _.union(sails.helpers.utils.mapRecords(projectManagers, 'userId', true), sails.helpers.utils.mapRecords(projectMemberships, 'userId', true));
    const users = await sails.helpers.users.getMany(userIds);

    const managerByUserId = _.keyBy(projectManagers, 'userId');
    const membershipByUserId = _.keyBy(projectMemberships, 'userId');
    const boardMembershipsByUserId = _.groupBy(boardMemberships, 'userId');

    const items = users.map((rawUser) => {
      // toJSON() is required to get the avatarUrl computed by User.customToJSON()
      const user = rawUser.toJSON();

      const manager = managerByUserId[user.id];
      const membership = membershipByUserId[user.id];
      const boardMembershipByBoardId = _.keyBy(boardMembershipsByUserId[user.id] || [], 'boardId');

      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: manager ? 'manager' : 'member',
        projectManagerId: manager ? manager.id : null,
        projectMembershipId: membership ? membership.id : null,
        canEditWiki: membership ? membership.canEditWiki : null,
        canManageDocuments: membership ? membership.canManageDocuments : null,
        boards: boards.map((board) => {
          const boardMembership = boardMembershipByBoardId[board.id];

          return {
            boardId: board.id,
            boardName: board.name,
            boardMembershipId: boardMembership ? boardMembership.id : null,
            role: boardMembership ? boardMembership.role : null,
          };
        }),
      };
    });

    return {
      items,
    };
  },
};
