import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import ProjectAddPopup from '../ProjectAddPopup';
import { Button, ButtonStyle, Icon, IconType, IconSize, Input } from '../Utils';
import ProjectTile from './ProjectTile';

import * as gs from '../../global.module.scss';
import * as s from './Projects.module.scss';

const Projects = React.memo(
  ({ projects, filteredProjects, managedProjects, isFiltered, isAdmin, canAdd, defaultData, isSubmitting, onCreate, filterQuery, onChangeFilterQuery, onProjectUpdate, onBackgroundImageUpdate }) => {
    const [t] = useTranslation();

    const getProjectsText = () => {
      if (!isFiltered) {
        return `${t('common.showing')} ${t('common.projects', { count: projects.length, context: 'title' })}`;
      }
      return `${t('common.showing')} ${t('common.ofProjects', { filteredCount: filteredProjects.length, count: projects.length, context: 'title' })}`;
    };

    const statsTotals = useMemo(
      () =>
        filteredProjects.reduce(
          (acc, project) => ({
            boardsCount: acc.boardsCount + project.boards.length,
            openCount: acc.openCount + project.statsTotals.openCount,
            dueSoonCount: acc.dueSoonCount + project.statsTotals.dueSoonCount,
          }),
          { boardsCount: 0, openCount: 0, dueSoonCount: 0 },
        ),
      [filteredProjects],
    );

    const handleFilterInputChange = useCallback(
      (e) => {
        onChangeFilterQuery({ query: e.target.value, target: 'project' });
      },
      [onChangeFilterQuery],
    );

    const handleFilterClear = useCallback(() => {
      onChangeFilterQuery({ query: '', target: 'project' });
    }, [onChangeFilterQuery]);

    const addProjectButton = useMemo(
      () => (
        <ProjectAddPopup defaultData={defaultData} isSubmitting={isSubmitting} onCreate={onCreate} offset={16} position="bottom">
          <Button style={ButtonStyle.NoBackground} title={t('common.addProject')} className={s.addButton}>
            <Icon type={IconType.Plus} size={IconSize.Size16} className={s.addButtonIcon} />
            {t('common.addProject')}
          </Button>
        </ProjectAddPopup>
      ),
      [defaultData, isSubmitting, onCreate, t],
    );

    const ghostTile = useMemo(
      () =>
        canAdd && (
          <ProjectAddPopup defaultData={defaultData} isSubmitting={isSubmitting} onCreate={onCreate} offset={16} position="bottom">
            <button type="button" className={s.ghost}>
              <span>
                <b>＋</b> {t('common.addProject')}
              </span>
            </button>
          </ProjectAddPopup>
        ),
      [canAdd, defaultData, isSubmitting, onCreate, t],
    );

    const isEmpty = projects.length === 0;

    return (
      <div className={s.wrapper}>
        <div className={s.pageHead}>
          <div>
            <h1 className={s.pageTitle}>{t('common.dashboard')}</h1>
          </div>
          {!isEmpty && (
            <div className={s.stats}>
              <div className={s.stat}>
                <b>{filteredProjects.length}</b>
                <span>{t('common.projects')}</span>
              </div>
              <div className={s.stat}>
                <b>{statsTotals.boardsCount}</b>
                <span>{t('common.boards')}</span>
              </div>
              <div className={s.stat}>
                <b>{statsTotals.openCount}</b>
                <span>{t('common.openCards')}</span>
              </div>
              <div className={clsx(s.stat, s.statWatch)}>
                <b>{statsTotals.dueSoonCount}</b>
                <span>{t('common.dueThisWeek')}</span>
              </div>
            </div>
          )}
        </div>

        <div className={s.toolbar}>
          <div className={s.filterField}>
            <Input value={filterQuery} onChange={handleFilterInputChange} placeholder={t('common.filterProjects')} className={s.filterInput} />
            {filterQuery !== '' && (
              <Button style={ButtonStyle.Icon} title={t('common.clearFilter')} onClick={handleFilterClear} className={s.filterClearButton}>
                <Icon type={IconType.Close} size={IconSize.Size10} />
              </Button>
            )}
          </div>
          <span className={s.showing}>{getProjectsText()}</span>
          <span className={s.toolbarSpacer} />
          {canAdd && addProjectButton}
        </div>

        <div className={clsx(s.gridScroll, gs.scrollableY)}>
          <div className={clsx(s.grid, isEmpty && s.gridEmpty)}>
            {filteredProjects.map((project) => (
              <ProjectTile
                key={project.id}
                project={project}
                canManageImage={isAdmin || managedProjects.some((p) => p.id === project.id)}
                onProjectUpdate={onProjectUpdate}
                onBackgroundImageUpdate={onBackgroundImageUpdate}
              />
            ))}
            {isEmpty && !canAdd && <span className={s.info}>{t('common.needInvite')}</span>}
            {ghostTile}
          </div>
        </div>
      </div>
    );
  },
);

Projects.propTypes = {
  projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  filteredProjects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  managedProjects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isFiltered: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  canAdd: PropTypes.bool.isRequired,
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isSubmitting: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  filterQuery: PropTypes.string,
  onChangeFilterQuery: PropTypes.func.isRequired,
  onProjectUpdate: PropTypes.func.isRequired,
  onBackgroundImageUpdate: PropTypes.func.isRequired,
};

Projects.defaultProps = {
  filterQuery: '',
};

export default Projects;
