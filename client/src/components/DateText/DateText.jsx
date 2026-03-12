import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { formatDistanceToNowStrict } from 'date-fns';
import { enUS, cs, da, de, es, fr, it, ja, ko, pl, ptBR, ru, sk, sv, uz, zhCN } from 'date-fns/locale'; // TODO should be moved to locales - cannot get it to working with embeddedLocales
import PropTypes from 'prop-types';

import * as s from './DateText.module.scss';

const DateText = React.memo(({ value, title, titlePrefix, isClickable, showTime, showUndefined, showRelative, className }) => {
  const [t] = useTranslation();
  const { i18n } = useTranslation();

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

  if (value) {
    const preFormattedValue = t(showTime ? `format:dateTime` : `format:date`, { value, postProcess: 'formatDate' });
    const formattedValue = showRelative ? formatDistanceToNowStrict(new Date(value), { locale, addSuffix: true }) : preFormattedValue;
    return (
      <span className={clsx(s.wrapper, isClickable && s.dateHoverable, className)} title={title || `${titlePrefixString}${preFormattedValue}`}>
        <span>{formattedValue}</span>
      </span>
    );
  }

  return showUndefined ? <span className={clsx(s.wrapper, isClickable && s.dateHoverable, className)}>-</span> : null;
});

DateText.propTypes = {
  value: PropTypes.instanceOf(Date),
  title: PropTypes.string,
  titlePrefix: PropTypes.string,
  isClickable: PropTypes.bool,
  showTime: PropTypes.bool,
  showUndefined: PropTypes.bool,
  showRelative: PropTypes.bool,
  className: PropTypes.string,
};

DateText.defaultProps = {
  value: undefined,
  title: undefined,
  titlePrefix: undefined,
  isClickable: false,
  showTime: false,
  showUndefined: false,
  showRelative: false,
  className: undefined,
};

export default DateText;
