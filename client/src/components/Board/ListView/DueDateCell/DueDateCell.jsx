import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import DueDate from '../../../DueDate';
import DueDateEditPopup from '../../../DueDateEditPopup';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../../../Utils';

import * as s from './DueDateCell.module.scss';

const DueDateCell = React.memo(({ dueDate, cellClassName, canEdit, onUpdate }) => {
  const [t] = useTranslation();

  const handleDueDateUpdate = useCallback(
    (newDueDate) => {
      onUpdate({
        dueDate: newDueDate,
      });
    },
    [onUpdate],
  );

  if (!dueDate) {
    if (canEdit) {
      return (
        <DueDateEditPopup defaultValue={dueDate} onUpdate={handleDueDateUpdate} wrapperClassName={s.popupWrapper}>
          <Button style={ButtonStyle.Icon} title={t('common.addDueDate')} className={clsx(cellClassName, s.addButton)}>
            <Icon type={IconType.Plus} size={IconSize.Size10} className={s.iconAddButton} />
          </Button>
        </DueDateEditPopup>
      );
    }

    return null;
  }

  return (
    <div className={cellClassName}>
      <DueDateEditPopup defaultValue={dueDate} onUpdate={handleDueDateUpdate} disabled={!canEdit}>
        <DueDate value={dueDate} isClickable={canEdit} />
      </DueDateEditPopup>
    </div>
  );
});

DueDateCell.propTypes = {
  dueDate: PropTypes.instanceOf(Date),
  cellClassName: PropTypes.string,
  canEdit: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

DueDateCell.defaultProps = {
  dueDate: undefined,
  cellClassName: '',
};

export default DueDateCell;
