import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { Button, ButtonVariant, Icon, IconType, IconSize } from '../Utils';

import * as s from './Item.module.scss';

const Item = React.memo(({ name, color, isPersisted, isActive, canEdit, onSelect, onDeselect, onEdit }) => {
  const [t] = useTranslation();

  const handleToggleClick = useCallback(() => {
    if (isPersisted) {
      if (isActive) {
        onDeselect();
      } else {
        onSelect();
      }
    }
  }, [isPersisted, isActive, onSelect, onDeselect]);

  return (
    <div className={s.wrapper}>
      <Button variant={ButtonVariant.Default} style={{ backgroundColor: color }} className={clsx(s.name, isActive && s.nameActive)} onClick={handleToggleClick} content={name} />
      {canEdit && (
        <Button variant={ButtonVariant.Icon} title={t('common.editLabel')} onClick={onEdit} disabled={!isPersisted} className={s.editButton}>
          <Icon type={IconType.Pencil} size={IconSize.Size14} />
        </Button>
      )}
    </div>
  );
});

Item.propTypes = {
  name: PropTypes.string,
  color: PropTypes.string.isRequired,
  isPersisted: PropTypes.bool.isRequired,
  isActive: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onDeselect: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

Item.defaultProps = {
  name: undefined,
};

export default Item;
