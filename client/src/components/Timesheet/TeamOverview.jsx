import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import clsx from 'clsx';
import { addMonths, addWeeks, eachDayOfInterval, endOfMonth, format, isSameDay, isWeekend, startOfMonth, startOfWeek, subDays } from 'date-fns';
import PropTypes from 'prop-types';

import api from '../../api';
import Paths from '../../constants/Paths';
import formatDuration from '../../utils/format-duration';
import triggerDownload from '../../utils/trigger-download';
import User from '../User';
import { Button, ButtonStyle, Checkbox, Dropdown, DropdownStyle, Icon, IconType, IconSize, Input, InputStyle, Loader, LoaderSize } from '../Utils';
import ExportPopup from './ExportPopup';
import InvoicePrint from './InvoicePrint';

import * as s from './TeamOverview.module.scss';

const VIEW_MODES = ['week', 'month'];

const anchorForMode = (mode, date) => (mode === 'week' ? startOfWeek(date, { weekStartsOn: 1 }) : startOfMonth(date));

const TeamOverview = React.memo(({ isAdmin, users, overview, projects, timeEntries, categoryTags, accessToken, onFetch, onFetchTimeEntries, onFetchCategoryTags }) => {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState('week');
  const [periodStart, setPeriodStart] = useState(() => anchorForMode('week', new Date()));
  const [query, setQuery] = useState('');
  const [hideEmpty, setHideEmpty] = useState(false);
  const [invoiceParams, setInvoiceParams] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate(Paths.TIMESHEET);
    }
  }, [isAdmin, navigate]);

  const periodEnd = useMemo(() => (viewMode === 'week' ? addWeeks(periodStart, 1) : endOfMonth(periodStart)), [viewMode, periodStart]);

  useEffect(() => {
    if (isAdmin) {
      onFetch({ from: periodStart, to: viewMode === 'week' ? periodEnd : addMonths(periodStart, 1) });
    }
  }, [isAdmin, periodStart, periodEnd, viewMode, onFetch]);

  useEffect(() => {
    if (isAdmin) {
      onFetchCategoryTags();
    }
  }, [isAdmin, onFetchCategoryTags]);

  const days = useMemo(() => eachDayOfInterval({ start: periodStart, end: viewMode === 'week' ? subDays(periodEnd, 1) : periodEnd }), [periodStart, periodEnd, viewMode]);

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

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
    setPeriodStart((prev) => anchorForMode(mode, prev));
  }, []);

  const handlePrev = useCallback(() => {
    setPeriodStart((prev) => (viewMode === 'week' ? addWeeks(prev, -1) : addMonths(prev, -1)));
  }, [viewMode]);

  const handleNext = useCallback(() => {
    setPeriodStart((prev) => (viewMode === 'week' ? addWeeks(prev, 1) : addMonths(prev, 1)));
  }, [viewMode]);

  const handleToday = useCallback(() => {
    setPeriodStart(anchorForMode(viewMode, new Date()));
  }, [viewMode]);

  const handleMemberClick = useCallback(
    (userId) => {
      const weekStart = viewMode === 'week' ? periodStart : startOfWeek(new Date(), { weekStartsOn: 1 });
      navigate(Paths.TIMESHEET, { state: { viewedUserId: userId, weekStart: weekStart.toISOString() } });
    },
    [navigate, viewMode, periodStart],
  );

  const handleDayClick = useCallback(
    (userId, day) => {
      navigate(Paths.TIMESHEET, { state: { viewedUserId: userId, weekStart: startOfWeek(day, { weekStartsOn: 1 }).toISOString() } });
    },
    [navigate],
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

  const periodLabel = viewMode === 'week' ? `${format(periodStart, 'MMM d')} – ${format(subDays(periodEnd, 1), 'MMM d, yyyy')}` : format(periodStart, 'MMMM yyyy');

  const gridTemplateColumns = `minmax(180px, 240px) repeat(${days.length}, ${viewMode === 'week' ? '1fr' : '64px'}) 90px`;

  return (
    <div className={s.wrapper}>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>{t('common.teamTimesheets')}</h1>
        <p className={s.pageDescription}>{t('common.teamTimesheetsDescription')}</p>
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
        <div className={s.navGroup}>
          <Button style={ButtonStyle.Icon} title={t('action.previousPeriod')} onClick={handlePrev}>
            <Icon type={IconType.AngleLeft} size={IconSize.Size12} />
          </Button>
          <Button style={ButtonStyle.NoBackground} className={s.todayButton} onClick={handleToday}>
            {t('action.today')}
          </Button>
          <Button style={ButtonStyle.Icon} title={t('action.nextPeriod')} onClick={handleNext}>
            <Icon type={IconType.AngleLeft} size={IconSize.Size12} className={s.iconFlipped} />
          </Button>
          <span className={s.periodLabel}>{periodLabel}</span>
        </div>
        <Input style={InputStyle.Default} value={query} placeholder={t('common.searchMembers')} onChange={(e) => setQuery(e.target.value)} className={s.searchInput} />
        <div className={s.hideEmptyRow}>
          <Checkbox checked={hideEmpty} onChange={() => setHideEmpty((prev) => !prev)} />
          <span>{t('common.hideMembersWithNoTime')}</span>
        </div>
        <div className={s.spacer} />
        <Button style={ButtonStyle.NoBackground} className={s.todayButton} onClick={() => navigate(Paths.TIMESHEET)}>
          {t('common.myTimesheet')}
        </Button>
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
              {days.map((day) => (
                <div key={day.toISOString()} className={clsx(s.headerCell, s.dayHeaderCell, isSameDay(day, new Date()) && s.today, isWeekend(day) && s.weekend)}>
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
                  {days.map((day) => {
                    const dayKey = format(day, 'yyyy-MM-dd');
                    const minutes = row.days[dayKey];
                    return (
                      // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
                      <div
                        key={dayKey}
                        className={clsx(s.dayCell, isSameDay(day, new Date()) && s.today, isWeekend(day) && s.weekend, minutes && s.dayCellClickable)}
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
  onFetch: PropTypes.func.isRequired,
  onFetchTimeEntries: PropTypes.func.isRequired,
  onFetchCategoryTags: PropTypes.func.isRequired,
};

TeamOverview.defaultProps = {
  accessToken: undefined,
};

export default TeamOverview;
