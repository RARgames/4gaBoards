import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import Paths from '../../constants/Paths';
import BoardAddPopup from '../BoardAddPopup';
import { Button, ButtonStyle, Icon, IconType, IconSize, Input } from '../Utils';
import BoardTile from './BoardTile';

import * as gs from '../../global.module.scss';
import * as s from './Boards.module.scss';

const VIEW_MODE_STORAGE_KEY = 'boardsViewMode';
const VIEW_MODES = {
  GRID: 'grid',
  ROWS: 'rows',
};

const getStoredViewMode = () => {
  try {
    const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    return stored === VIEW_MODES.ROWS ? VIEW_MODES.ROWS : VIEW_MODES.GRID;
  } catch {
    return VIEW_MODES.GRID;
  }
};

const Boards = React.memo(({ projectId, projects, filteredProjects, managedProjects, isFiltered, isAdmin, onCreate, filterQuery, onChangeFilterQuery }) => {
  const [t] = useTranslation();
  const [viewMode, setViewMode] = useState(getStoredViewMode);

  const currentFilteredProject = filteredProjects.find((project) => project.id === projectId);
  const currentProject = projects.find((project) => project.id === projectId);
  const isProjectManager = managedProjects.some((p) => p.id === projectId);
  // Admins can create boards in any project (server-side bypass in boards/create.js), even ones
  // they don't explicitly manage. Project settings (rename/delete/manage managers) stays
  // managers-only — that authorization surface wasn't part of this change.
  const canCreateBoards = isProjectManager || isAdmin;

  // BoardAddPopup derives its initial selection from this list (skipProjectDropdown means the
  // dropdown itself never renders, but the current project still needs to be present here or
  // submission fails client-side before the request is even sent).
  const boardAddPopupProjects = useMemo(() => {
    if (!currentProject || isProjectManager) {
      return managedProjects;
    }
    return [...managedProjects, { id: currentProject.id, name: currentProject.name }];
  }, [managedProjects, currentProject, isProjectManager]);

  const getBoardsText = () => {
    const boardsCount = currentFilteredProject?.boards.length || 0;
    const totalBoardsCount = currentProject?.boards.length || 0;
    if (!isFiltered) {
      return `${t('common.showing')} ${t('common.boards', { count: boardsCount, context: 'title' })}`;
    }
    return `${t('common.showing')} ${t('common.ofBoards', { filteredCount: boardsCount, count: totalBoardsCount, context: 'title' })}`;
  };

  const handleViewModeChange = useCallback((nextViewMode) => {
    setViewMode(nextViewMode);
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, nextViewMode);
    } catch {
      // Ignore storage failures (private browsing, quota, etc.) — the toggle still works for the session.
    }
  }, []);

  const handleFilterInputChange = useCallback(
    (e) => {
      onChangeFilterQuery({ query: e.target.value, target: 'board' });
    },
    [onChangeFilterQuery],
  );

  const handleFilterClear = useCallback(() => {
    onChangeFilterQuery({ query: '', target: 'board' });
  }, [onChangeFilterQuery]);

  const statsTotals = currentProject?.statsTotals;
  const membersCount = currentProject?.memberships.length || 0;
  const boards = currentFilteredProject?.boards || [];
  const isEmpty = (currentProject?.boards.length || 0) === 0;

  const addBoardButton = useMemo(
    () => (
      <BoardAddPopup projects={boardAddPopupProjects} projectId={projectId} skipProjectDropdown isAdmin={isAdmin} onCreate={onCreate} offset={16} position="bottom">
        <Button style={ButtonStyle.NoBackground} title={t('common.addBoard')} className={s.addButton}>
          <Icon type={IconType.Plus} size={IconSize.Size16} className={s.addButtonIcon} />
          {t('common.addBoard')}
        </Button>
      </BoardAddPopup>
    ),
    [boardAddPopupProjects, projectId, isAdmin, onCreate, t],
  );

  const ghostTile = useMemo(
    () =>
      canCreateBoards && (
        <BoardAddPopup projects={boardAddPopupProjects} projectId={projectId} skipProjectDropdown isAdmin={isAdmin} onCreate={onCreate} offset={16} position="bottom">
          <button type="button" className={s.ghost}>
            <span>
              <b>＋</b> {t('common.addBoard')}
            </span>
          </button>
        </BoardAddPopup>
      ),
    [canCreateBoards, boardAddPopupProjects, projectId, isAdmin, onCreate, t],
  );

  return (
    <div className={s.wrapper}>
      <div className={s.projectHead}>
        <div>
          <p className={s.eyebrow}>{t('common.project_title')}</p>
          <h1 className={s.projectName}>{currentProject?.name}</h1>
        </div>
        {!isEmpty && (
          <div className={s.stats}>
            <div className={s.stat}>
              <b>{statsTotals?.openCount ?? 0}</b>
              <span>{t('common.openCards')}</span>
            </div>
            <div className={s.stat}>
              <b>{membersCount}</b>
              <span>{t('common.members')}</span>
            </div>
            <div className={clsx(s.stat, s.statWatch)}>
              <b>{statsTotals?.dueSoonCount ?? 0}</b>
              <span>{t('common.dueThisWeek')}</span>
            </div>
            <div className={s.stat}>
              <b>{statsTotals?.doneRecentCount ?? 0}</b>
              <span>{t('common.doneLast7Days')}</span>
            </div>
          </div>
        )}
      </div>

      <div className={s.toolbar}>
        <div className={s.filterField}>
          <Input value={filterQuery} onChange={handleFilterInputChange} placeholder={t('common.filterBoards')} className={s.filterInput} />
          {filterQuery !== '' && (
            <Button style={ButtonStyle.Icon} title={t('common.clearFilter')} onClick={handleFilterClear} className={s.filterClearButton}>
              <Icon type={IconType.Close} size={IconSize.Size10} />
            </Button>
          )}
        </div>
        <span className={s.showing}>{getBoardsText()}</span>
        <span className={s.toolbarSpacer} />
        <div className={s.seg} role="group" aria-label={t('common.boardView')}>
          <button type="button" aria-pressed={viewMode === VIEW_MODES.GRID} onClick={() => handleViewModeChange(VIEW_MODES.GRID)}>
            {t('common.gridView')}
          </button>
          <button type="button" aria-pressed={viewMode === VIEW_MODES.ROWS} onClick={() => handleViewModeChange(VIEW_MODES.ROWS)}>
            {t('common.listView')}
          </button>
        </div>
        {canCreateBoards && addBoardButton}
        {isProjectManager && (
          <Link to={Paths.SETTINGS_PROJECT.replace(':id', projectId)}>
            <Button style={ButtonStyle.Icon} title={t('common.projectSettings')}>
              <Icon type={IconType.ProjectSettings} size={IconSize.Size18} />
            </Button>
          </Link>
        )}
        <Link to={Paths.ROOT}>
          <Button style={ButtonStyle.Icon} title={t('common.backToDashboard')}>
            <Icon type={IconType.ArrowLeftBig} size={IconSize.Size18} />
          </Button>
        </Link>
      </div>

      <div className={clsx(s.gridScroll, gs.scrollableY)}>
        <div className={clsx(s.grid, viewMode === VIEW_MODES.ROWS && 'rows', isEmpty && s.gridEmpty)}>
          {boards.map((board) => (
            <BoardTile key={board.id} board={board} />
          ))}
          {ghostTile}
        </div>
      </div>
    </div>
  );
});

Boards.propTypes = {
  projectId: PropTypes.string.isRequired,
  projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  filteredProjects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  managedProjects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isFiltered: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  filterQuery: PropTypes.string,
  onChangeFilterQuery: PropTypes.func.isRequired,
};

Boards.defaultProps = {
  filterQuery: '',
};

export default Boards;
