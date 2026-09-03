import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { addDays, differenceInCalendarMonths, differenceInCalendarWeeks, format, getISOWeek, getYear } from 'date-fns';
import PropTypes from 'prop-types';

import { Button, ButtonStyle, Icon, IconType, IconSize, withPopup } from '../Utils';
import PeriodPicker from './PeriodPicker';

import * as s from './PeriodNav.module.scss';

const PeriodPickerPopup = withPopup(PeriodPicker);

// A week that straddles new year has to name both years; within one year the start date carries
// the month and the end date carries the year, which is how the label used to read.
const formatWeekRange = (zonedWeekStart) => {
  const zonedWeekEnd = addDays(zonedWeekStart, 6);

  return getYear(zonedWeekStart) === getYear(zonedWeekEnd)
    ? `${format(zonedWeekStart, 'MMM d')} – ${format(zonedWeekEnd, 'MMM d, yyyy')}`
    : `${format(zonedWeekStart, 'MMM d, yyyy')} – ${format(zonedWeekEnd, 'MMM d, yyyy')}`;
};

// Arrowing around the calendar loses track of where "now" is, so the offset is spelled out under
// the range rather than left to the reader to work out from the dates.
const formatOffset = (t, mode, offset) => {
  if (offset === 0) {
    return t(mode === 'month' ? 'common.thisMonth' : 'common.thisWeek');
  }

  if (offset === -1) {
    return t(mode === 'month' ? 'common.lastMonth' : 'common.lastWeek');
  }

  if (offset === 1) {
    return t(mode === 'month' ? 'common.nextMonth' : 'common.nextWeek');
  }

  if (offset < 0) {
    return t(mode === 'month' ? 'common.monthsAgo' : 'common.weeksAgo', { count: -offset });
  }

  return t(mode === 'month' ? 'common.inMonths' : 'common.inWeeks', { count: offset });
};

// Shortcuts stay out of the way of anything that owns the keyboard: form fields, and any floating
// popup or modal (including this component's own picker, which focus-traps into a portal).
const isKeyboardBusy = () => {
  const { activeElement } = document;

  if (!activeElement) {
    return false;
  }

  return activeElement.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName) || !!activeElement.closest('[data-floating-ui-portal], [role="dialog"]');
};

const PeriodNav = React.memo(({ mode, zonedPeriodStart, zonedNow, onPrev, onNext, onToday, onSelect }) => {
  const [t] = useTranslation();
  const onPrevRef = useRef(onPrev);
  const onNextRef = useRef(onNext);
  const onTodayRef = useRef(onToday);

  onPrevRef.current = onPrev;
  onNextRef.current = onNext;
  onTodayRef.current = onToday;

  const offset = useMemo(
    () => (mode === 'month' ? differenceInCalendarMonths(zonedPeriodStart, zonedNow) : differenceInCalendarWeeks(zonedPeriodStart, zonedNow, { weekStartsOn: 1 })),
    [mode, zonedPeriodStart, zonedNow],
  );

  const rangeLabel = mode === 'month' ? format(zonedPeriodStart, 'MMMM yyyy') : formatWeekRange(zonedPeriodStart);
  const offsetLabel = formatOffset(t, mode, offset);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || isKeyboardBusy()) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        onPrevRef.current();
      } else if (event.key === 'ArrowRight') {
        onNextRef.current();
      } else if (event.key === 't' || event.key === 'T') {
        onTodayRef.current();
      } else {
        return;
      }

      event.preventDefault();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = useCallback((zonedDate) => onSelect(zonedDate), [onSelect]);

  return (
    <div className={s.wrapper}>
      <div className={s.segment}>
        <Button style={ButtonStyle.Icon} title={t('action.previousPeriod')} className={s.stepButton} onClick={onPrev}>
          <Icon type={IconType.AngleLeft} size={IconSize.Size12} />
        </Button>
        <PeriodPickerPopup mode={mode} zonedPeriodStart={zonedPeriodStart} zonedNow={zonedNow} onSelect={handleSelect} hideCloseButton position="bottom-start" offset={6} wrapperClassName={s.pickerWrapper}>
          <button type="button" className={s.periodButton} title={t('action.selectPeriod')}>
            <span className={s.periodLabel}>
              {rangeLabel}
              <Icon type={IconType.TriangleDown} size={IconSize.Size8} className={s.periodCaret} />
            </span>
            <span className={s.periodOffset}>{mode === 'month' ? offsetLabel : `${offsetLabel} · ${t('common.weekNumber', { number: getISOWeek(zonedPeriodStart) })}`}</span>
          </button>
        </PeriodPickerPopup>
        <Button style={ButtonStyle.Icon} title={t('action.nextPeriod')} className={s.stepButton} onClick={onNext}>
          <Icon type={IconType.AngleLeft} size={IconSize.Size12} className={s.iconFlipped} />
        </Button>
      </div>
      <Button style={ButtonStyle.DefaultBorder} className={s.todayButton} disabled={offset === 0} content={t('action.today')} onClick={onToday} />
    </div>
  );
});

PeriodNav.propTypes = {
  mode: PropTypes.oneOf(['week', 'month']),
  zonedPeriodStart: PropTypes.instanceOf(Date).isRequired,
  zonedNow: PropTypes.instanceOf(Date).isRequired,
  onPrev: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onToday: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
};

PeriodNav.defaultProps = {
  mode: 'week',
};

export default PeriodNav;
