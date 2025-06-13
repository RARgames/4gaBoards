const sortByCurrentUserAndName = (memberships) =>
  memberships.sort((a, b) => {
    if (a.user.isCurrent) return -1;
    if (b.user.isCurrent) return 1;
    return a.user.name.localeCompare(b.user.name);
  });

export default sortByCurrentUserAndName;
