import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { format, differenceInCalendarDays } from 'date-fns';
import groupBy from 'lodash/groupBy';
import keyBy from 'lodash/keyBy';
import PropTypes from 'prop-types';

import api from '../../../api';
import { getPriority } from '../../../constants/Priorities';
import { getAccessToken } from '../../../utils/access-token-storage';
import Label from '../../Label';
import Priority from '../../Priority';
import { Icon, IconType, IconSize } from '../../Utils';

import * as gs from '../../../global.module.scss';
import * as s from './ArchiveView.module.scss';

const GROUP_BY_OPTIONS = ['month', 'label', 'assignee', 'priority'];

// §6.4: no grouping/filtering query params on the server — the same predicate-matched set is
// fetched once and grouped/filtered client-side here, mirroring the approved mockup's
// renderArchive(). Cycle time is a proxy (createdAt → completedAt), not a true
// first-entered-an-active-list timestamp — this app doesn't track list-transition history.
function ArchiveView({ boardId, allLabels }) {
  const [t] = useTranslation();
  const [items, setItems] = useState([]);
  const [included, setIncluded] = useState({ cardLabels: [], labels: [], cardMemberships: [], users: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [groupByField, setGroupByField] = useState('month');
  const [selectedLabelIds, setSelectedLabelIds] = useState([]);
  const [closedGroups, setClosedGroups] = useState({});

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

  const enrichedItems = useMemo(
    () =>
      items.map((card) => ({
        ...card,
        cardLabels: (cardLabelsByCardId[card.id] || []).map((cardLabel) => labelById[cardLabel.labelId]).filter(Boolean),
        cardUsers: (cardMembershipsByCardId[card.id] || []).map((cardMembership) => userById[cardMembership.userId]).filter(Boolean),
        cycleDays: card.completedAt && card.createdAt ? Math.max(0, differenceInCalendarDays(card.completedAt, card.createdAt)) : null,
      })),
    [items, cardLabelsByCardId, labelById, cardMembershipsByCardId, userById],
  );

  const filteredItems = useMemo(() => {
    if (selectedLabelIds.length === 0) return enrichedItems;
    return enrichedItems.filter((card) => card.cardLabels.some((label) => selectedLabelIds.includes(label.id)));
  }, [enrichedItems, selectedLabelIds]);

  const groups = useMemo(() => {
    const map = new Map();
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
        keys = [format(card.completedAt || card.archivedAt || new Date(), 'MMM yyyy')];
      }
      keys.forEach((key) => {
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(card);
      });
    });
    return Array.from(map.entries()).sort(([, cardsA], [, cardsB]) => cardsB.length - cardsA.length || 0);
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
          {groups.map(([key, cards]) => {
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
                    {cards.map((card) => (
                      <div key={card.id} className={s.row}>
                        <span className={s.rowName}>{card.name}</span>
                        <span className={s.rowChips}>
                          {card.priority && <Priority name={getPriority(card.priority)?.name} color={getPriority(card.priority)?.color} variant="card" />}
                          {card.cardLabels.slice(0, 1).map((label) => (
                            <Label key={label.id} name={label.name} color={label.color} variant="card" />
                          ))}
                        </span>
                        <span className={s.rowAssignee}>{card.cardUsers.length > 0 ? card.cardUsers[0].name : '—'}</span>
                        <span className={clsx(s.rowDate, gs.fontMono)}>{format(card.completedAt || card.archivedAt || card.createdAt, 'MMM dd')}</span>
                        <span className={clsx(s.rowCycle, gs.fontMono)}>{card.cycleDays != null ? `${card.cycleDays}d` : '—'}</span>
                      </div>
                    ))}
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
};

ArchiveView.defaultProps = {
  allLabels: [],
};

export default ArchiveView;
