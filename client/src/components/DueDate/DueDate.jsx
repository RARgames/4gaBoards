import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import upperFirst from 'lodash/upperFirst';
import PropTypes from 'prop-types';

import { Button } from '../Utils/Button';
import { Icon, IconType, IconSize } from '../Utils/Icon';

import * as s from './DueDate.module.scss';

const VARIANTS = {
  CARD: 'card',
  CARDMODAL: 'cardModal',
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

// TODO remove old onClick and Button variant
const DueDate = React.memo(({ value, variant, isDisabled, titlePrefix, iconSize, isClickable, className, onClick, showUndefined }) => {
  const [t] = useTranslation();
  const [dueStyle, setDueStyle] = useState('Normal');

  useEffect(() => {
    if (value) {
      if (variant === VARIANTS.LIST_VIEW) {
        setDueStyle('ListView');
      } else {
        setDueStyle(getDueStyle(value));
      }
    }
  }, [value, variant]);

  const titlePrefixString = titlePrefix ? `${titlePrefix} ` : '';

  const contentNode = value ? (
    <span
      className={classNames(s.wrapper, s[`wrapper${upperFirst(variant)}`], s[`due${dueStyle}`], (onClick || isClickable) && s.dueDateHoverable, className)}
      title={`${titlePrefixString}${t(variant === VARIANTS.LIST_VIEW ? `format:dateTime` : `format:date`, { value, postProcess: 'formatDate' })}`}
    >
      {variant !== VARIANTS.TASKS_CARD && variant !== VARIANTS.LIST_VIEW && t(`format:date`, { value, postProcess: 'formatDate' })}
      {variant === VARIANTS.LIST_VIEW && t(`format:dateTime`, { value, postProcess: 'formatDate' })}
      {variant === VARIANTS.TASKS_CARD && <Icon type={IconType.Calendar} size={iconSize} className={s[`due${dueStyle}`]} />}
    </span>
  ) : (
    showUndefined && <span className={classNames(s.wrapper, s[`wrapper${upperFirst(variant)}`], s[`due${dueStyle}`], (onClick || isClickable) && s.dueDateHoverable, className)}>-</span>
  );

  return onClick ? (
    <Button title={t('common.editDueDate')} onClick={onClick} disabled={isDisabled} className={s.button}>
      {contentNode}
    </Button>
  ) : (
    contentNode
  );
});

DueDate.propTypes = {
  value: PropTypes.instanceOf(Date),
  variant: PropTypes.oneOf(Object.values(VARIANTS)),
  isDisabled: PropTypes.bool,
  titlePrefix: PropTypes.string,
  iconSize: PropTypes.oneOf(Object.values(IconSize)),
  isClickable: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
  showUndefined: PropTypes.bool,
};

DueDate.defaultProps = {
  value: undefined,
  variant: VARIANTS.CARDMODAL,
  isDisabled: false,
  titlePrefix: undefined,
  iconSize: IconSize.Size13,
  isClickable: false,
  className: undefined,
  onClick: undefined,
  showUndefined: false,
};

export default DueDate;
