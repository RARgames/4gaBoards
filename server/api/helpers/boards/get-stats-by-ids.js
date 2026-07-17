const idsValidator = (value) => _.isArray(value);

const emptyStats = () => ({
  lists: [],
  totalCount: 0,
  openCount: 0,
  doneCount: 0,
  dueSoonCount: 0,
  doneRecentCount: 0,
  lastActivityAt: null,
});

module.exports = {
  inputs: {
    boardIds: {
      type: 'ref',
      custom: idsValidator,
      required: true,
    },
  },

  async fn(inputs) {
    const statsByBoardId = new Map();

    if (inputs.boardIds.length === 0) {
      return statsByBoardId;
    }

    const { rows } = await sails.sendNativeQuery(
      `SELECT l.board_id                                   AS "boardId",
              l.id                                         AS "listId",
              l.name                                       AS "listName",
              l.type                                       AS "listType",
              l.position                                   AS "listPosition",
              COUNT(c.id)::int                             AS "cardCount",
              COUNT(c.id) FILTER (
                WHERE l.type <> 'done'
                  AND c.due_date IS NOT NULL
                  AND c.due_date <= NOW() + INTERVAL '7 days'
              )::int                                       AS "dueSoonCount",
              COUNT(c.id) FILTER (
                WHERE l.type = 'done'
                  AND c.updated_at >= NOW() - INTERVAL '7 days'
              )::int                                       AS "doneRecentCount",
              MAX(c.updated_at)                            AS "lastCardActivity"
         FROM list l
    LEFT JOIN card c ON c.list_id = l.id AND c.archived_at IS NULL
        WHERE l.board_id = ANY($1::bigint[])
     GROUP BY l.board_id, l.id
     ORDER BY l.board_id, l.position`,
      [inputs.boardIds],
    );

    rows.forEach((row) => {
      if (!statsByBoardId.has(row.boardId)) {
        statsByBoardId.set(row.boardId, emptyStats());
      }

      const stats = statsByBoardId.get(row.boardId);

      stats.lists.push({
        id: row.listId,
        name: row.listName,
        type: row.listType,
        cardCount: row.cardCount,
      });

      stats.totalCount += row.cardCount;
      if (row.listType === 'done') {
        stats.doneCount += row.cardCount;
      } else {
        stats.openCount += row.cardCount;
      }
      stats.dueSoonCount += row.dueSoonCount;
      stats.doneRecentCount += row.doneRecentCount;

      if (row.lastCardActivity && (!stats.lastActivityAt || row.lastCardActivity > stats.lastActivityAt)) {
        stats.lastActivityAt = row.lastCardActivity;
      }
    });

    return statsByBoardId;
  },
};
