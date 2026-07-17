import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import clsx from 'clsx';
import { formatDistanceToNowStrict } from 'date-fns';
import PropTypes from 'prop-types';

import Paths from '../../constants/Paths';
import { getBoardAccentColor } from '../../utils/board-colors';
import User from '../User';

import * as s from './BoardTile.module.scss';

const MAX_LANES = 6;
const MAX_AVATARS = 3;
const STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

const BoardTile = React.memo(({ board }) => {
  const [t] = useTranslation();

  const accentColor = useMemo(() => getBoardAccentColor(board.id), [board.id]);

  const { lanes, progressPercent, hasProgress, lastActivityLabel, isStale } = useMemo(() => {
    const { stats } = board;

    if (!stats) {
      return {
        lanes: [],
        progressPercent: null,
        hasProgress: false,
        lastActivityLabel: null,
        isStale: false,
      };
    }

    const shownLists = stats.lists.slice(0, MAX_LANES);
    const maxCount = Math.max(1, ...shownLists.map((list) => list.cardCount));

    const computedLanes = shownLists.map((list) => ({
      id: list.id,
      name: list.name,
      isDone: list.type === 'done',
      heightPercent: list.cardCount === 0 ? 6 : Math.max(6, Math.round((list.cardCount / maxCount) * 100)),
    }));

    const computedProgressPercent = stats.totalCount > 0 ? Math.round((stats.doneCount / stats.totalCount) * 100) : null;

    let computedLastActivityLabel = null;
    let computedIsStale = false;
    if (stats.lastActivityAt) {
      const lastActivityDate = new Date(stats.lastActivityAt);
      computedLastActivityLabel = formatDistanceToNowStrict(lastActivityDate, { addSuffix: true });
      computedIsStale = Date.now() - lastActivityDate.getTime() > STALE_THRESHOLD_MS;
    }

    return {
      lanes: computedLanes,
      progressPercent: computedProgressPercent,
      hasProgress: computedProgressPercent !== null,
      lastActivityLabel: computedLastActivityLabel,
      isStale: computedIsStale,
    };
  }, [board]);

  const visibleMembers = board.memberships.slice(0, MAX_AVATARS);
  const extraMembersCount = board.memberships.length - visibleMembers.length;
  const openCount = board.stats ? board.stats.openCount : null;

  return (
    <div className={s.tileWrapper} style={{ '--accent': accentColor }}>
      <Link to={Paths.BOARDS.replace(':id', board.id)} className={clsx(s.tile, isStale && s.tileStale)}>
        <div className={s.top}>
          <span className={s.teamDot} aria-hidden="true" />
          <span title={board.name} className={s.name}>
            {board.name}
          </span>
          {board.notificationsTotal > 0 && (
            <span className={s.notification} title={t('common.unreadNotificationsCount', { count: board.notificationsTotal })}>
              {board.notificationsTotal}
            </span>
          )}
        </div>

        {lanes.length > 0 && (
          <div className={s.fingerprint} aria-hidden="true">
            {lanes.map((lane) => (
              <div key={lane.id} className={s.lane}>
                <div className={s.barTrack}>
                  <div className={clsx(s.bar, lane.isDone && s.barDone)} style={{ height: `${lane.heightPercent}%` }} />
                </div>
                <em className={s.laneLabel}>{lane.name}</em>
              </div>
            ))}
          </div>
        )}

        {hasProgress && (
          <div className={s.progressRow}>
            <div className={s.progressTrack}>
              <div className={s.progressFill} style={{ width: `${progressPercent}%` }} />
            </div>
            <span className={s.progressPercent}>{progressPercent}%</span>
          </div>
        )}

        <div className={s.meta}>
          {openCount !== null && (
            <span className={s.cardCount}>
              {openCount} <span className={s.cardCountLabel}>{t('common.cards')}</span>
            </span>
          )}
          {visibleMembers.length > 0 && (
            <span className={s.avatars}>
              {visibleMembers.map(({ user }) => (
                <User key={user.id} name={user.name} avatarUrl={user.avatarUrl} size="tiny" skipTitle={false} />
              ))}
              {extraMembersCount > 0 && <span className={s.avatarsMore}>+{extraMembersCount}</span>}
            </span>
          )}
          {lastActivityLabel && <span className={s.updated}>{lastActivityLabel}</span>}
        </div>
      </Link>
    </div>
  );
});

BoardTile.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  board: PropTypes.object.isRequired,
};

export default BoardTile;
