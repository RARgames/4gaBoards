export const isUrl = (string) => {
  try {
    const url = new URL(string);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

export const normalizeToUrl = (string) => {
  try {
    return new URL(string);
  } catch {
    try {
      return new URL(`https://${string}`);
    } catch {
      return null;
    }
  }
};

export const extractFirstLikelyUrl = (string) => {
  const match = string.match(/\b[^\s.]+\.[^\s.,]+\b/);
  return match ? normalizeToUrl(match[0]) : null;
};

export const isLikelyUrl = (string) => {
  const url = extractFirstLikelyUrl(string);
  return !!url;
};
