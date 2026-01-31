export const isColor = (v) => v.startsWith('#') || v.startsWith('rgb') || v.startsWith('hsl');

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
