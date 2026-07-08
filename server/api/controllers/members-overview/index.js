const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
};

module.exports = {
  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn() {
    const { currentUser } = this.req;

    if (!currentUser.isAdmin) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const [users, projects, boards, projectManagers, projectMemberships, boardMemberships] = await Promise.all([
      sails.helpers.users.getMany({}),
      sails.helpers.projects.getMany({}),
      sails.helpers.boards.getMany({}),
      sails.helpers.projectManagers.getMany({}),
      sails.helpers.projectMemberships.getMany({}),
      sails.helpers.boardMemberships.getMany({}),
    ]);

    const projectById = _.keyBy(projects, 'id');
    const boardsByProjectId = _.groupBy(boards, 'projectId');
    const projectManagersByUserId = _.groupBy(projectManagers, 'userId');
    const projectMembershipsByUserId = _.groupBy(projectMemberships, 'userId');
    const boardMembershipsByUserId = _.groupBy(boardMemberships, 'userId');

    const items = users.map((rawUser) => {
      // toJSON() is required to get the avatarUrl computed by User.customToJSON() —
      // it isn't a real column, so accessing it on the raw record would be undefined.
      const user = rawUser.toJSON();

      const managerRecords = projectManagersByUserId[user.id] || [];
      const membershipRecords = projectMembershipsByUserId[user.id] || [];
      const userBoardMemberships = boardMembershipsByUserId[user.id] || [];

      const managerByProjectId = _.keyBy(managerRecords, 'projectId');
      const membershipByProjectId = _.keyBy(membershipRecords, 'projectId');
      const boardMembershipByBoardId = _.keyBy(userBoardMemberships, 'boardId');

      const projectIds = _.union(Object.keys(managerByProjectId), Object.keys(membershipByProjectId)).filter((projectId) => projectById[projectId]);

      const userProjects = projectIds.map((projectId) => {
        const project = projectById[projectId];
        const projectManager = managerByProjectId[projectId];
        const projectMembership = membershipByProjectId[projectId];

        const projectBoards = (boardsByProjectId[projectId] || []).map((board) => {
          const boardMembership = boardMembershipByBoardId[board.id];

          return {
            boardId: board.id,
            boardName: board.name,
            boardMembershipId: boardMembership ? boardMembership.id : null,
            role: boardMembership ? boardMembership.role : null,
          };
        });

        return {
          projectId: project.id,
          projectName: project.name,
          role: projectManager ? 'manager' : 'member',
          projectManagerId: projectManager ? projectManager.id : null,
          projectMembershipId: projectMembership ? projectMembership.id : null,
          boards: projectBoards,
        };
      });

      return {
        userId: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isAdmin: user.isAdmin,
        lastLogin: user.lastLogin,
        projects: userProjects,
      };
    });

    return {
      items,
    };
  },
};
