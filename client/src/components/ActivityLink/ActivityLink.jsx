import React from 'react';
import { Link } from 'react-router';
import clsx from 'clsx';
import truncate from 'lodash/truncate';
import PropTypes from 'prop-types';

import { Icon, IconSize } from '../Utils';

import * as s from './ActivityLink.module.scss';

const ActivityLink = React.memo(({ activityTarget, isVisible, to, toAvailable, icon, titleNotAvailable, className, onClose }) => {
  const truncateLength = 30;

  const linkName = truncate(activityTarget?.name, { length: truncateLength });

  const linkNode = toAvailable ? (
    <Link to={to} className={clsx(s.link, className, !activityTarget && s.empty)} title={activityTarget?.name || titleNotAvailable} onClick={onClose}>
      {icon && <Icon type={icon} size={IconSize.Size13} className={s.iconLink} />}
      {linkName}
    </Link>
  ) : (
    <span className={clsx(s.link, s.empty, className)} title={titleNotAvailable}>
      {icon && <Icon type={icon} size={IconSize.Size13} className={s.iconLink} />}
    </span>
  );

  return isVisible ? linkNode : null;
});

ActivityLink.propTypes = {
  activityTarget: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  isVisible: PropTypes.bool.isRequired,
  to: PropTypes.string,
  toAvailable: PropTypes.bool.isRequired,
  icon: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  titleNotAvailable: PropTypes.string,
  className: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

ActivityLink.defaultProps = {
  activityTarget: null,
  to: '',
  icon: null,
  titleNotAvailable: '',
  className: '',
};

export default ActivityLink;
