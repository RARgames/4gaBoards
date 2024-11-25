import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Popup, Input, InputStyle } from '../Utils';

import { useField } from '../../hooks';
import Item from './Item';

import * as styles from './MembershipsStep.module.scss';
import * as gStyles from '../../globalStyles.module.scss';

const MembershipsStep = React.memo(({ items, currentUserIds, title, onUserSelect, onUserDeselect, onBack }) => {
  const [t] = useTranslation();
  const [search, handleSearchChange] = useField('');
  const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);

  const filteredItems = useMemo(
    () => items.filter(({ user }) => user.email.includes(cleanSearch) || user.name.toLowerCase().includes(cleanSearch) || (user.username && user.username.includes(cleanSearch))),
    [items, cleanSearch],
  );

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
    searchField.current.focus({
      preventScroll: true,
    });
  }, []);

  return (
    <>
      <Popup.Header onBack={onBack}>{t(title, { context: 'title' })}</Popup.Header>
      <Popup.Content>
        <Input ref={searchField} style={InputStyle.Default} value={search} placeholder={t('common.searchMembers')} onChange={handleSearchChange} />
        {filteredItems.length > 0 && (
          <div className={classNames(styles.menu, gStyles.scrollableY)}>
            {filteredItems.map((item) => (
              <Item
                key={item.id}
                isPersisted={item.isPersisted}
                isActive={currentUserIds.includes(item.user.id)}
                user={item.user}
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
  onUserSelect: PropTypes.func.isRequired,
  onUserDeselect: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

MembershipsStep.defaultProps = {
  title: 'common.members',
  onBack: undefined,
};

export default MembershipsStep;
