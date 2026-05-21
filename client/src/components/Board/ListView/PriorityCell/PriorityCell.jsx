import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import Priority from '../../../Priority';
import { Dropdown, DropdownStyle } from '../../../Utils';

import * as s from './PriorityCell.module.scss';

const PriorityCell = React.memo(({ priority, allPriorities, cellClassName, canEdit, onUpdate }) => {
  const [t] = useTranslation();

  const handleChange = useCallback(
    (option) => {
      onUpdate({ priority: option.id === 'none' ? null : option.id });
    },
    [onUpdate],
  );

  if (!canEdit) {
    return <div className={cellClassName}>{priority ? <Priority name={priority.name} color={priority.color} variant="card" /> : null}</div>;
  }

  const options = [{ id: 'none', name: t('common.noPriority') }, ...allPriorities.map((p) => ({ id: p.id, name: p.name }))];
  const defaultItem = priority ? { id: priority.id, name: priority.name } : { id: 'none', name: t('common.noPriority') };

  return (
    <div className={clsx(cellClassName, s.wrapper)} data-prevent-card-switch>
      <Dropdown
        key={priority ? priority.id : 'none'}
        style={DropdownStyle.FullWidth}
        options={options}
        placeholder={defaultItem.name}
        defaultItem={defaultItem}
        isSearchable
        onChange={handleChange}
      />
    </div>
  );
});

PriorityCell.propTypes = {
  priority: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  allPriorities: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  cellClassName: PropTypes.string,
  canEdit: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

PriorityCell.defaultProps = {
  priority: undefined,
  cellClassName: '',
};

export default PriorityCell;
