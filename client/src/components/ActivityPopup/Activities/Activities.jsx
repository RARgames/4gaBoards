import React, { useCallback, useEffect, useRef } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { Loader, LoaderSize } from '../../Utils';
import Activity from './Activity';

import * as gs from '../../../global.module.scss';
import * as s from './Activities.module.scss';

const Activities = React.memo(({ items, isFetching, isAllFetched, memberships, showCardDetails, onFetch }) => {
  const visibilityRef = useRef(null);

  const handleVisibilityChange = useCallback(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          onFetch();
        }
      });
    },
    [onFetch],
  );

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(handleVisibilityChange, options);
    if (visibilityRef.current) {
      observer.observe(visibilityRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [handleVisibilityChange, onFetch, items]);

  return (
    <div>
      <div className={clsx(s.wrapper, gs.scrollableY)}>
        {items.map((item) => (
          <Activity key={item.id} activity={item} createdAt={item.createdAt} memberships={memberships} showCardDetails={showCardDetails} />
        ))}
        {isFetching ? <Loader size={LoaderSize.Normal} /> : !isAllFetched && <div ref={visibilityRef} />}
      </div>
    </div>
  );
});

Activities.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isFetching: PropTypes.bool.isRequired,
  isAllFetched: PropTypes.bool.isRequired,
  memberships: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  showCardDetails: PropTypes.bool.isRequired,
  onFetch: PropTypes.func.isRequired,
};

Activities.defaultProps = {
  memberships: undefined,
};

export default Activities;
