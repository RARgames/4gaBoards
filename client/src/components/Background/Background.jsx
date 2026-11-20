import React from 'react';
import clsx from 'clsx';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import PropTypes from 'prop-types';

import { BackgroundTypes } from '../../constants/Enums';
import { isSafeUrl } from '../../utils/url';

import * as bs from '../../backgrounds.module.scss';
import * as s from './Background.module.scss';

function Background({ type, name, color, imageUrl, variant }) {
  const safeImageUrl = isSafeUrl(imageUrl) ? imageUrl : '';

  return (
    <div
      className={clsx(s[variant], type === BackgroundTypes.GRADIENT && bs[`background${upperFirst(camelCase(name))}`])}
      style={{
        background: type === BackgroundTypes.IMAGE && safeImageUrl && `url("${safeImageUrl}") center / cover`,
        backgroundColor: type === BackgroundTypes.COLOR ? color : undefined,
      }}
    />
  );
}

Background.propTypes = {
  type: PropTypes.string.isRequired,
  name: PropTypes.string,
  color: PropTypes.string,
  imageUrl: PropTypes.string,
  variant: PropTypes.oneOf(['page', 'thumbnail']),
};

Background.defaultProps = {
  name: undefined,
  color: undefined,
  imageUrl: undefined,
  variant: 'page',
};

export default Background;
