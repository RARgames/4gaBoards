import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import PropTypes from 'prop-types';

import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';

import * as bs from '../../backgrounds.module.scss';
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
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <span className={clsx(s.name, isActive && s.nameActive, bs[`background${upperFirst(camelCase(color))}`])} onClick={handleToggleClick} title={name}>
        {name}
      </span>
      {canEdit && (
        <Button style={ButtonStyle.Icon} title={t('common.editLabel')} onClick={onEdit} disabled={!isPersisted} className={s.editButton}>
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
