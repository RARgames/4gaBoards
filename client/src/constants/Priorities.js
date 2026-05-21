const PriorityLevels = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

// Lower `position` = higher priority (used for ListView sort: ascending = strongest first).
const Priorities = [
  { id: PriorityLevels.LOW, name: 'Low', color: 'bright-moss', position: 3 },
  { id: PriorityLevels.MEDIUM, name: 'Medium', color: 'egg-yellow', position: 2 },
  { id: PriorityLevels.HIGH, name: 'High', color: 'berry-red', position: 1 },
];

const PrioritiesById = Priorities.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

const getPriority = (id) => (id ? PrioritiesById[id] : undefined);

export { PriorityLevels, Priorities, PrioritiesById, getPriority };
export default Priorities;
