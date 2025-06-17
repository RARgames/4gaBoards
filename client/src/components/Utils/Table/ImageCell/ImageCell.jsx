import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import * as s from './ImageCell.module.scss';

const ImageCell = React.memo(({ value, cellClassName }) => {
  return <div className={clsx(s.imageWrapper, cellClassName)}>{value && <img src={value} alt="" className={s.image} />}</div>;
});

ImageCell.propTypes = {
  value: PropTypes.string,
  cellClassName: PropTypes.string,
};

ImageCell.defaultProps = {
  value: undefined,
  cellClassName: '',
};

export default ImageCell;
