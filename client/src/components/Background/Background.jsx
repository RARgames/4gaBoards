import React from 'react';
import clsx from 'clsx';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import PropTypes from 'prop-types';

import { ProjectBackgroundTypes } from '../../constants/Enums';

import * as bs from '../../backgrounds.module.scss';
import * as s from './Background.module.scss';

function Background({ type, name, imageUrl }) {
  const isSafeUrl = (url) => {
    if (!url) return false;
    try {
      const parsed = new URL(url, window.location.origin);
      return ['http:', 'https:', 'data:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const safeImageUrl = isSafeUrl(imageUrl) ? imageUrl : '';

  return (
    <div
      className={clsx(s.wrapper, type === ProjectBackgroundTypes.GRADIENT && bs[`background${upperFirst(camelCase(name))}`])}
      style={{
        background: type === 'image' && safeImageUrl && `url("${safeImageUrl}") center / cover`,
      }}
    />
  );
}

Background.propTypes = {
  type: PropTypes.string.isRequired,
  name: PropTypes.string,
  imageUrl: PropTypes.string,
};

Background.defaultProps = {
  name: undefined,
  imageUrl: undefined,
};

export default Background;
