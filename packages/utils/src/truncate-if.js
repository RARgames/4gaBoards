function truncateIf(value, condition, length) {
  if (!condition || typeof value !== 'string') return value;
  if (value.length <= length) return value;

  return `${value.slice(0, length).trimEnd()}...`;
}

export default truncateIf;
