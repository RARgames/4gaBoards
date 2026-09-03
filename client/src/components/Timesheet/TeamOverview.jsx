import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import clsx from 'clsx';
import { addMonths, addWeeks, eachDayOfInterval, endOfMonth, format, isSameDay, isWeekend, startOfMonth, startOfWeek, subDays } from 'date-fns';
import PropTypes from 'prop-types';

import api from '../../api';
import Paths from '../../constants/Paths';
import formatDuration from '../../utils/format-duration';
import { getEffectiveTimeZone, getSupportedTimeZones, getTimeZoneLabel, utcToZonedTime, zonedTimeToUtc } from '../../utils/timezone';
import triggerDownload from '../../utils/trigger-download';
import User from '../User';
import { Button, ButtonStyle, Checkbox, Dropdown, DropdownStyle, Input, InputStyle, Loader, LoaderSize } from '../Utils';
import ExportPopup from './ExportPopup';
import InvoicePrint from './InvoicePrint';
import PeriodNav from './PeriodNav';
import TimesheetHeaderTabs from './TimesheetHeaderTabs';

import * as s from './TeamOverview.module.scss';

const VIEW_MODES = ['week', 'month'];

const anchorForMode = (mode, date) => (mode === 'week' ? startOfWeek(date, { weekStartsOn: 1 }) : startOfMonth(date));

// periodStart/periodEnd are kept as real instants (correct for the fetch range and for
// TimeEntry comparisons), while everything rendered — day columns, labels, dayKey lookups
// against the server's zone-bucketed response — works off their "fake-local" zoned counterparts.
// See the equivalent comment in Timesheet.jsx for the utcToZonedTime/zonedTimeToUtc trick itself.
const computePeriodStartReal = (mode, timeZone, referenceRealDate = new Date()) => zonedTimeToUtc(anchorForMode(mode, utcToZonedTime(referenceRealDate, timeZone)), timeZone);

