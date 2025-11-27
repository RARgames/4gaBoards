import { isURL, isIP } from 'validator';

export const isLink = (string) => {
  return isURL(string) || isIP(String(string), 4);
};

export const normalizeLink = (string) => {
  const tryNormalize = (value) => {
    try {
      return new URL(value);
    } catch {
      return null;
    }
  };
  return tryNormalize(string) || tryNormalize(`https://${string}`);
};

export const beautifyLink = (string) => {
  return string.replace(/^https?:\/\//i, '').replace(/\/$/, '');
};
