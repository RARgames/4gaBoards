import React, { useCallback } from 'react';
import classNames from 'classnames';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import PropTypes from 'prop-types';

import { Button } from '../Utils';

import * as s from './User.module.scss';

const SIZES = {
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  MASSIVE: 'massive',
  CARD: 'card',
  PROFILE: 'profile',
  CARD_TASKS: 'cardTasks',
};

const COLORS = ['emerald', 'peter-river', 'wisteria', 'carrot', 'alizarin', 'turquoise', 'midnight-blue'];

const getColor = (name) => {
  let sum = 0;
  for (let i = 0; i < name.length; i += 1) {
    sum += name.charCodeAt(i);
  }

  return COLORS[sum % COLORS.length];
};

const getInitials = (name) => {
  const words = name.split(/[\s.]+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].slice(0, 1).toUpperCase() + words[0].slice(1, 2);
  }
  const ini = words.map((word) => word[0].toUpperCase()).join('');
  return ini.length > 2 ? ini[0] + ini[ini.length - 1] : ini;
};

const User = React.memo(({ name, avatarUrl, size, skipTitle, isDisabled, isRemovable, className, onClick }) => {
  const avatarBackground = useCallback(() => {
    if (!avatarUrl) {
      return null;
    }
    if (size === 'profile') {
      const newUrl = avatarUrl.replace('square-100', 'original');
      return { background: `url("${newUrl}") center / cover` };
    }
    return { background: `url("${avatarUrl}") center / contain` };
  }, [avatarUrl, size]);

  const contentNode = (
    <span
      title={skipTitle ? undefined : name}
      className={classNames(
        s.wrapper,
        s[`wrapper${upperFirst(size)}`],
        onClick && s.wrapperHoverable,
        isRemovable && s.wrapperRemovable,
        !avatarUrl && s[`background${upperFirst(camelCase(getColor(name)))}`],
        className,
      )}
      style={avatarBackground(avatarUrl, size)}
    >
      {!avatarUrl && <span className={s.initials}>{getInitials(name)}</span>}
    </span>
  );

  return onClick ? (
    <Button onClick={onClick} disabled={isDisabled} className={s.button}>
      {contentNode}
    </Button>
  ) : (
    contentNode
  );
});

User.propTypes = {
  name: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  size: PropTypes.oneOf(Object.values(SIZES)),
  skipTitle: PropTypes.bool,
  isDisabled: PropTypes.bool,
  isRemovable: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

User.defaultProps = {
  avatarUrl: undefined,
  size: SIZES.MEDIUM,
  skipTitle: false,
  isDisabled: false,
  isRemovable: false,
  className: undefined,
  onClick: undefined,
};

export default User;
