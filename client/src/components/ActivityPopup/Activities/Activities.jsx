import React, { useCallback, useEffect, useRef } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { Loader, LoaderSize } from '../../Utils';
import Item from './Item';

import * as gs from '../../../global.module.scss';
import * as s from './Activities.module.scss';

const Activities = React.memo(({ card, items, isFetching, isAllFetched, boardMemberships, onFetch }) => {
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
      <div className={clsx(s.comments, gs.scrollableY)}>
        {items.map((item) => (
          <Item key={item.id} card={card} scope={item.scope} type={item.type} data={item.data} user={item.user} createdAt={item.createdAt} boardMemberships={boardMemberships} />
        ))}
        {isFetching ? <Loader size={LoaderSize.Normal} /> : !isAllFetched && <div ref={visibilityRef} />}
      </div>
    </div>
  );
});

Activities.propTypes = {
  card: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isFetching: PropTypes.bool.isRequired,
  isAllFetched: PropTypes.bool.isRequired,
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onFetch: PropTypes.func.isRequired,
};

Activities.defaultProps = {
  card: undefined,
};

export default Activities;
