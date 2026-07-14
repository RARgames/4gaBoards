module.exports = {
  async fn() {
    const { currentUser } = this.req;

    const managerProjectIds = await sails.helpers.users.getManagerProjectIds(currentUser.id);
    const managerProjects = await sails.helpers.projects.getMany(managerProjectIds);

    let boardMemberships = await sails.helpers.users.getBoardMemberships(currentUser.id);
    const membershipBoardIds = sails.helpers.utils.mapRecords(boardMemberships, 'boardId');

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

    const userIds = _.union(sails.helpers.utils.mapRecords(projectManagers, 'userId', true), sails.helpers.utils.mapRecords(projectMemberships, 'userId', true));
    const users = await sails.helpers.users.getMany(userIds);

    const managerBoards = await sails.helpers.projects.getBoards(managerProjectIds);

    membershipBoards = membershipBoards.filter((membershipBoard) => membershipProjectIds.includes(membershipBoard.projectId));

    const boards = [...managerBoards, ...membershipBoards];
    const boardIds = sails.helpers.utils.mapRecords(boards);

    boardMemberships = boardMemberships.filter((boardMembership) => boardIds.includes(boardMembership.boardId));

    return {
      items: projects,
      included: {
        users,
        projectManagers,
        boards,
        boardMemberships,
        projectMemberships,
      },
    };
  },
};
