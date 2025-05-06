import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import User from '../../../User';

const UserAvatarCell = React.memo(({ avatarUrl, name, title, cellClassName }) => {
  const [t] = useTranslation();

  return (
    <div className={cellClassName} title={title}>
      <User avatarUrl={avatarUrl} name={name} aria-label={t('common.userAvatar')} />
    </div>
  );
});

UserAvatarCell.propTypes = {
  avatarUrl: PropTypes.string,
  name: PropTypes.string.isRequired,
  title: PropTypes.string,
  cellClassName: PropTypes.string,
};

UserAvatarCell.defaultProps = {
  avatarUrl: '',
  title: '',
  cellClassName: '',
};

export default UserAvatarCell;
