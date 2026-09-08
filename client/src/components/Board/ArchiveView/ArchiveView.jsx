import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { format, differenceInCalendarDays, startOfMonth } from 'date-fns';
import groupBy from 'lodash/groupBy';
import keyBy from 'lodash/keyBy';
import PropTypes from 'prop-types';

import api from '../../../api';
import { getPriority } from '../../../constants/Priorities';
import { getAccessToken } from '../../../utils/access-token-storage';
import Label from '../../Label';
import Priority from '../../Priority';
import { Button, ButtonStyle, Dropdown, DropdownStyle, Icon, IconType, IconSize } from '../../Utils';

import * as gs from '../../../global.module.scss';
import * as s from './ArchiveView.module.scss';

const GROUP_BY_OPTIONS = ['month', 'label', 'assignee', 'priority'];

// §6.4: no grouping/filtering query params on the server — the same predicate-matched set is
// fetched once and grouped/filtered client-side here, mirroring the approved mockup's
// renderArchive(). Cycle time is a proxy (createdAt → completedAt), not a true
// first-entered-an-active-list timestamp — this app doesn't track list-transition history.
function ArchiveView({ boardId, allLabels, canEdit, onRestore }) {
  const [t] = useTranslation();
  const [items, setItems] = useState([]);
  const [included, setIncluded] = useState({ cardLabels: [], labels: [], cardMemberships: [], users: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [groupByField, setGroupByField] = useState('month');
  const [selectedLabelIds, setSelectedLabelIds] = useState([]);
  const [closedGroups, setClosedGroups] = useState({});
  const [moveFromListId, setMoveFromListId] = useState(null);
  const [moveToListId, setMoveToListId] = useState(null);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    if (!boardId) return undefined;
    let cancelled = false;
    setIsLoading(true);
    api
      .getBoardArchivedCards(boardId, { Authorization: `Bearer ${getAccessToken()}` })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items || []);
        setIncluded(res.included || {});
      })
      .catch((error) => {
        if (cancelled) return;
        // eslint-disable-next-line no-console
        console.error(`Failed to load archived cards for board ${boardId}:`, error);
        setItems([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [boardId]);

  const labelById = useMemo(() => keyBy(included.labels || [], 'id'), [included.labels]);
  const cardLabelsByCardId = useMemo(() => groupBy(included.cardLabels || [], 'cardId'), [included.cardLabels]);
  const userById = useMemo(() => keyBy(included.users || [], 'id'), [included.users]);
  const cardMembershipsByCardId = useMemo(() => groupBy(included.cardMemberships || [], 'cardId'), [included.cardMemberships]);
  const listById = useMemo(() => keyBy(included.lists || [], 'id'), [included.lists]);

  // archivedAt is only a fallback: a card that was completed in June and manually archived in
  // September belongs under June, which is the month the work actually finished in.
  const enrichedItems = useMemo(
    () =>
      items
        .map((card) => ({
          ...card,
          cardLabels: (cardLabelsByCardId[card.id] || []).map((cardLabel) => labelById[cardLabel.labelId]).filter(Boolean),
          cardUsers: (cardMembershipsByCardId[card.id] || []).map((cardMembership) => userById[cardMembership.userId]).filter(Boolean),
          cycleDays: card.completedAt && card.createdAt ? Math.max(0, differenceInCalendarDays(card.completedAt, card.createdAt)) : null,
          archivedFrom: listById[card.listId] ? listById[card.listId].name : t('common.deletedList'),
          archivedOn: card.completedAt || card.archivedAt || card.createdAt || new Date(),
        }))
        .sort((cardA, cardB) => cardB.archivedOn - cardA.archivedOn),
    [items, cardLabelsByCardId, labelById, cardMembershipsByCardId, userById, listById, t],
  );

  const filteredItems = useMemo(() => {
    if (selectedLabelIds.length === 0) return enrichedItems;
    return enrichedItems.filter((card) => card.cardLabels.some((label) => selectedLabelIds.includes(label.id)));
  }, [enrichedItems, selectedLabelIds]);

  // One group per month, newest first, so scrolling the archive walks backwards through time.
  // The other groupings have no natural order, so they stay sorted by size as before.
  const groups = useMemo(() => {
    const map = new Map();
    const monthOrder = new Map();

    filteredItems.forEach((card) => {
      let keys;
      if (groupByField === 'label') {
        keys = card.cardLabels.length > 0 ? card.cardLabels.map((label) => label.name) : [t('common.noLabels')];
      } else if (groupByField === 'assignee') {
        keys = card.cardUsers.length > 0 ? card.cardUsers.map((user) => user.name) : [t('common.unassigned')];
      } else if (groupByField === 'priority') {
        const priority = getPriority(card.priority);
        keys = [priority ? priority.name : t('common.none')];
      } else {
        const key = format(card.archivedOn, 'MMMM yyyy');
        monthOrder.set(key, startOfMonth(card.archivedOn).getTime());
        keys = [key];
      }
      keys.forEach((key) => {
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(card);
      });
    });

    const entries = Array.from(map.entries());

    if (groupByField === 'month') {
      return entries
        .sort(([keyA], [keyB]) => monthOrder.get(keyB) - monthOrder.get(keyA))
        .map(([key, cards]) => {
          // Sub-headings only earn their space when a month actually spans more than one
          // source column — after the Done lists are consolidated, months read as flat lists.
          const byList = groupBy(cards, 'archivedFrom');
          const listNames = Object.keys(byList);

          return [key, cards, listNames.length > 1 ? listNames.sort().map((listName) => [listName, byList[listName]]) : null];
        });
    }

    return entries.sort(([, cardsA], [, cardsB]) => cardsB.length - cardsA.length || 0).map(([key, cards]) => [key, cards, null]);
  }, [filteredItems, groupByField, t]);

  const stats = useMemo(() => {
    const now = new Date();
    const completedThisMonth = enrichedItems.filter((card) => card.completedAt && card.completedAt.getMonth() === now.getMonth() && card.completedAt.getFullYear() === now.getFullYear()).length;
    const cycleDaysValues = enrichedItems.map((card) => card.cycleDays).filter((value) => value != null);
    const avgCycleDays = cycleDaysValues.length > 0 ? cycleDaysValues.reduce((sum, value) => sum + value, 0) / cycleDaysValues.length : null;

    return {
      total: enrichedItems.length,
      completedThisMonth,
      avgCycleDays,
    };
  }, [enrichedItems]);

  const toggleGroup = (key) => {
    setClosedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // The card goes back to the board through the store (the unarchive saga upserts it); this
  // listing is a one-shot fetch, so the restored row is dropped from it locally.
  const handleRestore = (cardId) => {
    onRestore(cardId);
    setItems((prev) => prev.filter((card) => card.id !== cardId));
  };

  // Source columns are derived from the archived cards themselves, not from the board's current
  // columns: a column that was already deleted still shows up here, which is how cards orphaned
  // by an earlier delete get re-homed.
  const moveSources = useMemo(() => {
    const countsByListId = new Map();
    enrichedItems.forEach((card) => {
      countsByListId.set(card.listId, (countsByListId.get(card.listId) || 0) + 1);
    });

    return Array.from(countsByListId.entries())
      .map(([listId, count]) => ({
        id: listId,
        name: `${listById[listId] ? listById[listId].name : t('common.deletedList')} (${count})`,
        count,
      }))
      .sort((sourceA, sourceB) => sourceB.count - sourceA.count);
  }, [enrichedItems, listById, t]);

  const moveDestinations = useMemo(() => (included.lists || []).map((list) => ({ id: list.id, name: list.name })), [included.lists]);

  const selectedMoveSource = moveSources.find((source) => source.id === moveFromListId) || null;
  const selectedMoveDestination = moveDestinations.find((list) => list.id === moveToListId) || null;
  const canMove = !!selectedMoveSource && !!selectedMoveDestination && moveFromListId !== moveToListId && !isMoving;

  // The moved cards stay archived, so they stay in this listing — only the column they report
  // changes. Patching them in place keeps the scroll position and avoids a second round trip.
  const handleMoveArchivedCards = () => {
    if (!canMove) return;
    setIsMoving(true);
    api
      .moveBoardArchivedCards(boardId, { fromListId: moveFromListId, toListId: moveToListId }, { Authorization: `Bearer ${getAccessToken()}` })
      .then(() => {
        setItems((prev) => prev.map((card) => (card.listId === moveFromListId ? { ...card, listId: moveToListId } : card)));
        setMoveFromListId(null);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(`Failed to move archived cards on board ${boardId}:`, error);
      })
      .finally(() => {
        setIsMoving(false);
      });
  };

  const renderRow = (card) => (
    <div key={card.id} className={s.row}>
      <span className={s.rowName}>{card.name}</span>
      <span className={s.rowChips}>
        {card.priority && <Priority name={getPriority(card.priority)?.name} color={getPriority(card.priority)?.color} variant="card" />}
        {card.cardLabels.slice(0, 1).map((label) => (
          <Label key={label.id} name={label.name} color={label.color} variant="card" />
        ))}
      </span>
      <span className={s.rowAssignee}>{card.cardUsers.length > 0 ? card.cardUsers[0].name : '—'}</span>
      <span className={clsx(s.rowDate, gs.fontMono)}>{format(card.archivedOn, 'MMM dd')}</span>
      <span className={clsx(s.rowCycle, gs.fontMono)}>{card.cycleDays != null ? `${card.cycleDays}d` : '—'}</span>
      {canEdit && (
        <Button style={ButtonStyle.Icon} title={t('action.restoreCard', { context: 'title' })} onClick={() => handleRestore(card.id)} className={s.rowRestore}>
          <Icon type={IconType.ArrowLeftBig} size={IconSize.Size13} />
        </Button>
      )}
    </div>
  );

  const toggleLabelFilter = (labelId) => {
    setSelectedLabelIds((prev) => (prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]));
  };

  return (
    <div className={s.wrapper}>
      <aside className={s.rail}>
        <div className={s.filterBlock}>
          <h3>{t('common.groupBy')}</h3>
          <div className={s.segmented}>
            {GROUP_BY_OPTIONS.map((option) => (
              <button key={option} type="button" className={clsx(s.segmentedOption, groupByField === option && s.segmentedOptionActive)} onClick={() => setGroupByField(option)}>
                {t(`common.archiveGroupBy${option.charAt(0).toUpperCase()}${option.slice(1)}`)}
              </button>
            ))}
          </div>
        </div>
        {canEdit && moveSources.length > 0 && moveDestinations.length > 0 && (
          <div className={s.filterBlock}>
            <h3>{t('common.moveArchivedCards')}</h3>
            <p className={s.blockHint}>{t('common.moveArchivedCardsHint')}</p>
            <Dropdown
              style={DropdownStyle.Default}
              name="fromListId"
              options={moveSources}
              placeholder={t('common.selectSourceList')}
              defaultItem={selectedMoveSource}
              onChange={(e) => setMoveFromListId(e.target.value)}
              returnOnChangeEvent
              isSearchable
              selectFirstOnSearch
            />
            <Dropdown
              style={DropdownStyle.Default}
              name="toListId"
              options={moveDestinations}
              placeholder={t('common.selectDestinationList')}
              defaultItem={selectedMoveDestination}
              onChange={(e) => setMoveToListId(e.target.value)}
              returnOnChangeEvent
              isSearchable
              selectFirstOnSearch
            />
            <Button
              style={ButtonStyle.Submit}
              content={selectedMoveSource ? t('action.moveArchivedCards', { count: selectedMoveSource.count }) : t('action.move')}
              disabled={!canMove}
              onClick={handleMoveArchivedCards}
              className={s.moveButton}
            />
          </div>
        )}
        {allLabels.length > 0 && (
          <div className={s.filterBlock}>
            <h3>{t('common.labels')}</h3>
            <div className={s.filterChipList}>
              {allLabels.map((label) => (
                <button key={label.id} type="button" className={clsx(s.filterChip, selectedLabelIds.includes(label.id) && s.filterChipActive)} onClick={() => toggleLabelFilter(label.id)}>
                  {label.name || t('common.unnamed')}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>

      <div className={s.main}>
        <div className={s.statStrip}>
          <div className={s.stat}>
            <span className={clsx(s.statNum, gs.fontMono)}>{stats.total}</span>
            <span className={s.statLabel}>{t('common.totalArchived')}</span>
          </div>
          <div className={s.stat}>
            <span className={clsx(s.statNum, s.statNumAccent, gs.fontMono)}>{stats.completedThisMonth}</span>
            <span className={s.statLabel}>{t('common.completedThisMonth')}</span>
          </div>
          <div className={s.stat}>
            <span className={clsx(s.statNum, gs.fontMono)}>{stats.avgCycleDays != null ? `${stats.avgCycleDays.toFixed(1)}d` : '—'}</span>
            <span className={s.statLabel}>{t('common.avgCycleTime')}</span>
          </div>
        </div>

        <div className={s.list}>
          {!isLoading && groups.length === 0 && <div className={s.emptyState}>{t('common.noArchivedCards')}</div>}
          {groups.map(([key, cards, subGroups]) => {
            const isOpen = !closedGroups[key];
            return (
              <div key={key} className={s.group}>
                <button type="button" className={s.groupHead} onClick={() => toggleGroup(key)}>
                  <Icon type={IconType.ArrowDown} size={IconSize.Size8} className={clsx(s.groupChev, !isOpen && s.groupChevClosed)} />
                  <span className={s.groupName}>{key}</span>
                  <span className={clsx(s.groupCount, gs.fontMono)}>{cards.length}</span>
                </button>
                {isOpen && (
                  <div className={s.groupRows}>
                    {subGroups
                      ? subGroups.map(([listName, listCards]) => (
                          <React.Fragment key={listName}>
                            <div className={s.subGroupHead}>
                              <span className={s.subGroupName}>{listName}</span>
                              <span className={clsx(s.subGroupCount, gs.fontMono)}>{listCards.length}</span>
                            </div>
                            {listCards.map(renderRow)}
                          </React.Fragment>
                        ))
                      : cards.map(renderRow)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

ArchiveView.propTypes = {
  boardId: PropTypes.string.isRequired,
  allLabels: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  onRestore: PropTypes.func.isRequired,
};

ArchiveView.defaultProps = {
  allLabels: [],
};

export default ArchiveView;
