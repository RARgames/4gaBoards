import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { differenceInCalendarDays } from 'date-fns';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import Paths from '../../../constants/Paths';
import DueDate from '../../DueDate';
import DueDateEditPopup from '../../DueDateEditPopup';
import Label from '../../Label';
import User from '../../User';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../../Utils';

import * as s from './CardDetailPanel.module.scss';

const CardDetailPanel = React.memo(({ card, boardName, listName, color, labels, users, canEdit, onUpdate, onClose }) => {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const handleStartDateUpdate = useCallback(
    (startDate) => {
      onUpdate(card.id, { startDate });
    },
    [card, onUpdate],
  );

  const handleDueDateUpdate = useCallback(
    (dueDate) => {
      onUpdate(card.id, { dueDate });
    },
    [card, onUpdate],
  );

  const handleOpenFull = useCallback(() => {
    navigate(Paths.CARDS.replace(':id', card.id));
  }, [navigate, card]);

  const handleUnschedule = useCallback(() => {
    onUpdate(card.id, { startDate: null, dueDate: null });
  }, [card, onUpdate]);

  if (!card) {
    return null;
  }

  const durationDays = card.startDate && card.dueDate ? differenceInCalendarDays(new Date(card.dueDate), new Date(card.startDate)) + 1 : null;

  return (
    <div className={s.wrapper}>
      <div className={s.colorBar} style={{ background: color || undefined }} />
      <div className={s.header}>
        <div className={s.breadcrumb} title={`${boardName || ''} ${listName ? `› ${listName}` : ''}`}>
          {boardName && <span className={s.breadcrumbPill}>{boardName}</span>}
          {listName && <span className={s.breadcrumbPill}>{listName}</span>}
        </div>
        <Button style={ButtonStyle.Icon} title={t('action.close')} onClick={onClose}>
          <Icon type={IconType.Close} size={IconSize.Size12} />
        </Button>
      </div>
      <div className={s.body}>
        <h2 className={s.name}>{card.name}</h2>

        <div className={s.section}>
          <div className={s.sectionLabel}>{t('action.schedule')}</div>
          <div className={s.scheduleRow}>
            <DueDateEditPopup defaultValue={card.startDate} onUpdate={handleStartDateUpdate} disabled={!canEdit}>
              <div className={clsx(s.schedulePill, canEdit && s.schedulePillClickable)}>
                <span className={s.schedulePillLabel}>{t('common.scheduleStart')}</span>
                {card.startDate ? <DueDate value={card.startDate} className={s.schedulePillValue} /> : <span className={s.emptyValue}>{t('common.none')}</span>}
              </div>
            </DueDateEditPopup>
            <DueDateEditPopup defaultValue={card.dueDate} onUpdate={handleDueDateUpdate} disabled={!canEdit}>
              <div className={clsx(s.schedulePill, canEdit && s.schedulePillClickable)}>
                <span className={s.schedulePillLabel}>{t('common.scheduleDue')}</span>
                {card.dueDate ? <DueDate value={card.dueDate} className={s.schedulePillValue} /> : <span className={s.emptyValue}>{t('common.none')}</span>}
              </div>
            </DueDateEditPopup>
          </div>
          {durationDays !== null && <div className={s.duration}>{t('common.durationDays', { count: durationDays })}</div>}
        </div>

        {users.length > 0 && (
          <div className={s.section}>
            <div className={s.sectionLabel}>{t('common.members')}</div>
            <div className={s.members}>
              {users.map((user) => (
                <User key={user.id} name={user.name} avatarUrl={user.avatarUrl} size="small" />
              ))}
            </div>
          </div>
        )}

        {labels.length > 0 && (
          <div className={s.section}>
            <div className={s.sectionLabel}>{t('common.labels')}</div>
            <div className={s.labels}>
              {labels.map((label) => (
                <Label key={label.id} name={label.name} color={label.color} variant="card" />
              ))}
            </div>
          </div>
        )}

        <div className={s.section}>
          <div className={s.sectionLabel}>{t('common.description')}</div>
          {card.description ? <div className={s.description}>{card.description}</div> : <span className={s.emptyValue}>{t('common.noDescription')}</span>}
        </div>
      </div>
      <div className={s.footer}>
        <Button style={ButtonStyle.DefaultBorder} content={t('action.openFullCard')} onClick={handleOpenFull} />
        {canEdit && (card.startDate || card.dueDate) && <Button style={ButtonStyle.DefaultBorder} content={t('action.unschedule')} onClick={handleUnschedule} />}
      </div>
    </div>
  );
});

CardDetailPanel.propTypes = {
  card: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  boardName: PropTypes.string,
  listName: PropTypes.string,
  color: PropTypes.string,
  labels: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  users: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool,
  onUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

CardDetailPanel.defaultProps = {
  card: null,
  boardName: undefined,
  listName: undefined,
  color: undefined,
  labels: [],
  users: [],
  canEdit: false,
};

export default CardDetailPanel;
