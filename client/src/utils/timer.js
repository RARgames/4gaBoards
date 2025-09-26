export const getFullSeconds = ({ startedAt, total }) => {
  if (startedAt) {
    return Math.floor((new Date() - startedAt) / 1000) + total;
  }

  return total;
};

export const createTimer = ({ hours, minutes, seconds }) => ({
  startedAt: null,
  total: hours * 60 * 60 + minutes * 60 + seconds,
});

export const updateTimer = ({ startedAt }, parts) => ({
  ...createTimer(parts),
  startedAt: startedAt && new Date(),
});

export const startTimer = (timer) => ({
  startedAt: new Date(),
  total: timer ? timer.total : 0,
});

export const stopTimer = (timer) => ({
  startedAt: null,
  total: getFullSeconds(timer),
});

export const getTimerParts = (timer) => {
  const fullSeconds = getFullSeconds(timer);

  const hours = Math.floor(fullSeconds / 3600);
  const minutes = Math.floor((fullSeconds - hours * 3600) / 60);
  const seconds = fullSeconds - hours * 3600 - minutes * 60;

  return {
    hours,
    minutes,
    seconds,
  };
};

export const formatTimer = (timer) => {
  const { hours, minutes, seconds } = getTimerParts(timer);

  const timeParts = [minutes, seconds].map((part) => (part < 10 ? `0${part}` : part));

  if (hours > 0) {
    timeParts.unshift(hours);
  }

  return timeParts.join(':');
};

export const getTimerState = (prev, next) => {
  const prevRunning = !!prev?.startedAt;
  const nextRunning = !!next?.startedAt;

  if (prev?.total !== next?.total && ((!prevRunning && !nextRunning) || (prevRunning && nextRunning))) {
    return 'edit';
  }

  if (!prev && next) return 'add';
  if (prev && !next) return 'remove';

  if (!prevRunning && nextRunning) return 'start';
  if (prevRunning && !nextRunning) return 'stop';

  return 'none';
};

export const formatTimerActivities = (timer) => {
  let { hours, minutes, seconds } = getTimerParts(timer);
  if ([hours, minutes, seconds].every(Number.isNaN)) {
    ({ hours, minutes, seconds } = getTimerParts({ ...timer, startedAt: null }));
  }

  const formatPart = (part) => {
    if (Number.isNaN(part)) {
      return '00';
    }
    if (part < 10) {
      return `0${part}`;
    }
    return part;
  };

  const timeParts = [formatPart(minutes), formatPart(seconds)];

  if (hours > 0) {
    timeParts.unshift(formatPart(hours));
    return `${timeParts.join(':')}`;
  }

  return timeParts.join(':');
};
