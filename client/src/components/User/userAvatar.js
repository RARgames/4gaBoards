const COLORS = ['emerald', 'peter-river', 'wisteria', 'carrot', 'alizarin', 'turquoise'];

export const getColor = (name) => {
  let sum = 0;
  for (let i = 0; i < name.length; i += 1) {
    sum += name.charCodeAt(i);
  }

  return COLORS[sum % COLORS.length];
};

export const getInitials = (name) => {
  const words = name.split(/[\s.]+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].slice(0, 1).toUpperCase() + words[0].slice(1, 2);
  }
  const ini = words.map((word) => word[0].toUpperCase()).join('');
  return ini.length > 2 ? ini[0] + ini[ini.length - 1] : ini;
};
