// Cross-board card search for the Timesheet's ticket picker, used before a project has been
// selected (once a project is picked, the client instead fetches every card on every one of that
// project's boards directly — see boards/cards-summary.js — so this endpoint only needs to cover
// the "search everything I can see" case). Scoped the same way the client already decides which
// projects/boards a user can see (client/src/models/User.js#getOrderedAvailableProjectsModelArray):
// boards the user is a direct member of, plus boards belonging to projects the user manages.

const RESULT_LIMIT = 25;

module.exports = {
  inputs: {
    q: {
      type: 'string',
      required: true,
    },
  },

  exits: {},

  async fn(inputs) {
    const { currentUser } = this.req;

    const query = inputs.q.trim();
    if (query.length < 2) {
      return {
        items: [],
        hasMore: false,
      };
    }

    const [memberBoardIds, managedProjectIds] = await Promise.all([sails.helpers.users.getMembershipBoardIds(currentUser.id), sails.helpers.users.getManagerProjectIds(currentUser.id)]);

    let managedBoardIds = [];
    if (managedProjectIds.length > 0) {
      const managedBoards = await Board.find({ projectId: managedProjectIds }).select(['id']);
      managedBoardIds = sails.helpers.utils.mapRecords(managedBoards);
    }

    const boardIds = _.uniq([...memberBoardIds, ...managedBoardIds]);

    if (boardIds.length === 0) {
      return {
        items: [],
        hasMore: false,
      };
    }

    // Fetch one extra row to know whether there are more matches than we're returning, without
    // needing a separate COUNT query.
    const cards = await Card.find({
      boardId: boardIds,
      name: { contains: query },
    })
      .select(['id', 'name', 'boardId', 'listId'])
      .sort('updatedAt DESC')
      .limit(RESULT_LIMIT + 1);

    const hasMore = cards.length > RESULT_LIMIT;
    const pageCards = cards.slice(0, RESULT_LIMIT);

    if (pageCards.length === 0) {
      return {
        items: [],
        hasMore: false,
      };
    }

    const cardBoardIds = sails.helpers.utils.mapRecords(pageCards, 'boardId', true);
    const listIds = sails.helpers.utils.mapRecords(pageCards, 'listId', true).filter((id) => id != null);

    const [boards, lists] = await Promise.all([Board.find({ id: cardBoardIds }).select(['id', 'name', 'projectId']), List.find({ id: listIds }).select(['id', 'name'])]);

    const projectIds = sails.helpers.utils.mapRecords(boards, 'projectId', true);
    const projects = await Project.find({ id: projectIds }).select(['id', 'name']);

    const boardsById = new Map(boards.map((board) => [board.id, board]));
    const listsById = new Map(lists.map((list) => [list.id, list]));
    const projectsById = new Map(projects.map((project) => [project.id, project]));

    const items = pageCards.map((card) => {
      const board = boardsById.get(card.boardId);
      const project = board ? projectsById.get(board.projectId) : null;
      const list = card.listId ? listsById.get(card.listId) : null;

      return {
        id: card.id,
        name: card.name,
        boardId: card.boardId,
        boardName: board ? board.name : null,
        projectId: board ? board.projectId : null,
        projectName: project ? project.name : null,
        listId: card.listId || null,
        listName: list ? list.name : null,
      };
    });

    return {
      items,
      hasMore,
    };
  },
};
