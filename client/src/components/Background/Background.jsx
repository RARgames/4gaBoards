import React from 'react';
import classNames from 'classnames';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import PropTypes from 'prop-types';

import { ProjectBackgroundTypes } from '../../constants/Enums';

import * as globalStyles from '../../styles.module.scss';
import * as s from './Background.module.scss';

function Background({ type, name, imageUrl }) {
  return (
    <div
      className={classNames(s.wrapper, type === ProjectBackgroundTypes.GRADIENT && globalStyles[`background${upperFirst(camelCase(name))}`])}
      style={{
        background: type === 'image' && `url("${imageUrl}") center / cover`,
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
