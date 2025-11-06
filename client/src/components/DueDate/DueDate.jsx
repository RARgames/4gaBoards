import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { formatDistanceToNowStrict } from 'date-fns';
import { enUS, cs, da, de, es, fr, it, ja, ko, pl, ptBR, ru, sk, sv, uz, zhCN } from 'date-fns/locale'; // TODO should be moved to locales - cannot get it to working with embeddedLocales
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

const getDueStyle = (value) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  const currDate = new Date();
  const utc1 = Date.UTC(value.getFullYear(), value.getMonth(), value.getDate());
  const utc2 = Date.UTC(currDate.getFullYear(), currDate.getMonth(), currDate.getDate());
  const diff = (utc2 - utc1) / msPerDay;

  if (diff >= -14 && diff <= 0) {
    return 'Close';
  }
  if (diff > 0) {
    return 'Over';
  }
  return 'Normal';
};

const DueDate = React.memo(({ value, variant, titlePrefix, iconSize, isClickable, className, showUndefined, showRelative }) => {
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
        setDueStyle(getDueStyle(value));
      }
    }
  }, [value, variant]);

  const titlePrefixString = titlePrefix ? `${titlePrefix} ` : '';
  // TODO localeMap is temp solution - move to locales
  const localeMap = {
    en: enUS,
    cs,
    da,
    de,
    es,
    fr,
    it,
    ja,
    ko,
    pl,
    'pt-BR': ptBR,
    ru,
    sk,
    sv,
    uz,
    zh: zhCN,
  };
  const locale = localeMap[i18n.resolvedLanguage] || enUS;

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
  variant: VARIANTS.CARDMODAL,
  titlePrefix: undefined,
  iconSize: IconSize.Size13,
  isClickable: false,
  className: undefined,
  showUndefined: false,
  showRelative: false,
};

export default DueDate;
