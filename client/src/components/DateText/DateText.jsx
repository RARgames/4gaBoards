import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { formatDistanceToNowStrict } from 'date-fns';
import PropTypes from 'prop-types';

import * as s from './DateText.module.scss';

const DateText = React.memo(({ value, title, titlePrefix, isClickable, showTime, showUndefined, showRelative, className }) => {
  const [t] = useTranslation();
  const { i18n } = useTranslation();

  const titlePrefixString = titlePrefix ? `${titlePrefix} ` : '';
  const locale = i18n.dateFns.getLocale(i18n.resolvedLanguage) || i18n.dateFns.getLocale(i18n.language) || i18n.dateFns.getLocale('en');

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
