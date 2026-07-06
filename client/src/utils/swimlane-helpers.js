export const UNASSIGNED_LANE_ID = 'unassigned';

// Stable, viewer-independent "primary assignee" used to place a card in exactly one swimlane.
// The most recently assigned member wins, so dropping a card into a user's lane keeps it there
// even when the card has other members. Ties (same-second timestamps) and cards without
// membership rows fall back to name order, which is stable across viewers.
// (selectUsersByCardId floats the current user first, which would make placement depend on who is looking.)
export const getPrimaryUserId = (cardModel) => {
  const users = cardModel.users.toRefArray();
  if (users.length === 0) {
    return UNASSIGNED_LANE_ID;
  }

  const userIds = new Set(users.map((user) => user.id));
  const memberships = cardModel.memberships.toRefArray().filter((membership) => membership.createdAt && userIds.has(membership.userId));

  if (memberships.length > 0) {
    return memberships.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt) || (a.userId < b.userId ? -1 : 1))[0].userId;
  }

  return [...users].sort((a, b) => a.name.localeCompare(b.name) || (a.id < b.id ? -1 : 1))[0].id;
};
