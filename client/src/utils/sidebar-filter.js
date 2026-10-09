export const filterSidebarProjects = (projects, filter) => {
  if (!filter) {
    return projects;
  }

  const query = filter.query.toLowerCase();

  if (filter.target === 'project') {
    return projects.filter((project) => project.name.toLowerCase().includes(query));
  }

  if (filter.target === 'board') {
    return projects
      .map((project) => ({
        ...project,
        boards: project.boards.filter((board) => board.name.toLowerCase().includes(query)),
      }))
      .filter((project) => project.boards.length > 0);
  }

  return projects;
};

export const filterSidebarBoards = (boards, filter) => {
  if (!filter || filter.target !== 'board') {
    return boards;
  }

  const query = filter.query.toLowerCase();

  return boards.filter((board) => board.name.toLowerCase().includes(query));
};
