// Deterministic hues spread around the color wheel so boards get visually distinct colors
// without needing a stored color field. Yellow/near-yellow hues are omitted since they read
// poorly with the white text used on timeline bars.
const BOARD_HUES = [210, 150, 340, 265, 20, 190, 95, 315, 250, 5, 170, 285];

const LIGHTNESS_MIN = 32;
const LIGHTNESS_MAX = 50;
const SATURATION = 55;

const hashString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 2147483647;
  }
  return Math.abs(hash);
};

export const getBoardHue = (boardId) => BOARD_HUES[hashString(String(boardId)) % BOARD_HUES.length];

// A per-card tone within its board's hue family, so cards from the same board read as
// related while still being distinguishable from one another.
export const getCardColor = (boardId, cardId) => {
  const hue = getBoardHue(boardId);
  const span = LIGHTNESS_MAX - LIGHTNESS_MIN;
  const lightness = LIGHTNESS_MIN + (hashString(String(cardId)) % (span + 1));

  return `hsl(${hue}, ${SATURATION}%, ${lightness}%)`;
};

// The board's own hue at a fixed tone, for chrome that represents the board itself
// (group headers, accent bars) rather than an individual card.
export const getBoardAccentColor = (boardId) => `hsl(${getBoardHue(boardId)}, ${SATURATION}%, ${LIGHTNESS_MIN}%)`;

export default { getBoardHue, getCardColor, getBoardAccentColor };
