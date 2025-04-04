import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { Icon, IconType, IconSize } from '../../../Utils';

import * as s from './BoolCell.module.scss';

const BoolCell = React.memo(({ value, title, cellClassName, getTitle }) => {
  const [t] = useTranslation();
  return <div className={cellClassName}>{value ? <Icon type={IconType.Check} size={IconSize.Size14} className={s.detailsIcon} title={getTitle ? getTitle(t) : title} /> : null}</div>;
});

BoolCell.propTypes = {
  value: PropTypes.bool.isRequired,
  title: PropTypes.string,
  cellClassName: PropTypes.string,
  getTitle: PropTypes.func,
};

BoolCell.defaultProps = {
  title: '',
  cellClassName: '',
  getTitle: undefined,
};

export default BoolCell;
