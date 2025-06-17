import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { useField } from '../../hooks';
import { Popup, Input, InputStyle } from '../Utils';
import Item from './Item';

import * as gs from '../../global.module.scss';
import * as s from './MembershipsStep.module.scss';

const MembershipsStep = React.memo(({ items, currentUserIds, title, memberships, onUserSelect, onUserDeselect, onBack }) => {
  const [t] = useTranslation();
  const [search, handleSearchChange] = useField('');
  const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);
  const [sortedItems, setSortedItems] = useState([]);

  const sortItems = useCallback(() => {
    setSortedItems(
      [...items].sort((a, b) => {
        const aIsActive = currentUserIds.includes(a.user.id);
        const bIsActive = currentUserIds.includes(b.user.id);
        return bIsActive - aIsActive;
      }),
    );
  }, [items, currentUserIds]);

  useEffect(() => {
    sortItems();
  }, [sortItems]);

  const filteredItems = useMemo(() => {
    return sortedItems.filter(({ user }) => user.email.includes(cleanSearch) || user.name.toLowerCase().includes(cleanSearch) || (user.username && user.username.includes(cleanSearch)));
  }, [sortedItems, cleanSearch]);

  const searchField = useRef(null);

  const handleUserSelect = useCallback(
    (id) => {
      onUserSelect(id);
    },
    [onUserSelect],
  );

  const handleUserDeselect = useCallback(
    (id) => {
      onUserDeselect(id);
    },
    [onUserDeselect],
  );

  useEffect(() => {
    searchField.current?.focus({ preventScroll: true });
  }, []);

  return (
    <>
      <Popup.Header onBack={onBack}>{t(title, { context: 'title' })}</Popup.Header>
      <Popup.Content>
        <Input ref={searchField} style={InputStyle.Default} value={search} placeholder={t('common.searchMembers')} onChange={handleSearchChange} />
        {filteredItems.length > 0 && (
          <div className={classNames(s.menu, gs.scrollableY)}>
            {filteredItems.map((item) => (
              <Item
                key={item.user.id}
                isPersisted={item.isPersisted}
                isActive={currentUserIds.includes(item.user.id)}
                user={item.user}
                memberships={memberships}
                onUserSelect={() => handleUserSelect(item.user.id)}
                onUserDeselect={() => handleUserDeselect(item.user.id)}
              />
            ))}
          </div>
        )}
      </Popup.Content>
    </>
  );
});

MembershipsStep.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  items: PropTypes.array.isRequired,
  currentUserIds: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  title: PropTypes.string,
  memberships: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  onUserSelect: PropTypes.func.isRequired,
  onUserDeselect: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

MembershipsStep.defaultProps = {
  title: 'common.members',
  memberships: undefined,
  onBack: undefined,
};

export default MembershipsStep;
