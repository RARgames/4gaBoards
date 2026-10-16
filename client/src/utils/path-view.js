const SEGMENTS = {
  board: 'board-view',
  list: 'list-view',
};

const REGEXP = /^(.*\/(?:boards|cards)\/[^/]+)\/([^/]+)\/?$/;

export const getPathView = (pathname) => {
  const match = REGEXP.exec(pathname);

  if (!match) {
    return null;
  }

  if (match[2] === SEGMENTS.list) return 'list';
  if (match[2] === SEGMENTS.board) return 'board';

  return null;
};

export const stripPathView = (pathname) => pathname.replace(REGEXP, '$1');

export const withPathView = (path, view) => {
  const cleanPath = stripPathView(path);

  return view && SEGMENTS[view] ? `${cleanPath}/${SEGMENTS[view]}` : cleanPath;
};
