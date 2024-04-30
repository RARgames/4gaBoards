import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { ReactComponent as Add } from '../assets/icons/Add.svg';
import { ReactComponent as ArrowDown } from '../assets/icons/ArrowDown.svg';
import { ReactComponent as Attach } from '../assets/icons/Attach.svg';
import { ReactComponent as BarsStaggered } from '../assets/icons/BarsStaggered.svg';
import { ReactComponent as Bell } from '../assets/icons/Bell.svg';
import { ReactComponent as Check } from '../assets/icons/Check.svg';
import { ReactComponent as Close } from '../assets/icons/Close.svg';
import { ReactComponent as Comment } from '../assets/icons/Comment.svg';
import { ReactComponent as EllipsisVertical } from '../assets/icons/EllipsisVertical.svg';
import { ReactComponent as Eye } from '../assets/icons/Eye.svg';
import { ReactComponent as EyeSlash } from '../assets/icons/EyeSlash.svg';
import { ReactComponent as FillDrip } from '../assets/icons/FillDrip.svg';
import { ReactComponent as Github } from '../assets/icons/Github.svg';
import { ReactComponent as Minus } from '../assets/icons/Minus.svg';
import { ReactComponent as Outline } from '../assets/icons/Outline.svg';
import { ReactComponent as Pause } from '../assets/icons/Pause.svg';
import { ReactComponent as Pencil } from '../assets/icons/Pencil.svg';
import { ReactComponent as Play } from '../assets/icons/Play.svg';
import { ReactComponent as PlusMath } from '../assets/icons/PlusMath.svg';
import { ReactComponent as Settings } from '../assets/icons/Settings.svg';
import { ReactComponent as Trash } from '../assets/icons/Trash.svg';
import { ReactComponent as TriangleDown } from '../assets/icons/TriangleDown.svg';
import { ReactComponent as Users } from '../assets/icons/Users.svg';

import styles from './Icons.module.scss';

const IconType = {
  Add, // TODO rename add to Plus
  ArrowDown,
  Attach,
  BarsStaggered,
  Bell,
  Check,
  Close,
  Comment,
  EllipsisVertical,
  Eye,
  EyeSlash,
  FillDrip,
  Github,
  Minus,
  Outline,
  Pause,
  Pencil,
  Play,
  PlusMath,
  Settings,
  Trash,
  TriangleDown,
  Users,
};

const IconSize = {
  Size8: 'size8',
  Size10: 'size10',
  Size13: 'size13',
  Size14: 'size14',
  Size18: 'size18',
  Size20: 'size20',
};

const Icons = React.memo(({ type, size, className, ...rest }) => {
  const IconComponent = type;
  // eslint-disable-next-line react/jsx-props-no-spreading
  return type ? <IconComponent className={classNames(styles.defaultIcon, styles[size], className)} {...rest} /> : null;

  // TODO change name to Icon
});

Icons.propTypes = {
  type: PropTypes.oneOf(Object.values(IconType)).isRequired,
  size: PropTypes.oneOf(Object.values(IconSize)).isRequired,
  className: PropTypes.string,
};

Icons.defaultProps = {
  className: undefined,
};

export { Icons, IconType, IconSize };
