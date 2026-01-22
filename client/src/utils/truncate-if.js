import truncate from 'lodash/truncate';

function truncateIf(value, condition, length) {
  return condition ? truncate(value, { length }) : value;
}

export default truncateIf;
