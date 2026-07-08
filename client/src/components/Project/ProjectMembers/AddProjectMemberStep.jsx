import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import User from '../../User';
import { Button, ButtonStyle, Input, InputStyle, Popup, withPopup } from '../../Utils';

import * as gs from '../../../global.module.scss';
import * as s from './AddProjectMemberStep.module.scss';

const AddProjectMemberStep = React.memo(({ users, onSelect, onClose }) => {
  const [t] = useTranslation();
  const [search, setSearch] = useState('');
  const searchField = useRef(null);

  const cleanSearch = search.trim().toLowerCase();
  const filteredUsers = useMemo(() => users.filter((user) => !cleanSearch || user.name.toLowerCase().includes(cleanSearch) || user.email.toLowerCase().includes(cleanSearch)), [users, cleanSearch]);

  const handleSelect = (userId) => {
    onSelect(userId);
    onClose();
  };

  return (
    <>
      <Popup.Header>{t('common.addProjectMember', { context: 'title' })}</Popup.Header>
      <Popup.Content>
        <Input ref={searchField} style={InputStyle.Default} value={search} placeholder={t('common.searchUsers')} onChange={(e) => setSearch(e.target.value)} />
        <div className={clsx(s.users, gs.scrollableY)}>
          {filteredUsers.map((user) => (
            <Button key={user.id} style={ButtonStyle.Popup} onClick={() => handleSelect(user.id)} className={s.userButton}>
              <User name={user.name} avatarUrl={user.avatarUrl} size="large" />
              <span className={s.userName}>{user.name}</span>
            </Button>
          ))}
        </div>
      </Popup.Content>
    </>
  );
});

AddProjectMemberStep.propTypes = {
  users: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(AddProjectMemberStep);
