import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import * as s from './RoleBadge.module.scss';

const RoleBadge = React.memo(({ role, className }) => {
  const [t] = useTranslation();

  if (!role) {
    return null;
  }

  return <span className={clsx(s.wrapper, s[role], className)}>{t(`common.${role}`, { defaultValue: role })}</span>;
});

RoleBadge.propTypes = {
  role: PropTypes.string,
  className: PropTypes.string,
};

RoleBadge.defaultProps = {
  role: undefined,
  className: undefined,
};

export default RoleBadge;
