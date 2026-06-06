import { useEffect, useMemo, useRef } from 'react';

const useUserEmailLookup = (users, search, onUserEmailLookup) => {
  const lastLookupKeyRef = useRef('');
  const normalizedSearch = useMemo(() => search.trim().toLowerCase(), [search]);
  const lookupKey = normalizedSearch;

  useEffect(() => {
    const atIndex = normalizedSearch.indexOf('@');
    if (atIndex === -1) {
      return undefined;
    }

    const domain = normalizedSearch.slice(atIndex + 1);
    if (!domain || !domain.includes('.')) {
      return undefined;
    }

    const domainParts = domain.split('.');
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2) {
      return undefined;
    }

    if (lastLookupKeyRef.current === lookupKey) {
      return undefined;
    }

    lastLookupKeyRef.current = lookupKey;

    onUserEmailLookup(normalizedSearch);
    return undefined;
  }, [lookupKey, normalizedSearch, onUserEmailLookup]);
};

export default useUserEmailLookup;
