const DEFAULT_AUTO_ARCHIVE_DAYS = 30;

// Client-side mirror of server/api/helpers/cards/is-archived.js. The board fetch already
// excludes archived cards, so this only matters for cards that become archived while the board
// is open — one archived from this session or another client, or one moved into a `done` column
// with a completion date that is already past that column's auto-archive window.
//
// The server's "orphaned by a deleted list" case has no equivalent here: the client only ever
// reaches a card through the list that holds it.
export const isCardArchived = (card, list) => {
  if (card.archivedAt) {
    return true;
  }

  if (!list || list.type !== 'done' || !card.completedAt) {
    return false;
  }

  const days = Number.isFinite(list.autoArchiveDays) ? list.autoArchiveDays : DEFAULT_AUTO_ARCHIVE_DAYS;

  return Date.now() - new Date(card.completedAt).getTime() > days * 24 * 60 * 60 * 1000;
};

export default isCardArchived;
