import upperFirst from 'lodash/upperFirst';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, Icon, IconType, IconSize } from '../Utils';

import styles from './DueDate.module.scss';

const VARIANTS = {
  CARD: 'card',
  CARDMODAL: 'cardModal',
  TASKS_CARD: 'tasksCard',
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
const DueDate = React.memo(({ value, variant, isDisabled, onClick }) => {
  const [t] = useTranslation();
  const [dueStyle, setDueStyle] = useState('Normal');

  useEffect(() => {
    if (value) {
      setDueStyle(getDueStyle(value));
    }
  }, [value]);

  const contentNode = value && (
    <span className={classNames(styles.wrapper, styles[`wrapper${upperFirst(variant)}`], styles[`due${dueStyle}`])} title={t(`format:date`, { value, postProcess: 'formatDate' })}>
      {variant !== VARIANTS.TASKS_CARD && t(`format:date`, { value, postProcess: 'formatDate' })}
      {variant === VARIANTS.TASKS_CARD && <Icon type={IconType.Calendar} size={IconSize.Size13} className={styles[`due${dueStyle}`]} />}
    </span>
  );

  return onClick ? (
    <Button title={t('common.editDueDate')} onClick={onClick} disabled={isDisabled} className={styles.button}>
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
  onClick: PropTypes.func,
};

DueDate.defaultProps = {
  value: undefined,
  variant: VARIANTS.CARDMODAL,
  isDisabled: false,
  onClick: undefined,
};

export default DueDate;
