const DEFAULT_AUTO_ARCHIVE_DAYS = 30;

// Shared predicate for §5.3 of the board automation spec: a card counts as archived when it
// was explicitly archived, or its list's auto-archive delay has elapsed since completion.
// No background sweep — this is evaluated lazily wherever it's needed (board fetch excludes
// matches, the archive listing includes only matches).
//
// The elapsed-delay half only applies while the card is sitting in a `done`-type list: since
// cards/update.js stopped clearing completedAt on a move, a card pulled back out of Done still
// carries the date it was completed, and auto-archiving it out of an active column because of
// that old date would make it vanish from the board the moment it was reopened.
module.exports = {
  sync: true,

  inputs: {
    card: {
      type: 'ref',
      required: true,
    },
    list: {
      type: 'ref',
    },
  },

  fn(inputs) {
    const { card, list } = inputs;

    if (card.archivedAt) {
      return true;
    }

    // Orphaned by a deleted list: card.list_id has no FK, so lists/delete leaves its cards
    // behind pointing at a list that is gone. They can never render on a board again (there is
    // no column to put them in), so they count as archived — that keeps them visible, and
    // re-homeable, from the Archive instead of silently unreachable.
    if (!list) {
      return true;
    }

    if (list.type !== 'done' || !card.completedAt) {
      return false;
    }

    const days = _.isFinite(list.autoArchiveDays) ? list.autoArchiveDays : DEFAULT_AUTO_ARCHIVE_DAYS;
    const thresholdMs = days * 24 * 60 * 60 * 1000;

    return Date.now() - new Date(card.completedAt).getTime() > thresholdMs;
  },
};
