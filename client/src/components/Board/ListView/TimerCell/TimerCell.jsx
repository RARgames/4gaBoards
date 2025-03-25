import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { startTimer, stopTimer } from '../../../../utils/timer';
import Timer from '../../../Timer';
import TimerEditPopup from '../../../TimerEditPopup';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../../../Utils';

import * as s from './TimerCell.module.scss';

const TimerCell = React.memo(({ timer, cellClassName, canEdit, onUpdate }) => {
  const [t] = useTranslation();

  const handleToggleTimerClick = useCallback(() => {
    onUpdate({
      timer: timer.startedAt ? stopTimer(timer) : startTimer(timer),
    });
  }, [timer, onUpdate]);

  const handleTimerUpdate = useCallback(
    (newTimer) => {
      onUpdate({
        timer: newTimer,
      });
    },
    [onUpdate],
  );

  if (!timer) {
    if (canEdit) {
      return (
        <TimerEditPopup defaultValue={timer} onUpdate={handleTimerUpdate} wrapperClassName={s.popupWrapper}>
          <Button style={ButtonStyle.Icon} title={t('common.editTimer')} className={classNames(cellClassName, s.addButton)}>
            <Icon type={IconType.Plus} size={IconSize.Size10} className={s.iconAddButton} />
          </Button>
        </TimerEditPopup>
      );
    }

    return null;
  }

  return (
    <div className={classNames(cellClassName, s.attachment)} data-prevent-card-switch>
      <Timer as="span" startedAt={timer.startedAt} total={timer.total} variant="card" onClick={canEdit ? handleToggleTimerClick : undefined} />
    </div>
  );
});

TimerCell.propTypes = {
  timer: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  cellClassName: PropTypes.string,
  canEdit: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

TimerCell.defaultProps = {
  timer: undefined,
  cellClassName: '',
};

export default TimerCell;
