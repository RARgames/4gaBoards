import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import * as s from './NameCell.module.scss';

const NameCell = React.memo(({ name, isCurrentUser, title, cellClassName }) => {
  const [t] = useTranslation();

  return (
    <div className={clsx(cellClassName, s.cell)} title={title}>
      {name} {isCurrentUser && <span className={s.currentUser}>{t('common.you')}</span>}
    </div>
  );
});

NameCell.propTypes = {
  name: PropTypes.string.isRequired,
  isCurrentUser: PropTypes.bool,
  title: PropTypes.string,
  cellClassName: PropTypes.string,
};

NameCell.defaultProps = {
  isCurrentUser: false,
  title: '',
  cellClassName: '',
};

export default NameCell;
