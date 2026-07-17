module.exports = {
  async fn() {
    const { currentUser } = this.req;

    const managerProjectIds = await sails.helpers.users.getManagerProjectIds(currentUser.id);
    const managerProjects = await sails.helpers.projects.getMany(managerProjectIds);

    // Only the current user's own board memberships — used solely to work out which non-managed
    // boards this user can see (§ below). Not what gets returned to the client; see boardMemberships.
    const currentUserBoardMemberships = await sails.helpers.users.getBoardMemberships(currentUser.id);
    const membershipBoardIds = sails.helpers.utils.mapRecords(currentUserBoardMemberships, 'boardId');

    let membershipBoards = await sails.helpers.boards.getMany({
      id: membershipBoardIds,
      projectId: {
        '!=': managerProjectIds,
      },
    });

    // A user can belong to a project (and see it) before having access to any of its boards —
    // e.g. an admin adds them to the project first, then grants board access separately.
    const currentUserProjectMemberships = await sails.helpers.projectMemberships.getMany({ userId: currentUser.id });

    let membershipProjectIds = _.union(sails.helpers.utils.mapRecords(membershipBoards, 'projectId', true), sails.helpers.utils.mapRecords(currentUserProjectMemberships, 'projectId', true)).filter(
      (projectId) => !managerProjectIds.includes(projectId),
    );

    const membershipProjects = await sails.helpers.projects.getMany(membershipProjectIds);

    membershipProjectIds = sails.helpers.utils.mapRecords(membershipProjects);

    const projectIds = [...managerProjectIds, ...membershipProjectIds];
    const projects = [...managerProjects, ...membershipProjects];

    const projectManagers = await sails.helpers.projects.getProjectManagers(projectIds);
    // Every accessible project's full member list (not just the current user's own membership) so
    // Gantt/Team Planner can resolve all project members, not only ones who are also managers.
    const projectMemberships = await sails.helpers.projectMemberships.getMany({ projectId: projectIds });

    const managerBoards = await sails.helpers.projects.getBoards(managerProjectIds);

    membershipBoards = membershipBoards.filter((membershipBoard) => membershipProjectIds.includes(membershipBoard.projectId));

    const boards = [...managerBoards, ...membershipBoards];
    const boardIds = sails.helpers.utils.mapRecords(boards);

    // Every returned board's full member list (not just the current user's own membership) so the
    // client can resolve each board's complete member set — e.g. the boards-overview "Members" stat,
    // which unions members across every board in the project.
    const boardMemberships = await sails.helpers.boardMemberships.getMany({ boardId: boardIds });

    const userIds = _.union(
      sails.helpers.utils.mapRecords(projectManagers, 'userId', true),
      sails.helpers.utils.mapRecords(projectMemberships, 'userId', true),
      sails.helpers.utils.mapRecords(boardMemberships, 'userId', true),
    );
    const users = await sails.helpers.users.getMany(userIds);

    const statsByBoardId = await sails.helpers.boards.getStatsByIds(boardIds);
    const boardsWithStats = boards.map((board) => ({
      ...board,
      stats: statsByBoardId.get(board.id) || null,
    }));

    return {
      items: projects,
      included: {
        users,
        projectManagers,
        boards: boardsWithStats,
        boardMemberships,
        projectMemberships,
      },
    };
  },
};
