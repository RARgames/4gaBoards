export const isColor = (v) => v.startsWith('#') || v.startsWith('rgb');

export const readCSSVars = (el) => {
  const styles = getComputedStyle(el);
  const vars = {};

  for (let i = 0; i < styles.length; i++) {
    const name = styles[i];
    if (name.startsWith('--')) {
      const value = styles.getPropertyValue(name).trim();
      if (isColor(value)) {
        vars[name] = value;
      }
    }
  }

  const sortedVars = Object.fromEntries(Object.entries(vars).sort(([a], [b]) => a.localeCompare(b)));

  return sortedVars;
};

export const normalizeHexColor = (value) => {
  if (!value) {
    return null;
  }

  let normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (!normalized.startsWith('#')) {
    normalized = `#${normalized}`;
  }

  if (/^#[0-9a-fA-F]{3}$/.test(normalized)) {
    normalized = `#${normalized
      .slice(1)
      .split('')
      .map((char) => `${char}${char}`)
      .join('')}`;
  }

  if (/^#[0-9a-fA-F]{4}$/.test(normalized)) {
    normalized = `#${normalized
      .slice(1)
      .split('')
      .map((char) => `${char}${char}`)
      .join('')}`;
  }

  if (!/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(normalized)) {
    return null;
  }

  return normalized.toLowerCase();
};
