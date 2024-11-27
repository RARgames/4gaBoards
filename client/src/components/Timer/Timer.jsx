import upperFirst from 'lodash/upperFirst';
import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { useForceUpdate, usePrevious } from '../../lib/hooks';
import { Icon, IconType, IconSize } from '../Utils';

import { formatTimer } from '../../utils/timer';

import * as s from './Timer.module.scss';

const VARIANTS = {
  CARD: 'card',
  CARDMODAL: 'cardModal',
};

const Timer = React.memo(({ as, startedAt, total, variant, isDisabled, onClick }) => {
  const [t] = useTranslation();
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
    <span className={classNames(s.wrapper, s[`wrapper${upperFirst(variant)}`], startedAt && s.wrapperActive, onClick && s.wrapperHoverable)}>
      <Icon type={startedAt ? IconType.Pause : IconType.Play} size={IconSize.Size8} className={s.timerIcon} />
      {formatTimer({ startedAt, total })}
    </span>
  );

  const ElementType = as;

  return onClick ? (
    <ElementType type="button" disabled={isDisabled} className={s.button} onClick={onClick} title={startedAt ? t('common.stopTimer') : t('common.startTimer')}>
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
