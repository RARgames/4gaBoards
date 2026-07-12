const DEFAULT_AUTO_ARCHIVE_DAYS = 30;

// Shared predicate for §5.3 of the board automation spec: a card counts as archived when it
// was explicitly archived, or its list's auto-archive delay has elapsed since completion.
// No background sweep — this is evaluated lazily wherever it's needed (board fetch excludes
// matches, the archive listing includes only matches).
module.exports = {
  sync: true,

  inputs: {
    card: {
      type: 'ref',
      required: true,
    },
    autoArchiveDays: {
      type: 'number',
      allowNull: true,
    },
  },

  fn(inputs) {
    const { card, autoArchiveDays } = inputs;

    if (card.archivedAt) {
      return true;
    }

    if (!card.completedAt) {
      return false;
    }

    const days = _.isFinite(autoArchiveDays) ? autoArchiveDays : DEFAULT_AUTO_ARCHIVE_DAYS;
    const thresholdMs = days * 24 * 60 * 60 * 1000;

    return Date.now() - new Date(card.completedAt).getTime() > thresholdMs;
  },
};
