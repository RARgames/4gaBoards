// Per-card logged-time totals for a whole board, in one round trip.
//
// cards/time-entries answers the same question for a single card, which is right
// for the card drawer and wrong for a board: Tech Team has 549 cards, so calling
// it per card is 549 requests on load. This aggregates in the database instead
// and returns only cards that actually have time against them, so the payload
// stays proportional to the tracked work rather than to the board.
//
// Membership-gated, matching boards/cards-summary: non-members shouldn't be able
// to enumerate a board's cards, so a non-member gets notFound rather than
// forbidden.

const Errors = {
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    boardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const board = await Board.findOne(inputs.id);
    if (!board) {
      throw Errors.BOARD_NOT_FOUND;
    }

    const boardMembership = await BoardMembership.findOne({ boardId: board.id, userId: currentUser.id });
    if (!boardMembership) {
      throw Errors.BOARD_NOT_FOUND;
    }

    // Summed in SQL: pulling the rows back to sum them in JS would move every
    // time entry on the board across the wire to produce one integer per card.
    const result = await sails.sendNativeQuery(
      `
        SELECT te.card_id AS "cardId",
               ROUND(SUM(EXTRACT(EPOCH FROM (te.ended_at - te.started_at)) / 60))::int AS "totalMinutes",
               MAX(te.started_at) AS "lastEntryAt"
        FROM time_entry te
        INNER JOIN card c ON c.id = te.card_id
        WHERE c.board_id = $1
          AND te.card_id IS NOT NULL
        GROUP BY te.card_id
        HAVING SUM(EXTRACT(EPOCH FROM (te.ended_at - te.started_at))) > 0
      `,
      [board.id],
    );

    return {
      items: result.rows.map((row) => ({
        cardId: `${row.cardId}`,
        totalMinutes: row.totalMinutes,
        // So the board's hours chip can deep-link to the week the time is
        // actually in, rather than to whichever week you happen to be viewing.
        lastEntryAt: row.lastEntryAt,
      })),
    };
  },
};
