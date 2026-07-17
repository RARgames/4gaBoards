import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import clsx from 'clsx';
import { formatDistanceToNowStrict } from 'date-fns';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import PropTypes from 'prop-types';

import { ProjectBackgroundTypes } from '../../constants/Enums';
import Paths from '../../constants/Paths';
import { getBoardAccentColor } from '../../utils/board-colors';
import User from '../User';
import { Button, ButtonStyle, FilePicker, Icon, IconType, IconSize } from '../Utils';

import * as bs from '../../backgrounds.module.scss';
import * as s from './ProjectTile.module.scss';

const MAX_SHELF_BOARDS = 5;
const MAX_SHELF_LANES = 4;
const MAX_AVATARS = 3;
const STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

const getBoardLanes = (board) => {
  if (!board.stats) {
    return [];
  }

  const shownLists = board.stats.lists.slice(0, MAX_SHELF_LANES);
  const maxCount = Math.max(1, ...shownLists.map((list) => list.cardCount));

  return shownLists.map((list) => ({
    id: list.id,
    isDone: list.type === 'done',
    heightPercent: list.cardCount === 0 ? 10 : Math.max(10, Math.round((list.cardCount / maxCount) * 100)),
  }));
};

const ProjectTile = React.memo(({ project, canManageImage, onProjectUpdate, onBackgroundImageUpdate }) => {
  const [t] = useTranslation();

  const accentColor = useMemo(() => getBoardAccentColor(project.id), [project.id]);

  const handleImageSelect = useCallback(
    (file) => {
      onBackgroundImageUpdate(project.id, { file });
      onProjectUpdate(project.id, { background: { type: ProjectBackgroundTypes.IMAGE } });
    },
    [project.id, onBackgroundImageUpdate, onProjectUpdate],
  );

  const hasImageBackground = !!(project.background && project.background.type === ProjectBackgroundTypes.IMAGE && project.backgroundImage);

  const bannerStyle = useMemo(() => {
    if (hasImageBackground) {
      // A thin ribbon crops a photo down to an unrecognizable sliver — this needs real height
      // to read as a cover image, unlike the color/gradient cases below (see .bannerImage).
      return { backgroundImage: `url("${project.backgroundImage.coverUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center' };
    }
    if (project.background && project.background.type === ProjectBackgroundTypes.GRADIENT) {
      return undefined; // handled via the bs[] class below, applied with !important
    }
    return { background: `linear-gradient(90deg, ${accentColor}, transparent)` };
  }, [hasImageBackground, project.background, project.backgroundImage, accentColor]);

  const bannerClassName = project.background && project.background.type === ProjectBackgroundTypes.GRADIENT ? bs[`background${upperFirst(camelCase(project.background.name))}`] : undefined;

  const { lastActivityLabel, isStale } = useMemo(() => {
    const { lastActivityAt } = project.statsTotals;
    if (!lastActivityAt) {
      return { lastActivityLabel: null, isStale: false };
    }

    const lastActivityDate = new Date(lastActivityAt);
    return {
      lastActivityLabel: formatDistanceToNowStrict(lastActivityDate, { addSuffix: true }),
      isStale: Date.now() - lastActivityDate.getTime() > STALE_THRESHOLD_MS,
    };
  }, [project.statsTotals]);

  const shownBoards = project.boards.slice(0, MAX_SHELF_BOARDS);
  const extraBoardsCount = project.boards.length - shownBoards.length;
  const visibleMembers = project.memberships.slice(0, MAX_AVATARS);
  const extraMembersCount = project.memberships.length - visibleMembers.length;
  const projectPath = Paths.PROJECTS.replace(':id', project.id);

  return (
    <div className={s.card} style={{ '--accent': accentColor }}>
      <div className={clsx(s.banner, hasImageBackground && s.bannerImage, bannerClassName)} style={bannerStyle} />
      <div className={s.head}>
        <Link to={projectPath} className={s.headLink}>
          <div className={s.headText}>
            <div title={project.name} className={s.name}>
              {project.name}
            </div>
            <div className={s.sub}>
              {t('common.boards', { count: project.boards.length })} · {project.statsTotals.openCount} {t('common.cards')}
            </div>
          </div>
        </Link>
        {project.notificationsTotal > 0 && (
          <span className={s.notification} title={t('common.unreadNotificationsCount', { count: project.notificationsTotal })}>
            {project.notificationsTotal}
          </span>
        )}
        {canManageImage && (
          <FilePicker accept="image/*" onSelect={handleImageSelect}>
            <Button style={ButtonStyle.Icon} title={t('action.uploadNewImage')} className={s.imageButton} disabled={project.isBackgroundImageUpdating}>
              <Icon type={IconType.Image} size={IconSize.Size13} />
            </Button>
          </FilePicker>
        )}
      </div>

      <div className={s.shelf}>
        {shownBoards.length === 0 && <span className={s.shelfEmpty}>{t('common.noBoards')}</span>}
        {shownBoards.map((board) => {
          const boardAccent = getBoardAccentColor(board.id);
          const lanes = getBoardLanes(board);

          return (
            <Link key={board.id} to={Paths.BOARDS.replace(':id', board.id)} className={s.shelfRow} style={{ '--sw': boardAccent }}>
              <span className={s.shelfSwatch} aria-hidden="true" />
              <span title={board.name} className={s.shelfName}>
                {board.name}
              </span>
              {board.notificationsTotal > 0 && (
                <span className={s.shelfPill} title={t('common.unreadNotificationsCount', { count: board.notificationsTotal })}>
                  {board.notificationsTotal}
                </span>
              )}
              {lanes.length > 0 && (
                <span className={s.shelfSpark} aria-hidden="true">
                  {lanes.map((lane) => (
                    <i key={lane.id} className={clsx(lane.isDone && s.shelfSparkDone)} style={{ height: `${lane.heightPercent}%` }} />
                  ))}
                </span>
              )}
              <span className={s.shelfCount}>{board.stats ? board.stats.openCount : ''}</span>
            </Link>
          );
        })}
        {extraBoardsCount > 0 && (
          <Link to={projectPath} className={s.shelfMore}>
            +{extraBoardsCount} {t('common.boards')}
          </Link>
        )}
      </div>

      <Link to={projectPath} className={clsx(s.foot, isStale && s.footStale)}>
        <span className={s.footOpen}>
          {project.statsTotals.openCount} <span className={s.footOpenLabel}>{t('common.cards')}</span>
        </span>
        {project.statsTotals.dueSoonCount > 0 && (
          <span className={s.footDue}>
            {project.statsTotals.dueSoonCount} <span className={s.footDueLabel}>{t('common.dueThisWeek')}</span>
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
      </Link>
    </div>
  );
});

ProjectTile.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  project: PropTypes.object.isRequired,
  canManageImage: PropTypes.bool.isRequired,
  onProjectUpdate: PropTypes.func.isRequired,
  onBackgroundImageUpdate: PropTypes.func.isRequired,
};

export default ProjectTile;
