export const parseRateToCents = (raw) => {
  const cleaned = String(raw).trim().replace(/^\$/, '');
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(cleaned)) {
    return null;
  }
  const cents = Math.round(parseFloat(cleaned) * 100);
  return cents > 0 ? cents : null;
};

export const parseGstToBasisPoints = (raw) => {
  const cleaned = String(raw).trim();
  if (cleaned === '') {
    return 0;
  }
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(cleaned)) {
    return null;
  }
  const basisPoints = Math.round(parseFloat(cleaned) * 100);
  return basisPoints <= 10000 ? basisPoints : null;
};

export const formatCents = (cents) => (cents / 100).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
