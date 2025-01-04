import React, { useCallback } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import PropTypes from 'prop-types';

import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';

import * as globalStyles from '../../styles.module.scss';
import * as s from './Item.module.scss';

const Item = React.memo(({ id, index, name, color, isPersisted, isActive, canEdit, onSelect, onDeselect, onEdit }) => {
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
    <Draggable draggableId={id} index={index} isDragDisabled={!isPersisted || !canEdit}>
      {({ innerRef, draggableProps, dragHandleProps }, { isDragging }) => {
        const contentNode = (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div {...draggableProps} ref={innerRef} className={s.wrapper}>
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <span
              {...dragHandleProps} // eslint-disable-line react/jsx-props-no-spreading
              className={classNames(s.name, isActive && s.nameActive, globalStyles[`background${upperFirst(camelCase(color))}`])}
              onClick={handleToggleClick}
            >
              {name}
            </span>
            {canEdit && (
              <Button style={ButtonStyle.Icon} title={t('common.editLabel')} onClick={onEdit} disabled={!isPersisted} className={s.editButton}>
                <Icon type={IconType.Pencil} size={IconSize.Size14} />
              </Button>
            )}
          </div>
        );

        return isDragging ? ReactDOM.createPortal(contentNode, document.body) : contentNode;
      }}
    </Draggable>
  );
});

Item.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
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
