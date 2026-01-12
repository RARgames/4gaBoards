import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { ActivityScopes } from '../../constants/Enums';

import * as s from './ActivityLabel.module.scss';

const ActivityLabel = React.memo(({ scope }) => {
  const [t] = useTranslation();

  return scope ? (
    <div className={clsx(s.scope, s[`${scope}Scope`])}>
      <div className={s.scopeText}>{t(`activity.${scope}Short`).toUpperCase()}</div>
    </div>
  ) : null;
});

ActivityLabel.propTypes = {
  scope: PropTypes.oneOf(Object.values(ActivityScopes)),
};

ActivityLabel.defaultProps = {
  scope: undefined,
};

export default ActivityLabel;
