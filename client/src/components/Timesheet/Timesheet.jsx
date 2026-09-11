import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router';
import { addDays, addWeeks, startOfDay, startOfWeek } from 'date-fns';
import PropTypes from 'prop-types';

import api from '../../api';
import { getBoardAccentColor } from '../../utils/board-colors';
import formatDuration from '../../utils/format-duration';
import { getEffectiveTimeZone, getSupportedTimeZones, getTimeZoneLabel, utcToZonedTime, zonedTimeToUtc } from '../../utils/timezone';
import triggerDownload from '../../utils/trigger-download';
import getWeeklyCapacity from '../../utils/weekly-capacity';
import { Button, ButtonStyle, Dropdown, DropdownStyle, Icon, IconType, IconSize } from '../Utils';
import EntryPopup from './EntryPopup';
import ExportPopup from './ExportPopup';
import ImportPopup from './ImportPopup';
import InvoicePrint from './InvoicePrint';
import PeriodNav from './PeriodNav';
import PrintSummary from './PrintSummary';
import TimesheetHeaderTabs from './TimesheetHeaderTabs';
import WeekGrid from './WeekGrid';

import * as s from './Timesheet.module.scss';

const computeWeekStartForToday = (timeZone) => zonedTimeToUtc(startOfWeek(utcToZonedTime(new Date(), timeZone), { weekStartsOn: 1 }), timeZone);

