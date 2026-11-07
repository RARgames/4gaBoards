import React, { useCallback } from 'react';
import clsx from 'clsx';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import PropTypes from 'prop-types';

import { Button } from '../Utils/Button';
import { getColor, getInitials } from './userAvatar';

import * as s from './User.module.scss';

const SIZES = {
  MICRO: 'micro',
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  MASSIVE: 'massive',
  CARD: 'card',
  PROFILE: 'profile',
  CARD_TASKS: 'cardTasks',
};

const User = React.memo(({ name, avatarUrl, size, skipTitle, isDisabled, isRemovable, isMember, isNotMemberTitle, className, onClick }) => {
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

  const fullTitle = !isMember && isNotMemberTitle ? `${name}\n${isNotMemberTitle}` : name;

  const contentNode = (
    <span
      title={skipTitle ? undefined : fullTitle}
      className={clsx(
        s.wrapper,
        s[`wrapper${upperFirst(size)}`],
        onClick && s.wrapperHoverable,
        isRemovable && s.wrapperRemovable,
        !avatarUrl && s[`background${upperFirst(camelCase(getColor(name)))}`],
        className,
      )}
      style={avatarBackground(avatarUrl, size)}
    >
      {!isMember && <span className={s.grayOverlay} />}
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
  isMember: PropTypes.bool,
  isNotMemberTitle: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

User.defaultProps = {
  avatarUrl: undefined,
  size: SIZES.MEDIUM,
  skipTitle: false,
  isDisabled: false,
  isRemovable: false,
  isMember: true,
  isNotMemberTitle: undefined,
  className: undefined,
  onClick: undefined,
};

export default User;