const TeamOverview = React.memo(({ isAdmin, users, overview, projects, timeEntries, categoryTags, accessToken, timezone, onFetch, onFetchTimeEntries, onFetchCategoryTags, onTimezoneChange }) => {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const effectiveTimeZone = getEffectiveTimeZone(timezone);

  const [viewMode, setViewMode] = useState('week');
  const [periodStart, setPeriodStart] = useState(() => computePeriodStartReal('week', effectiveTimeZone));
  const [query, setQuery] = useState('');
  const [hideEmpty, setHideEmpty] = useState(false);
  const [invoiceParams, setInvoiceParams] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate(Paths.TIMESHEET);
    }
  }, [isAdmin, navigate]);

  const zonedPeriodStart = useMemo(() => utcToZonedTime(periodStart, effectiveTimeZone), [periodStart, effectiveTimeZone]);

  const periodEnd = useMemo(() => zonedTimeToUtc(viewMode === 'week' ? addWeeks(zonedPeriodStart, 1) : endOfMonth(zonedPeriodStart), effectiveTimeZone), [viewMode, zonedPeriodStart, effectiveTimeZone]);

  const zonedPeriodEnd = useMemo(() => utcToZonedTime(periodEnd, effectiveTimeZone), [periodEnd, effectiveTimeZone]);

  useEffect(() => {
    if (isAdmin) {
      onFetch({ from: periodStart, to: viewMode === 'week' ? periodEnd : zonedTimeToUtc(addMonths(zonedPeriodStart, 1), effectiveTimeZone) });
    }
  }, [isAdmin, periodStart, periodEnd, viewMode, zonedPeriodStart, effectiveTimeZone, onFetch]);

  useEffect(() => {
    if (isAdmin) {
      onFetchCategoryTags();
    }
  }, [isAdmin, onFetchCategoryTags]);

  const days = useMemo(() => eachDayOfInterval({ start: zonedPeriodStart, end: viewMode === 'week' ? subDays(zonedPeriodEnd, 1) : zonedPeriodEnd }), [zonedPeriodStart, zonedPeriodEnd, viewMode]);

  const zonedNow = utcToZonedTime(new Date(), effectiveTimeZone);

  const overviewByUserId = useMemo(() => new Map(overview.items.map((item) => [item.userId, item])), [overview.items]);

  const rows = useMemo(() => {
    let result = users.map((user) => {
      const data = overviewByUserId.get(user.id);
      return { user, days: data ? data.days : {}, totalMinutes: data ? data.totalMinutes : 0 };
    });

    const trimmedQuery = query.trim().toLowerCase();
    if (trimmedQuery) {
      result = result.filter((row) => row.user.name.toLowerCase().includes(trimmedQuery));
    }

    if (hideEmpty) {
      result = result.filter((row) => row.totalMinutes > 0);
    }

    return result;
  }, [users, overviewByUserId, query, hideEmpty]);

  const viewModeOptions = useMemo(() => VIEW_MODES.map((mode) => ({ id: mode, name: t(`common.${mode === 'week' ? 'weeklyTimesheets' : 'monthlyTimesheets'}`) })), [t]);

  const timeZoneOptions = useMemo(
    () => [{ id: 'browser-default', name: `${t('common.browserDefault')} (${getEffectiveTimeZone(null)})` }, ...getSupportedTimeZones().map((zone) => ({ id: zone, name: getTimeZoneLabel(zone) }))],
    [t],
  );

  const handleViewModeChange = useCallback(
    (mode) => {
      setViewMode(mode);
      setPeriodStart((prev) => zonedTimeToUtc(anchorForMode(mode, utcToZonedTime(prev, effectiveTimeZone)), effectiveTimeZone));
    },
    [effectiveTimeZone],
  );

  const handlePrev = useCallback(() => {
    setPeriodStart((prev) => zonedTimeToUtc(viewMode === 'week' ? addWeeks(utcToZonedTime(prev, effectiveTimeZone), -1) : addMonths(utcToZonedTime(prev, effectiveTimeZone), -1), effectiveTimeZone));
  }, [viewMode, effectiveTimeZone]);

  const handleNext = useCallback(() => {
    setPeriodStart((prev) => zonedTimeToUtc(viewMode === 'week' ? addWeeks(utcToZonedTime(prev, effectiveTimeZone), 1) : addMonths(utcToZonedTime(prev, effectiveTimeZone), 1), effectiveTimeZone));
  }, [viewMode, effectiveTimeZone]);

  const handleToday = useCallback(() => {
    setPeriodStart(computePeriodStartReal(viewMode, effectiveTimeZone));
  }, [viewMode, effectiveTimeZone]);

  const handleSelectPeriod = useCallback((zonedDate) => setPeriodStart(zonedTimeToUtc(anchorForMode(viewMode, zonedDate), effectiveTimeZone)), [viewMode, effectiveTimeZone]);

  const handleMemberClick = useCallback(
    (userId) => {
      const weekStartZoned = viewMode === 'week' ? zonedPeriodStart : startOfWeek(zonedNow, { weekStartsOn: 1 });
      navigate(Paths.TIMESHEET, { state: { viewedUserId: userId, weekStart: zonedTimeToUtc(weekStartZoned, effectiveTimeZone).toISOString() } });
    },
    [navigate, viewMode, zonedPeriodStart, zonedNow, effectiveTimeZone],
  );

  const handleDayClick = useCallback(
    (userId, day) => {
      navigate(Paths.TIMESHEET, { state: { viewedUserId: userId, weekStart: zonedTimeToUtc(startOfWeek(day, { weekStartsOn: 1 }), effectiveTimeZone).toISOString() } });
    },
    [navigate, effectiveTimeZone],
  );

  const projectOptions = useMemo(() => projects.map((project) => ({ id: project.id, name: project.name })), [projects]);
  const projectsById = useMemo(() => new Map(projects.map((project) => [project.id, project.name])), [projects]);
  const categoryTagsById = useMemo(() => new Map(categoryTags.map((categoryTag) => [categoryTag.id, categoryTag.name])), [categoryTags]);
  const memberOptions = useMemo(() => users.map((user) => ({ id: user.id, name: user.name })), [users]);

  const handleDownloadCsv = useCallback(
    async ({ from, to, projectId, groupBy, allMembers }) => {
      try {
        const { blob, filename } = await api.exportTimeEntries(
          {
            from: from.toISOString(),
            to: to.toISOString(),
            projectId,
            groupBy,
            allMembers,
          },
          { Authorization: `Bearer ${accessToken}` },
        );
        triggerDownload(blob, filename);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    },
    [accessToken],
  );

  const handlePrintSummary = useCallback(() => {}, []);

  const handlePrintInvoice = useCallback((params) => setInvoiceParams(params), []);

  const handleCloseInvoice = useCallback(() => setInvoiceParams(null), []);

  if (!isAdmin) {
    return null;
  }

  const gridTemplateColumns = `minmax(180px, 240px) repeat(${days.length}, ${viewMode === 'week' ? '1fr' : '64px'}) 90px`;

  return (
    <div className={s.wrapper}>
      <div className={s.pageHeader}>
        <div className={s.pageHeaderRow}>
          <div className={s.pageHeaderTitles}>
            <TimesheetHeaderTabs isAdmin={isAdmin} active="team" />
            <p className={s.pageDescription}>{t('common.teamTimesheetsDescription')}</p>
          </div>
          <div className={s.timezoneField}>
            <span className={s.timezoneFieldLabel}>{t('common.timezone', { context: 'title' })}:</span>
            <Dropdown
              style={DropdownStyle.Default}
              options={timeZoneOptions}
              defaultItem={timeZoneOptions.find((option) => option.id === (timezone || 'browser-default'))}
              placeholder={t('common.timezone', { context: 'title' })}
              onChange={(item) => onTimezoneChange(item.id === 'browser-default' ? null : item.id)}
              isSearchable
              selectFirstOnSearch
              className={s.timezoneDropdown}
            />
          </div>
        </div>
      </div>
      <div className={s.toolbar}>
        <Dropdown
          style={DropdownStyle.Default}
          options={viewModeOptions}
          defaultItem={viewModeOptions.find((option) => option.id === viewMode)}
          placeholder={t('common.weeklyTimesheets')}
          onChange={(item) => handleViewModeChange(item.id)}
          className={s.viewModeDropdown}
        />
        <PeriodNav mode={viewMode} zonedPeriodStart={zonedPeriodStart} zonedNow={zonedNow} onPrev={handlePrev} onNext={handleNext} onToday={handleToday} onSelect={handleSelectPeriod} />
        <div className={s.toolbarDivider} />
        <Input style={InputStyle.Default} value={query} placeholder={t('common.searchMembers')} onChange={(e) => setQuery(e.target.value)} className={s.searchInput} />
        <div className={s.hideEmptyRow}>
          <Checkbox checked={hideEmpty} onChange={() => setHideEmpty((prev) => !prev)} />
          <span>{t('common.hideMembersWithNoTime')}</span>
        </div>
        <div className={s.spacer} />
        <ExportPopup projects={projectOptions} isAdmin members={memberOptions} onDownloadCsv={handleDownloadCsv} onPrintSummary={handlePrintSummary} onPrintInvoice={handlePrintInvoice}>
          <Button style={ButtonStyle.DefaultBorder} content={t('common.export')} />
        </ExportPopup>
      </div>
      <div className={s.content}>
        {overview.isFetching && overview.items.length === 0 ? (
          <div className={s.loaderWrapper}>
            <Loader size={LoaderSize.Normal} />
          </div>
        ) : (
          <div className={s.tableScroll}>
            <div className={s.grid} style={{ gridTemplateColumns }}>
              <div className={clsx(s.headerCell, s.cornerCell)} />
              {days.map((day, dayIndex) => (
                <div key={day.toISOString()} className={clsx(s.headerCell, s.dayHeaderCell, dayIndex % 2 === 1 && s.dayHeaderCellAlt, isSameDay(day, zonedNow) && s.today, isWeekend(day) && s.weekend)}>
                  <span className={s.dayHeaderName}>{format(day, viewMode === 'week' ? 'EEE' : 'EEEEE')}</span>
                  <span className={s.dayHeaderDate}>{format(day, 'd')}</span>
                </div>
              ))}
              <div className={clsx(s.headerCell, s.totalHeaderCell)}>{t('common.total')}</div>

              {rows.map((row) => (
                <React.Fragment key={row.user.id}>
                  {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
                  <div className={clsx(s.memberCell)} onClick={() => handleMemberClick(row.user.id)}>
                    <User name={row.user.name} avatarUrl={row.user.avatarUrl} size="small" />
                    <span className={s.memberName}>{row.user.name}</span>
                  </div>
                  {days.map((day, dayIndex) => {
                    const dayKey = format(day, 'yyyy-MM-dd');
                    const minutes = row.days[dayKey];
                    return (
                      // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
                      <div
                        key={dayKey}
                        className={clsx(s.dayCell, dayIndex % 2 === 1 && s.dayCellAlt, isSameDay(day, zonedNow) && s.today, isWeekend(day) && s.weekend, minutes && s.dayCellClickable)}
                        onClick={minutes ? () => handleDayClick(row.user.id, day) : undefined}
                      >
                        {minutes ? formatDuration(minutes) : <span className={s.emptyDash}>–</span>}
                      </div>
                    );
                  })}
                  <div className={s.totalCell}>{row.totalMinutes > 0 ? formatDuration(row.totalMinutes) : <span className={s.emptyDash}>–</span>}</div>
                </React.Fragment>
              ))}
            </div>
            {rows.length === 0 && <div className={s.empty}>{t('common.noMembersFound')}</div>}
          </div>
        )}
      </div>
      {invoiceParams && (
        <InvoicePrint
          params={invoiceParams}
          viewedUserId={invoiceParams.userId}
          viewedUserName={invoiceParams.userName}
          timeEntries={timeEntries}
          projectsById={projectsById}
          categoryTagsById={categoryTagsById}
          onFetch={onFetchTimeEntries}
          onClose={handleCloseInvoice}
        />
      )}
    </div>
  );
});

TeamOverview.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  users: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  overview: PropTypes.shape({
    isFetching: PropTypes.bool.isRequired,
    items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    error: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  }).isRequired,
  projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  timeEntries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  categoryTags: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  accessToken: PropTypes.string,
  timezone: PropTypes.string,
  onFetch: PropTypes.func.isRequired,
  onFetchTimeEntries: PropTypes.func.isRequired,
  onFetchCategoryTags: PropTypes.func.isRequired,
  onTimezoneChange: PropTypes.func.isRequired,
};

TeamOverview.defaultProps = {
  accessToken: undefined,
  timezone: undefined,
};

export default TeamOverview;