const Timesheet = React.memo(
  ({
    currentUserId,
    isAdmin,
    users,
    timeEntries,
    projects,
    assignedCards,
    allCards,
    categoryTags,
    accessToken,
    timezone,
    weeklyHours,
    timeEntriesError,
    onFetch,
    onCreate,
    onUpdate,
    onDelete,
    onFetchCategoryTags,
    onCreateCategoryTag,
    onTimezoneChange,
  }) => {
    const [t] = useTranslation();
    const location = useLocation();
    // ?week=<yyyy-mm-dd>&card=<id> so a jump from a card's hours chip survives a
    // reload and can be pasted to someone. location.state still works and takes
    // second place; neither is required.
    const [searchParams, setSearchParams] = useSearchParams();
    const effectiveTimeZone = getEffectiveTimeZone(timezone);
    const [errorBannerMessage, setErrorBannerMessage] = useState(null);
    const [weekStart, setWeekStart] = useState(() => {
      const weekParam = searchParams.get('week');
      const seed = weekParam || (location.state && location.state.weekStart);
      if (seed) {
        // A bare yyyy-mm-dd parses as UTC midnight, which in a negative-offset
        // zone lands on the previous day and therefore the previous week. Pin it
        // to local midnight so ?week=2026-09-07 means that Monday everywhere.
        const parsed = new Date(/^\d{4}-\d{2}-\d{2}$/.test(seed) ? `${seed}T00:00:00` : seed);
        if (!Number.isNaN(parsed.getTime())) {
          return zonedTimeToUtc(startOfWeek(utcToZonedTime(parsed, effectiveTimeZone), { weekStartsOn: 1 }), effectiveTimeZone);
        }
      }
      return computeWeekStartForToday(effectiveTimeZone);
    });
    const scopedCardId = searchParams.get('card');

    const handleClearCardScope = useCallback(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('card');
          return next;
        },
        { replace: true },
      );
    }, [setSearchParams]);
    const [popup, setPopup] = useState(null);
    const [selectedViewedUserId, setSelectedViewedUserId] = useState(() => (location.state && location.state.viewedUserId) || null);
    const [printRange, setPrintRange] = useState(null);
    const [invoiceParams, setInvoiceParams] = useState(null);

    const viewedUserId = isAdmin && selectedViewedUserId ? selectedViewedUserId : currentUserId;
    const isViewingOther = viewedUserId !== currentUserId;
    const weekEnd = useMemo(() => zonedTimeToUtc(addDays(utcToZonedTime(weekStart, effectiveTimeZone), 7), effectiveTimeZone), [weekStart, effectiveTimeZone]);
    const zonedWeekStart = useMemo(() => utcToZonedTime(weekStart, effectiveTimeZone), [weekStart, effectiveTimeZone]);
    const zonedNow = useMemo(() => utcToZonedTime(new Date(), effectiveTimeZone), [effectiveTimeZone]);

    const handlePrevWeek = useCallback(() => setWeekStart((prev) => zonedTimeToUtc(addWeeks(utcToZonedTime(prev, effectiveTimeZone), -1), effectiveTimeZone)), [effectiveTimeZone]);
    const handleNextWeek = useCallback(() => setWeekStart((prev) => zonedTimeToUtc(addWeeks(utcToZonedTime(prev, effectiveTimeZone), 1), effectiveTimeZone)), [effectiveTimeZone]);
    const handleTodayWeek = useCallback(() => setWeekStart(computeWeekStartForToday(effectiveTimeZone)), [effectiveTimeZone]);

    const handleSelectWeek = useCallback((zonedDate) => setWeekStart(zonedTimeToUtc(startOfWeek(zonedDate, { weekStartsOn: 1 }), effectiveTimeZone)), [effectiveTimeZone]);
    const timeZoneOptions = useMemo(
      () => [{ id: 'browser-default', name: `${t('common.browserDefault')} (${getEffectiveTimeZone(null)})` }, ...getSupportedTimeZones().map((zone) => ({ id: zone, name: getTimeZoneLabel(zone) }))],
      [t],
    );

    useEffect(() => {
      if (viewedUserId) {
        onFetch({ userId: viewedUserId, from: weekStart, to: weekEnd, subscribe: true });
      }
    }, [viewedUserId, weekStart, weekEnd, onFetch]);

    useEffect(() => {
      onFetchCategoryTags();
    }, [onFetchCategoryTags]);

    // ui.timeEntries.error (see reducers/ui/time-entries.js) holds only the most recent
    // create/update/delete failure and is cleared as soon as the next attempt starts, so any
    // change here is a fresh failure to surface — creates/updates/deletes are otherwise fired
    // optimistically with no other feedback path (e.g. an overlap conflict would otherwise fail
    // silently: the popup already closed and, for creates, the optimistic entry just vanishes).
    useEffect(() => {
      if (!timeEntriesError) {
        return undefined;
      }

      setErrorBannerMessage(timeEntriesError.message || t('common.timeEntrySaveFailed'));
      const timeoutId = setTimeout(() => setErrorBannerMessage(null), 6000);

      return () => clearTimeout(timeoutId);
    }, [timeEntriesError, t]);

    const handleDismissErrorBanner = useCallback(() => setErrorBannerMessage(null), []);

    // Jump here from a card's "+" (Time) button with a precreated entry ready to adjust — see
    // CardModalContainer's onCreateTimeEntry. Runs once per mount, matching the weekStart/
    // viewedUserId lazy-init pattern above for the same location.state.
    useEffect(() => {
      const createEntry = location.state && location.state.createEntry;
      if (!createEntry) {
        return;
      }

      const startedAt = utcToZonedTime(new Date(), effectiveTimeZone);
      startedAt.setSeconds(0, 0);
      startedAt.setMinutes(startedAt.getMinutes() - (startedAt.getMinutes() % 15));
      const endedAt = new Date(startedAt.getTime() + 30 * 60000);

      setPopup({
        mode: 'create',
        anchorRect: { top: 120, left: Math.max(0, window.innerWidth / 2 - 150), width: 300, height: 0 },
        initialValues: {
          title: '',
          cardName: createEntry.cardName || null,
          description: '',
          startedAt,
          endedAt,
          projectId: createEntry.projectId || null,
          boardId: createEntry.boardId || null,
          listId: createEntry.listId || null,
          cardId: createEntry.cardId || null,
        },
        entryId: null,
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const usersById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);
    const switcherOptions = useMemo(() => users.map((user) => ({ id: user.id, name: user.id === currentUserId ? t('common.me') : user.name })), [users, currentUserId, t]);
    const viewedUser = usersById.get(viewedUserId);

    // Keep boards attached — the ticket picker needs each project's board ids to fetch card
    // summaries on demand, since it can't rely on boards the user hasn't opened being cached.
    const projectOptions = useMemo(() => projects.map((project) => ({ id: project.id, name: project.name, boards: project.boards })), [projects]);
    const projectsById = useMemo(() => new Map(projects.map((project) => [project.id, project.name])), [projects]);
    const cardsById = useMemo(() => {
      const map = new Map();
      assignedCards.forEach((card) => map.set(card.id, card));
      allCards.forEach((card) => map.set(card.id, card));
      return map;
    }, [assignedCards, allCards]);
    const categoryTagsById = useMemo(() => new Map(categoryTags.map((categoryTag) => [categoryTag.id, categoryTag.name])), [categoryTags]);

    // WeekGrid (and everything downstream of a click into it — EntryPopup, etc.) works purely off
    // Date getters (getHours, startOfDay, ...), which always read the *browser's* local time. To
    // support a timezone override, entries handed to it carry "fake-local" dates — real instants
    // shifted so their local getters read as the wall-clock time in effectiveTimeZone — via
    // utcToZonedTime. They're converted back to real instants (zonedTimeToUtc) wherever this
    // component dispatches a save/move/resize.
    const weekEntries = useMemo(
      () =>
        timeEntries
          // The grid attributes a block's full duration to its start day. The API fetches all
          // overlapping entries, so constrain the displayed week by start time to keep its total
          // (and remaining capacity) aligned with the blocks and day totals the user can see.
          .filter((timeEntry) => timeEntry.userId === viewedUserId && timeEntry.startedAt >= weekStart && timeEntry.startedAt < weekEnd)
          .map((timeEntry) => ({
            ...timeEntry,
            startedAt: utcToZonedTime(timeEntry.startedAt, effectiveTimeZone),
            endedAt: utcToZonedTime(timeEntry.endedAt, effectiveTimeZone),
            projectName: timeEntry.projectId ? projectsById.get(timeEntry.projectId) : null,
            projectColor: timeEntry.projectId ? getBoardAccentColor(timeEntry.projectId) : null,
            cardName: timeEntry.cardId && cardsById.has(timeEntry.cardId) ? cardsById.get(timeEntry.cardId).name : null,
          }))
          .sort((a, b) => a.startedAt - b.startedAt),
      [timeEntries, viewedUserId, weekStart, weekEnd, projectsById, cardsById, effectiveTimeZone],
    );

    const scopedEntries = useMemo(() => (scopedCardId ? weekEntries.filter((entry) => `${entry.cardId}` === scopedCardId) : []), [scopedCardId, weekEntries]);
    const scopedCardName = scopedEntries.length > 0 ? scopedEntries[0].cardName : null;
    const scopedTotalMinutes = scopedEntries.reduce((sum, entry) => sum + Math.round((entry.endedAt.getTime() - entry.startedAt.getTime()) / 60000), 0);

    const weekTotalMinutes = useMemo(() => weekEntries.reduce((sum, entry) => sum + Math.round((entry.endedAt.getTime() - entry.startedAt.getTime()) / 60000), 0), [weekEntries]);
    const weeklyCapacity = useMemo(() => getWeeklyCapacity(weeklyHours, weekTotalMinutes), [weeklyHours, weekTotalMinutes]);

    const handleClosePopup = useCallback(() => setPopup(null), []);

    const handleCreate = useCallback(({ startedAt, endedAt, anchorRect }) => {
      setPopup({ mode: 'create', anchorRect, initialValues: { title: '', description: '', startedAt, endedAt, projectId: null, cardId: null }, entryId: null });
    }, []);

    const handleEntryClick = useCallback(
      (entry, entryRect) => {
        const loggedByUser = entry.createdById && entry.createdById !== entry.userId ? usersById.get(entry.createdById) : null;

        setPopup({
          mode: 'edit',
          anchorRect: { top: entryRect.top, left: entryRect.left, width: entryRect.width, height: entryRect.height },
          initialValues: {
            title: entry.title,
            cardName: entry.cardName,
            description: entry.description,
            startedAt: entry.startedAt,
            endedAt: entry.endedAt,
            projectId: entry.projectId,
            cardId: entry.cardId,
            categoryTagId: entry.categoryTagId,
          },
          entryId: entry.id,
          loggedByName: loggedByUser ? loggedByUser.name : null,
        });
      },
      [usersById],
    );

    const handleMove = useCallback(
      (entry, newStartedAt, newEndedAt) => {
        onUpdate(entry.id, { startedAt: zonedTimeToUtc(newStartedAt, effectiveTimeZone), endedAt: zonedTimeToUtc(newEndedAt, effectiveTimeZone) });
      },
      [onUpdate, effectiveTimeZone],
    );

    const handleResize = useCallback(
      (entry, newStartedAt, newEndedAt) => {
        onUpdate(entry.id, { startedAt: zonedTimeToUtc(newStartedAt, effectiveTimeZone), endedAt: zonedTimeToUtc(newEndedAt, effectiveTimeZone) });
      },
      [onUpdate, effectiveTimeZone],
    );

    const handleSave = useCallback(
      (values) => {
        if (!popup) {
          return;
        }

        const startedAt = zonedTimeToUtc(values.startedAt, effectiveTimeZone);
        const endedAt = zonedTimeToUtc(values.endedAt, effectiveTimeZone);

        if (popup.mode === 'create') {
          const payload = {
            title: values.title,
            description: values.description,
            categoryTagId: values.categoryTagId,
            startedAt,
            endedAt,
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
            title: values.title,
            description: values.description,
            categoryTagId: values.categoryTagId,
            startedAt,
            endedAt,
            projectId: values.projectId,
            cardId: values.cardId,
          });
        }

        setPopup(null);
      },
      [popup, viewedUserId, onCreate, onUpdate, effectiveTimeZone],
    );

    const handleDelete = useCallback(() => {
      if (popup && popup.entryId) {
        onDelete(popup.entryId);
      }
      setPopup(null);
    }, [popup, onDelete]);

    const handleDuplicate = useCallback(
      (values) => {
        const duration = values.endedAt.getTime() - values.startedAt.getTime();
        const newStartedAt = values.endedAt;
        const dayEnd = addDays(startOfDay(values.startedAt), 1);

        if (newStartedAt.getTime() >= dayEnd.getTime()) {
          setPopup(null);
          return;
        }

        const newEndedAt = new Date(Math.min(newStartedAt.getTime() + duration, dayEnd.getTime()));

        const payload = {
          title: values.title,
          description: values.description,
          categoryTagId: values.categoryTagId,
          startedAt: zonedTimeToUtc(newStartedAt, effectiveTimeZone),
          endedAt: zonedTimeToUtc(newEndedAt, effectiveTimeZone),
          userId: viewedUserId,
        };
        if (values.cardId) {
          payload.cardId = values.cardId;
        } else if (values.projectId) {
          payload.projectId = values.projectId;
        }
        onCreate(payload);
        setPopup(null);
      },
      [onCreate, viewedUserId, effectiveTimeZone],
    );

    const handleDownloadCsv = useCallback(
      async ({ from, to, projectId, groupBy, allMembers }) => {
        try {
          const { blob, filename } = await api.exportTimeEntries(
            {
              from: from.toISOString(),
              to: to.toISOString(),
              projectId,
              groupBy,
              userId: allMembers ? undefined : viewedUserId,
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
      [viewedUserId, accessToken],
    );

    const handlePrintSummary = useCallback(({ from, to, projectId }) => {
      setPrintRange({ from, to, projectId });
    }, []);

    const handleClosePrintSummary = useCallback(() => setPrintRange(null), []);

    const handlePrintInvoice = useCallback((params) => setInvoiceParams(params), []);

    const handleCloseInvoice = useCallback(() => setInvoiceParams(null), []);

    const handleImportComplete = useCallback(() => {
      onFetch({ userId: currentUserId, from: weekStart, to: weekEnd, subscribe: true });
    }, [onFetch, currentUserId, weekStart, weekEnd]);

    return (
      <div className={s.wrapper}>
        <div className={s.pageHeader}>
          <div className={s.pageHeaderRow}>
            <div className={s.pageHeaderTitles}>
              <TimesheetHeaderTabs isAdmin={isAdmin} active="individual" />
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
          {isViewingOther && viewedUser && <p className={s.viewingBanner}>{t('common.viewingTimesheet', { name: viewedUser.name })}</p>}
        </div>
        <div className={s.toolbar}>
          <PeriodNav zonedPeriodStart={zonedWeekStart} zonedNow={zonedNow} onPrev={handlePrevWeek} onNext={handleNextWeek} onToday={handleTodayWeek} onSelect={handleSelectWeek} />
          {isAdmin && (
            <>
              <div className={s.toolbarDivider} />
              <div className={s.memberField}>
                <Icon type={IconType.User} size={IconSize.Size12} className={s.memberFieldIcon} />
                <Dropdown
                  style={DropdownStyle.Default}
                  options={switcherOptions}
                  defaultItem={switcherOptions.find((option) => option.id === viewedUserId)}
                  placeholder={t('common.me')}
                  onChange={(item) => setSelectedViewedUserId(item.id === currentUserId ? null : item.id)}
                  className={s.switcherDropdown}
                />
              </div>
            </>
          )}
          <div className={s.spacer} />
          {isViewingOther ? (
            <span className={s.weekTotal}>{t('common.weekTotal', { duration: formatDuration(weekTotalMinutes) })}</span>
          ) : (
            <div
              className={s.weekCapacitySummary}
              aria-label={t('common.weekCapacitySummary', {
                spent: formatDuration(weekTotalMinutes),
                remaining: formatDuration(weeklyCapacity.remainingMinutes),
                capacity: formatDuration(weeklyCapacity.capacityMinutes),
              })}
              title={t('common.weekCapacitySummary', {
                spent: formatDuration(weekTotalMinutes),
                remaining: formatDuration(weeklyCapacity.remainingMinutes),
                capacity: formatDuration(weeklyCapacity.capacityMinutes),
              })}
            >
              <span className={s.weekCapacityFigures}>
                <strong className={s.weekCapacitySpent}>{formatDuration(weekTotalMinutes)}</strong>
                <span className={s.weekCapacityOf}>/ {formatDuration(weeklyCapacity.capacityMinutes)}</span>
              </span>
              <span className={s.weekCapacityBar}>
                <span
                  className={weeklyCapacity.isOverCapacity ? s.weekCapacityBarFillOver : s.weekCapacityBarFill}
                  style={{ width: `${Math.min(100, weeklyCapacity.capacityMinutes ? (weekTotalMinutes / weeklyCapacity.capacityMinutes) * 100 : 0)}%` }}
                />
              </span>
              <span className={weeklyCapacity.isOverCapacity ? s.weekCapacityExceeded : s.weekCapacityLeft}>
                {formatDuration(Math.abs(weeklyCapacity.remainingMinutes))} {weeklyCapacity.isOverCapacity ? t('common.over') : t('common.remaining')}
              </span>
            </div>
          )}
          <ImportPopup accessToken={accessToken} isAdmin={isAdmin} users={users} onImportComplete={handleImportComplete}>
            <Button style={ButtonStyle.DefaultBorder} content={t('action.import')} />
          </ImportPopup>
          <ExportPopup
            projects={projectOptions}
            isAdmin={isAdmin}
            viewedUserId={viewedUserId}
            viewedUserName={viewedUser ? viewedUser.name : undefined}
            onDownloadCsv={handleDownloadCsv}
            onPrintSummary={handlePrintSummary}
            onPrintInvoice={handlePrintInvoice}
          >
            <Button style={ButtonStyle.DefaultBorder} content={t('common.export')} />
          </ExportPopup>
        </div>
        {errorBannerMessage && (
          <div className={s.errorBanner}>
            <span>{errorBannerMessage}</span>
            <button type="button" className={s.errorBannerDismiss} onClick={handleDismissErrorBanner} title={t('common.close')}>
              <Icon type={IconType.Close} size={IconSize.Size10} />
            </button>
          </div>
        )}
        {scopedCardId && (
          <div className={s.cardScopeBar}>
            <Icon type={IconType.Attach} size={IconSize.Size13} className={s.cardScopeIcon} />
            <span>{t('common.showingTimeOnCard', { name: scopedCardName || t('common.card') })}</span>
            {scopedTotalMinutes > 0 && <span className={s.cardScopeTotal}>{formatDuration(scopedTotalMinutes)}</span>}
            <Button style={ButtonStyle.NoBackground} onClick={handleClearCardScope} className={s.cardScopeClear} content={t('action.showAllTime')} />
          </div>
        )}
        <div className={s.content}>
          <WeekGrid weekStart={zonedWeekStart} entries={weekEntries} scopedCardId={scopedCardId} onCreate={handleCreate} onMove={handleMove} onResize={handleResize} onEntryClick={handleEntryClick} />
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
            categoryTags={categoryTags}
            isAdmin={isAdmin}
            currentUserId={currentUserId}
            loggedByName={popup.loggedByName}
            onSave={handleSave}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onClose={handleClosePopup}
            onCreateCategoryTag={onCreateCategoryTag}
          />
        )}
        {printRange && (
          <PrintSummary
            range={printRange}
            viewedUserId={viewedUserId}
            viewedUserName={viewedUser ? viewedUser.name : undefined}
            timeEntries={timeEntries}
            projectsById={projectsById}
            timezone={timezone}
            onFetch={onFetch}
            onClose={handleClosePrintSummary}
          />
        )}
        {invoiceParams && (
          <InvoicePrint
            params={invoiceParams}
            viewedUserId={viewedUserId}
            viewedUserName={viewedUser ? viewedUser.name : undefined}
            timeEntries={timeEntries}
            projectsById={projectsById}
            categoryTagsById={categoryTagsById}
            onFetch={onFetch}
            onClose={handleCloseInvoice}
          />
        )}
      </div>
    );
  },
);

Timesheet.propTypes = {
  currentUserId: PropTypes.string,
  isAdmin: PropTypes.bool.isRequired,
  users: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  timeEntries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  assignedCards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allCards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  categoryTags: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  accessToken: PropTypes.string,
  timezone: PropTypes.string,
  weeklyHours: PropTypes.number.isRequired,
  timeEntriesError: PropTypes.shape({
    message: PropTypes.string,
  }),
  onFetch: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onFetchCategoryTags: PropTypes.func.isRequired,
  onCreateCategoryTag: PropTypes.func.isRequired,
  onTimezoneChange: PropTypes.func.isRequired,
};

Timesheet.defaultProps = {
  currentUserId: undefined,
  accessToken: undefined,
  timezone: undefined,
  timeEntriesError: undefined,
};

export default Timesheet;
