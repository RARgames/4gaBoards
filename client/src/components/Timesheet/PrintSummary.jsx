import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { format } from 'date-fns';
import PropTypes from 'prop-types';

import formatDuration from '../../utils/format-duration';
import { getEffectiveTimeZone, utcToZonedTime } from '../../utils/timezone';
import { Button, ButtonStyle } from '../Utils';

import * as s from './PrintSummary.module.scss';

const PrintSummary = React.memo(({ range, viewedUserId, viewedUserName, timeEntries, projectsById, timezone, onFetch, onClose }) => {
  const [t] = useTranslation();
  const effectiveTimeZone = getEffectiveTimeZone(timezone);

  useEffect(() => {
    if (viewedUserId) {
      onFetch({ userId: viewedUserId, from: range.from, to: range.to, subscribe: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewedUserId, range]);

  const { dayGroups, grandTotalMinutes } = useMemo(() => {
    const scoped = timeEntries
      .filter((timeEntry) => timeEntry.userId === viewedUserId && timeEntry.startedAt < range.to && timeEntry.endedAt > range.from && (!range.projectId || timeEntry.projectId === range.projectId))
      .map((timeEntry) => ({ ...timeEntry, startedAt: utcToZonedTime(timeEntry.startedAt, effectiveTimeZone), endedAt: utcToZonedTime(timeEntry.endedAt, effectiveTimeZone) }))
      .sort((a, b) => a.startedAt - b.startedAt);

    const byDay = new Map();
    let total = 0;

    scoped.forEach((timeEntry) => {
      const dayKey = format(timeEntry.startedAt, 'yyyy-MM-dd');
      if (!byDay.has(dayKey)) {
        byDay.set(dayKey, { date: timeEntry.startedAt, entries: [], totalMinutes: 0 });
      }
      const group = byDay.get(dayKey);
      const minutes = Math.round((timeEntry.endedAt.getTime() - timeEntry.startedAt.getTime()) / 60000);
      group.entries.push({
        ...timeEntry,
        projectName: timeEntry.projectId ? projectsById.get(timeEntry.projectId) : null,
        minutes,
      });
      group.totalMinutes += minutes;
      total += minutes;
    });

    return { dayGroups: Array.from(byDay.values()), grandTotalMinutes: total };
  }, [timeEntries, viewedUserId, range, projectsById, effectiveTimeZone]);

  return (
    <div className={s.overlay}>
      <div className={clsx(s.toolbar, 'timesheet-print-toolbar')}>
        <Button style={ButtonStyle.Submit} content={t('action.print')} onClick={() => window.print()} />
        <Button style={ButtonStyle.Cancel} content={t('common.close')} onClick={onClose} />
      </div>
      <div className={clsx(s.printArea, 'timesheet-print-area')}>
        <h1 className={s.title}>{t('common.timesheetSummary')}</h1>
        <p className={s.subtitle}>
          {viewedUserName} · {format(range.from, 'MMM d, yyyy')} – {format(range.to, 'MMM d, yyyy')}
        </p>
        {dayGroups.length === 0 && <p className={s.empty}>{t('common.noTimeEntriesWeek')}</p>}
        {dayGroups.map((group) => (
          <table key={format(group.date, 'yyyy-MM-dd')} className={s.dayTable}>
            <thead>
              <tr>
                <th colSpan={4} className={s.dayHeader}>
                  {format(group.date, 'EEEE, MMM d, yyyy')}
                </th>
              </tr>
              <tr>
                <th>{t('common.start')}</th>
                <th>{t('common.end')}</th>
                <th>{t('common.description')}</th>
                <th>{t('common.project', { context: 'title' })}</th>
              </tr>
            </thead>
            <tbody>
              {group.entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{format(entry.startedAt, 'HH:mm')}</td>
                  <td>{format(entry.endedAt, 'HH:mm')}</td>
                  <td>{entry.description || t('common.noDescription')}</td>
                  <td>{entry.projectName || ''}</td>
                </tr>
              ))}
              <tr className={s.subtotalRow}>
                <td colSpan={3}>{t('common.dailyTotal')}</td>
                <td>{formatDuration(group.totalMinutes)}</td>
              </tr>
            </tbody>
          </table>
        ))}
        <div className={s.grandTotal}>
          {t('common.grandTotal')}: {formatDuration(grandTotalMinutes)}
        </div>
      </div>
    </div>
  );
});

PrintSummary.propTypes = {
  range: PropTypes.shape({
    from: PropTypes.instanceOf(Date).isRequired,
    to: PropTypes.instanceOf(Date).isRequired,
    projectId: PropTypes.string,
  }).isRequired,
  viewedUserId: PropTypes.string,
  viewedUserName: PropTypes.string,
  timeEntries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  projectsById: PropTypes.instanceOf(Map).isRequired,
  timezone: PropTypes.string,
  onFetch: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

PrintSummary.defaultProps = {
  viewedUserId: undefined,
  viewedUserName: undefined,
  timezone: undefined,
};

export default PrintSummary;
