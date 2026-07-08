import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addDays, addWeeks, format, startOfWeek } from 'date-fns';
import PropTypes from 'prop-types';

import { getBoardAccentColor } from '../../utils/board-colors';
import { Button, ButtonStyle, Dropdown, DropdownStyle, Icon, IconType, IconSize } from '../Utils';
import EntryPopup from './EntryPopup';
import WeekGrid from './WeekGrid';

import * as s from './Timesheet.module.scss';

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins}m`;
  }
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
};

const Timesheet = React.memo(({ currentUserId, isAdmin, users, timeEntries, projects, assignedCards, allCards, onFetch, onCreate, onUpdate, onDelete }) => {
  const [t] = useTranslation();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [popup, setPopup] = useState(null);
  const [selectedViewedUserId, setSelectedViewedUserId] = useState(null);

  const viewedUserId = isAdmin && selectedViewedUserId ? selectedViewedUserId : currentUserId;
  const isViewingOther = viewedUserId !== currentUserId;
  const weekEnd = useMemo(() => addDays(weekStart, 7), [weekStart]);

  useEffect(() => {
    if (viewedUserId) {
      onFetch({ userId: viewedUserId, from: weekStart, to: weekEnd, subscribe: true });
    }
  }, [viewedUserId, weekStart, weekEnd, onFetch]);

  const usersById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);
  const switcherOptions = useMemo(() => users.map((user) => ({ id: user.id, name: user.id === currentUserId ? t('common.me') : user.name })), [users, currentUserId, t]);
  const viewedUser = usersById.get(viewedUserId);

  const projectOptions = useMemo(() => projects.map((project) => ({ id: project.id, name: project.name })), [projects]);
  const projectsById = useMemo(() => new Map(projects.map((project) => [project.id, project.name])), [projects]);
  const cardsById = useMemo(() => {
    const map = new Map();
    assignedCards.forEach((card) => map.set(card.id, card));
    allCards.forEach((card) => map.set(card.id, card));
    return map;
  }, [assignedCards, allCards]);

  const weekEntries = useMemo(
    () =>
      timeEntries
        .filter((timeEntry) => timeEntry.userId === viewedUserId && timeEntry.startedAt < weekEnd && timeEntry.endedAt > weekStart)
        .map((timeEntry) => ({
          ...timeEntry,
          projectName: timeEntry.projectId ? projectsById.get(timeEntry.projectId) : null,
          projectColor: timeEntry.projectId ? getBoardAccentColor(timeEntry.projectId) : null,
          cardName: timeEntry.cardId && cardsById.has(timeEntry.cardId) ? cardsById.get(timeEntry.cardId).name : null,
        }))
        .sort((a, b) => a.startedAt - b.startedAt),
    [timeEntries, viewedUserId, weekStart, weekEnd, projectsById, cardsById],
  );

  const weekTotalMinutes = useMemo(() => weekEntries.reduce((sum, entry) => sum + Math.round((entry.endedAt.getTime() - entry.startedAt.getTime()) / 60000), 0), [weekEntries]);

  const handleClosePopup = useCallback(() => setPopup(null), []);

  const handleCreate = useCallback(({ startedAt, endedAt, anchorRect }) => {
    setPopup({ mode: 'create', anchorRect, initialValues: { description: '', startedAt, endedAt, projectId: null, cardId: null }, entryId: null });
  }, []);

  const handleEntryClick = useCallback(
    (entry, entryRect) => {
      const loggedByUser = entry.createdById && entry.createdById !== entry.userId ? usersById.get(entry.createdById) : null;

      setPopup({
        mode: 'edit',
        anchorRect: { top: entryRect.top, left: entryRect.left, width: entryRect.width, height: entryRect.height },
        initialValues: { description: entry.description, startedAt: entry.startedAt, endedAt: entry.endedAt, projectId: entry.projectId, cardId: entry.cardId },
        entryId: entry.id,
        loggedByName: loggedByUser ? loggedByUser.name : null,
      });
    },
    [usersById],
  );

  const handleMove = useCallback(
    (entry, newStartedAt, newEndedAt) => {
      onUpdate(entry.id, { startedAt: newStartedAt, endedAt: newEndedAt });
    },
    [onUpdate],
  );

  const handleResize = useCallback(
    (entry, newStartedAt, newEndedAt) => {
      onUpdate(entry.id, { startedAt: newStartedAt, endedAt: newEndedAt });
    },
    [onUpdate],
  );

  const handleSave = useCallback(
    (values) => {
      if (!popup) {
        return;
      }

      if (popup.mode === 'create') {
        const payload = {
          description: values.description,
          startedAt: values.startedAt,
          endedAt: values.endedAt,
          userId: viewedUserId,
        };
        if (values.cardId) {
          payload.cardId = values.cardId;
        } else if (values.projectId) {
          payload.projectId = values.projectId;
        }
        onCreate(payload);
      } else {
        onUpdate(popup.entryId, {
          description: values.description,
          startedAt: values.startedAt,
          endedAt: values.endedAt,
          projectId: values.projectId,
          cardId: values.cardId,
        });
      }

      setPopup(null);
    },
    [popup, viewedUserId, onCreate, onUpdate],
  );

  const handleDelete = useCallback(() => {
    if (popup && popup.entryId) {
      onDelete(popup.entryId);
    }
    setPopup(null);
  }, [popup, onDelete]);

  return (
    <div className={s.wrapper}>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>{t('common.timesheet')}</h1>
        <p className={s.pageDescription}>{t('common.timesheetDescription')}</p>
        {isViewingOther && viewedUser && <p className={s.viewingBanner}>{t('common.viewingTimesheet', { name: viewedUser.name })}</p>}
      </div>
      <div className={s.toolbar}>
        <div className={s.navGroup}>
          <Button style={ButtonStyle.Icon} title={t('action.previousPeriod')} onClick={() => setWeekStart((d) => addWeeks(d, -1))}>
            <Icon type={IconType.AngleLeft} size={IconSize.Size12} />
          </Button>
          <Button style={ButtonStyle.NoBackground} className={s.todayButton} onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
            {t('action.today')}
          </Button>
          <Button style={ButtonStyle.Icon} title={t('action.nextPeriod')} onClick={() => setWeekStart((d) => addWeeks(d, 1))}>
            <Icon type={IconType.AngleLeft} size={IconSize.Size12} className={s.iconFlipped} />
          </Button>
          <span className={s.periodLabel}>
            {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </span>
        </div>
        {isAdmin && (
          <Dropdown
            style={DropdownStyle.Default}
            options={switcherOptions}
            defaultItem={switcherOptions.find((option) => option.id === viewedUserId)}
            placeholder={t('common.me')}
            onChange={(item) => setSelectedViewedUserId(item.id === currentUserId ? null : item.id)}
            className={s.switcherDropdown}
          />
        )}
        <div className={s.spacer} />
        <span className={s.weekTotal}>{t('common.weekTotal', { duration: formatDuration(weekTotalMinutes) })}</span>
      </div>
      <div className={s.content}>
        <WeekGrid weekStart={weekStart} entries={weekEntries} onCreate={handleCreate} onMove={handleMove} onResize={handleResize} onEntryClick={handleEntryClick} />
        {weekEntries.length === 0 && <div className={s.empty}>{t('common.noTimeEntriesWeek')}</div>}
      </div>
      {popup && (
        <EntryPopup
          mode={popup.mode}
          anchorRect={popup.anchorRect}
          initialValues={popup.initialValues}
          projectOptions={projectOptions}
          assignedCards={assignedCards}
          allCards={allCards}
          loggedByName={popup.loggedByName}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
});

Timesheet.propTypes = {
  currentUserId: PropTypes.string,
  isAdmin: PropTypes.bool.isRequired,
  users: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  timeEntries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  assignedCards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allCards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onFetch: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

Timesheet.defaultProps = {
  currentUserId: undefined,
};

export default Timesheet;
