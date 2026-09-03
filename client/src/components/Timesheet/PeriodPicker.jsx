import React, { useCallback, useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { addDays, addMonths, addYears, eachDayOfInterval, format, getISOWeek, isSameDay, isSameMonth, parse, setMonth, startOfMonth, startOfWeek } from 'date-fns';
import PropTypes from 'prop-types';

import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';

import * as s from './PeriodPicker.module.scss';

// A month grid always fits in six week rows, so the row count is fixed — that keeps the popup a
// constant height as you page through months instead of jumping by a row.
const WEEK_ROWS = 6;
const MONTHS_IN_YEAR = 12;

// Everything in here is a "zoned" date (the fake-local trick described in Timesheet.jsx): the
// caller hands us wall-clock dates in the viewed timezone and gets one back, so the picker never
// has to know about the real-instant conversion.
const PeriodPicker = React.memo(({ mode, zonedPeriodStart, zonedNow, onSelect, onClose }) => {
  const [t] = useTranslation();
  const jumpToDateId = useId();
  // A week that straddles two months belongs, for display purposes, to the month holding most of
  // it — the ISO rule, i.e. whichever month its Thursday falls in. Anchoring on the week's own
  // start would open the picker on the previous month with the selected row stranded at the
  // bottom, mostly greyed out.
  const [cursor, setCursor] = useState(() => startOfMonth(mode === 'month' ? zonedPeriodStart : addDays(startOfWeek(zonedPeriodStart, { weekStartsOn: 1 }), 3)));

  const selectedWeekStart = useMemo(() => startOfWeek(zonedPeriodStart, { weekStartsOn: 1 }), [zonedPeriodStart]);
  const currentWeekStart = useMemo(() => startOfWeek(zonedNow, { weekStartsOn: 1 }), [zonedNow]);

  const weeks = useMemo(
    () =>
      Array.from({ length: WEEK_ROWS }, (unused, index) => {
        const start = addDays(startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 }), index * 7);
        return { start, days: eachDayOfInterval({ start, end: addDays(start, 6) }) };
      }),
    [cursor],
  );

  const months = useMemo(() => Array.from({ length: MONTHS_IN_YEAR }, (unused, index) => setMonth(startOfMonth(cursor), index)), [cursor]);

  const handleSelect = useCallback(
    (date) => {
      onSelect(date);
      onClose();
    },
    [onSelect, onClose],
  );

  const handleStepCursor = useCallback((amount) => setCursor((prev) => (mode === 'month' ? addYears(prev, amount) : addMonths(prev, amount))), [mode]);

  const handleJumpToDate = useCallback(
    (event) => {
      if (!event.target.value) {
        return;
      }

      const parsed = parse(event.target.value, 'yyyy-MM-dd', new Date());

      if (!Number.isNaN(parsed.getTime())) {
        handleSelect(parsed);
      }
    },
    [handleSelect],
  );

  return (
    <div className={s.wrapper}>
      <div className={s.header}>
        <Button style={ButtonStyle.Icon} title={t(mode === 'month' ? 'action.previousYear' : 'action.previousMonth')} onClick={() => handleStepCursor(-1)}>
          <Icon type={IconType.AngleLeft} size={IconSize.Size12} />
        </Button>
        <span className={s.headerLabel}>{format(cursor, mode === 'month' ? 'yyyy' : 'MMMM yyyy')}</span>
        <Button style={ButtonStyle.Icon} title={t(mode === 'month' ? 'action.nextYear' : 'action.nextMonth')} onClick={() => handleStepCursor(1)}>
          <Icon type={IconType.AngleLeft} size={IconSize.Size12} className={s.iconFlipped} />
        </Button>
      </div>
      {mode === 'month' ? (
        <div className={s.monthGrid}>
          {months.map((month) => (
            <button
              key={month.getTime()}
              type="button"
              className={clsx(s.monthCell, isSameMonth(month, zonedPeriodStart) && s.cellSelected, isSameMonth(month, zonedNow) && s.cellCurrent)}
              onClick={() => handleSelect(month)}
            >
              {format(month, 'MMM')}
            </button>
          ))}
        </div>
      ) : (
        <div className={s.weekGrid}>
          <div className={s.dayNames}>
            <span className={s.weekNumber} />
            {weeks[0].days.map((day) => (
              <span key={day.getTime()} className={s.dayName}>
                {format(day, 'EEEEE')}
              </span>
            ))}
          </div>
          {weeks.map((week) => (
            <button
              key={week.start.getTime()}
              type="button"
              className={clsx(s.weekRow, isSameDay(week.start, selectedWeekStart) && s.cellSelected, isSameDay(week.start, currentWeekStart) && s.cellCurrent)}
              title={t('common.weekNumber', { number: getISOWeek(week.start) })}
              onClick={() => handleSelect(week.start)}
            >
              <span className={s.weekNumber}>{getISOWeek(week.start)}</span>
              {week.days.map((day) => (
                <span key={day.getTime()} className={clsx(s.day, !isSameMonth(day, cursor) && s.dayOutsideMonth, isSameDay(day, zonedNow) && s.dayToday)}>
                  {format(day, 'd')}
                </span>
              ))}
            </button>
          ))}
        </div>
      )}
      <div className={s.footer}>
        <Button style={ButtonStyle.DefaultBorder} className={s.shortcut} content={t(mode === 'month' ? 'common.thisMonth' : 'common.thisWeek')} onClick={() => handleSelect(zonedNow)} />
        <Button
          style={ButtonStyle.DefaultBorder}
          className={s.shortcut}
          content={t(mode === 'month' ? 'common.lastMonth' : 'common.lastWeek')}
          onClick={() => handleSelect(mode === 'month' ? addMonths(zonedNow, -1) : addDays(zonedNow, -7))}
        />
        <div className={s.jumpToDate}>
          <label className={s.jumpToDateLabel} htmlFor={jumpToDateId}>
            {t('common.jumpToDate')}
          </label>
          <input id={jumpToDateId} type="date" className={s.jumpToDateInput} value={format(zonedPeriodStart, 'yyyy-MM-dd')} onChange={handleJumpToDate} />
        </div>
      </div>
    </div>
  );
});

PeriodPicker.propTypes = {
  mode: PropTypes.oneOf(['week', 'month']),
  zonedPeriodStart: PropTypes.instanceOf(Date).isRequired,
  zonedNow: PropTypes.instanceOf(Date).isRequired,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

PeriodPicker.defaultProps = {
  mode: 'week',
};

export default PeriodPicker;
