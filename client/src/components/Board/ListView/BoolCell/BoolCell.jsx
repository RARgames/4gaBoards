import React from 'react';
import PropTypes from 'prop-types';

import { Icon, IconType, IconSize } from '../../../Utils';

import * as s from './BoolCell.module.scss';

const BoolCell = React.memo(({ value, title, cellClassName }) => {
  return <div className={cellClassName}>{value ? <Icon type={IconType.Check} size={IconSize.Size14} className={s.detailsIcon} title={title} /> : null}</div>;
});

BoolCell.propTypes = {
  value: PropTypes.bool.isRequired,
  title: PropTypes.string,
  cellClassName: PropTypes.string,
};

BoolCell.defaultProps = {
  title: '',
  cellClassName: '',
};

export default BoolCell;
