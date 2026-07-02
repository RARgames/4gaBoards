import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { formatDistanceToNowStrict } from 'date-fns';
import upperFirst from 'lodash/upperFirst';
import PropTypes from 'prop-types';

import { Icon, IconType, IconSize } from '../Utils/Icon';

import * as s from './DueDate.module.scss';

const VARIANTS = {
  CARD: 'card',
  CARDMODAL: 'cardModal',
  CARDMODAL_ACTIVITY: 'cardModalActivity',
  TASKS_CARD: 'tasksCard',
  LIST_VIEW: 'listView',
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const getDueStyle = (value, completedAt) => {
  const reference = completedAt || new Date();
  const diff = (reference.getTime() - value.getTime()) / MS_PER_DAY;

  if (diff > 0) {
    return 'Over';
  }
  if (diff >= -14) {
    return 'Close';
  }
  return 'Normal';
};

const DueDate = React.memo(({ value, completedAt, variant, titlePrefix, iconSize, isClickable, className, showUndefined, showRelative }) => {
  const [t] = useTranslation();
  const { i18n } = useTranslation();
  const [dueStyle, setDueStyle] = useState('Normal');
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (value) {
      if (variant === VARIANTS.LIST_VIEW) {
        setDueStyle('ListView');
      } else if (variant === VARIANTS.CARDMODAL_ACTIVITY) {
        setDueStyle('CardModalActivity');
      } else {
        setDueStyle(getDueStyle(value, completedAt));
      }
    }
  }, [value, completedAt, variant]);

  const titlePrefixString = titlePrefix ? `${titlePrefix} ` : '';
  const locale = i18n.dateFns.getLocale(i18n.resolvedLanguage) || i18n.dateFns.getLocale(i18n.language) || i18n.dateFns.getLocale('en');

  useEffect(() => {
    if (!value || completedAt) {
      return undefined;
    }
    if (variant === VARIANTS.LIST_VIEW || variant === VARIANTS.CARDMODAL_ACTIVITY) {
      return undefined;
    }

    const closeBoundaryTime = value.getTime() - 14 * MS_PER_DAY;
    const overBoundaryTime = value.getTime();

    // setTimeout delays are clamped to a 32-bit signed int (~25 days) internally, anything longer overflows and fires immediately. Cap to prevent it and reschedule on wake.
    const MAX_TIMEOUT_DELAY = 20 * MS_PER_DAY;
    let timeoutId;

    const scheduleNextBoundary = () => {
      const now = Date.now();

      let nextBoundaryTime;
      if (now < closeBoundaryTime) {
        nextBoundaryTime = closeBoundaryTime;
      } else if (now < overBoundaryTime) {
        nextBoundaryTime = overBoundaryTime;
      } else {
        return;
      }

      const remaining = nextBoundaryTime - now;
      const delay = remaining > MAX_TIMEOUT_DELAY ? MAX_TIMEOUT_DELAY : Math.max(remaining, 0) + 50;

      timeoutId = setTimeout(() => {
        if (Date.now() >= nextBoundaryTime) {
          setDueStyle(getDueStyle(value, completedAt));
        }
        scheduleNextBoundary();
      }, delay);
    };

    scheduleNextBoundary();

    return () => clearTimeout(timeoutId);
  }, [value, completedAt, variant]);

  useEffect(() => {
    if (!showRelative || !value) return;

    let intervalId;
    let timeout;

    const updateInterval = () => {
      const diffInSeconds = Math.abs((value.getTime() - new Date().getTime()) / 1000);
      if (diffInSeconds <= 60) {
        return 1000;
      }
      if (diffInSeconds <= 3600) {
        return 60000;
      }
      return 300000;
    };

    const setupInterval = () => {
      const interval = updateInterval();
      intervalId = setInterval(() => {
        forceUpdate((x) => x + 1);
      }, interval);

      timeout = setTimeout(
        () => {
          clearInterval(intervalId);
          setupInterval();
        },
        Math.max(interval, 60000),
      );
    };

    setupInterval();

    // eslint-disable-next-line consistent-return
    return () => {
      clearInterval(intervalId);
      clearTimeout(timeout);
    };
  }, [showRelative, value]);

  if (value) {
    const preFormattedValue = t(variant === VARIANTS.LIST_VIEW || variant === VARIANTS.CARDMODAL_ACTIVITY ? `format:dateTime` : `format:date`, { value, postProcess: 'formatDate' });
    const formattedValue = showRelative ? formatDistanceToNowStrict(new Date(value), { locale, addSuffix: true }) : preFormattedValue;
    return (
      <div className={clsx(s.wrapper, s[`wrapper${upperFirst(variant)}`], s[`due${dueStyle}`], isClickable && s.dueDateHoverable, className)} title={`${titlePrefixString}${preFormattedValue}`}>
        {variant === VARIANTS.TASKS_CARD ? <Icon type={IconType.Calendar} size={iconSize} className={s[`due${dueStyle}`]} /> : formattedValue}
      </div>
    );
  }

  return showUndefined ? <div className={clsx(s.wrapper, s[`wrapper${upperFirst(variant)}`], s[`due${dueStyle}`], isClickable && s.dueDateHoverable, className)}>-</div> : null;
});

DueDate.propTypes = {
  value: PropTypes.instanceOf(Date),
  completedAt: PropTypes.instanceOf(Date),
  variant: PropTypes.oneOf(Object.values(VARIANTS)),
  titlePrefix: PropTypes.string,
  iconSize: PropTypes.oneOf(Object.values(IconSize)),
  isClickable: PropTypes.bool,
  className: PropTypes.string,
  showUndefined: PropTypes.bool,
  showRelative: PropTypes.bool,
};

DueDate.defaultProps = {
  value: undefined,
  completedAt: undefined,
  variant: VARIANTS.CARDMODAL,
  titlePrefix: undefined,
  iconSize: IconSize.Size13,
  isClickable: false,
  className: undefined,
  showUndefined: false,
  showRelative: false,
};

export default DueDate;
