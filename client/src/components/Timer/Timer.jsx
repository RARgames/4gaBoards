import upperFirst from 'lodash/upperFirst';
import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Icon } from 'semantic-ui-react';
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useForceUpdate, usePrevious } from '../../lib/hooks';

import { formatTimer } from '../../utils/timer';

import styles from './Timer.module.scss';

const VARIANTS = {
  CARD: 'card',
  CARDMODAL: 'cardModal',
};

const Timer = React.memo(({ as, startedAt, total, variant, isDisabled, onClick }) => {
  const prevStartedAt = usePrevious(startedAt);
  const forceUpdate = useForceUpdate();

  const interval = useRef(null);

  const start = useCallback(() => {
    interval.current = setInterval(() => {
      forceUpdate();
    }, 1000);
  }, [forceUpdate]);

  const stop = useCallback(() => {
    clearInterval(interval.current);
  }, []);

  useEffect(() => {
    if (prevStartedAt) {
      if (!startedAt) {
        stop();
      }
    } else if (startedAt) {
      start();
    }
  }, [startedAt, prevStartedAt, start, stop]);

  useEffect(
    () => () => {
      stop();
    },
    [stop],
  );

  const contentNode = (
    <span className={classNames(styles.wrapper, styles[`wrapper${upperFirst(variant)}`], startedAt && styles.wrapperActive, onClick && styles.wrapperHoverable)}>
      <FontAwesomeIcon icon={startedAt ? faPause : faPlay} className={styles.timerIcon} />
      {formatTimer({ startedAt, total })}
    </span>
  );

  const ElementType = as;

  return onClick ? (
    <ElementType type="button" disabled={isDisabled} className={styles.button} onClick={onClick}>
      {contentNode}
    </ElementType>
  ) : (
    contentNode
  );
});

Timer.propTypes = {
  as: PropTypes.elementType,
  startedAt: PropTypes.instanceOf(Date),
  total: PropTypes.number.isRequired,
  variant: PropTypes.oneOf(Object.values(VARIANTS)),
  isDisabled: PropTypes.bool,
  onClick: PropTypes.func,
};

Timer.defaultProps = {
  as: 'button',
  startedAt: undefined,
  variant: VARIANTS.CARDMODAL,
  isDisabled: false,
  onClick: undefined,
};

export default Timer;
