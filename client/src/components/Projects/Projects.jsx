import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import ProjectAddPopup from '../ProjectAddPopup';
import { Button, ButtonVariant, Icon, IconType, IconSize } from '../Utils';
import ProjectItem from './ProjectItem';

import * as gs from '../../global.module.scss';
import * as s from './Projects.module.scss';

const Projects = React.memo(
  ({
    projects,
    filteredProjects,
    isFiltered,
    canAdd,
    defaultData,
    isSubmitting,
    rightClickContextMenu,
    managedProjects,
    boardTemplates,
    isAdmin,
    onCreate,
    onUpdate,
    onBoardCreate,
    onBoardTemplateUpdate,
    onBoardTemplateDelete,
    onActivitiesProjectFetch,
  }) => {
    const [t] = useTranslation();
    const headerButtonGroupRef = useRef(null);
    const headerButtonGroupOffsetRef = useRef(null);

    const getProjectsText = () => {
      if (!isFiltered) {
        return `${t('common.showing')} ${t('common.projects', { count: projects.length, context: 'title' })}`;
      }
      return `${t('common.showing')} ${t('common.ofProjects', { filteredCount: filteredProjects.length, count: projects.length, context: 'title' })}`;
    };

    const getBoardsText = () => {
      const boardsCount = filteredProjects.reduce((sum, project) => sum + (project.boards ? project.boards.length : 0), 0);
      return `[${t('common.boards', { count: boardsCount, context: 'title' })}]`;
    };

    useEffect(() => {
      if (headerButtonGroupRef.current) {
        headerButtonGroupOffsetRef.current.style.width = `${headerButtonGroupRef.current.offsetWidth}px`;
      }
    }, []);

    return (
      <div className={s.wrapper}>
        <div className={s.header}>
          <div ref={headerButtonGroupOffsetRef} />
          <div className={clsx(s.headerText)}>
            <span>{getProjectsText()}</span> <span className={s.headerDetails}>{getBoardsText()}</span>
          </div>
          <div ref={headerButtonGroupRef} className={s.headerButtonGroup}>
            {canAdd && (
              <div className={s.headerButton}>
                <ProjectAddPopup defaultData={defaultData} isSubmitting={isSubmitting} onCreate={onCreate} offset={16} position="bottom">
                  <Button variant={ButtonVariant.NoBackground} title={t('common.addProject')} className={s.addButton}>
                    <Icon type={IconType.Plus} size={IconSize.Size16} className={s.addButtonIcon} />
                    {t('common.addProject')}
                  </Button>
                </ProjectAddPopup>
              </div>
            )}
          </div>
        </div>
        <div className={clsx(s.projectsWrapper, gs.scrollableY, projects.length === 0 && s.projectsWrapperEmpty)}>
          {filteredProjects.map((item) => (
            <ProjectItem
              key={item.id}
              item={item}
              managedProjects={managedProjects}
              boardTemplates={boardTemplates}
              isAdmin={isAdmin}
              rightClickContextMenu={rightClickContextMenu}
              onUpdate={onUpdate}
              onBoardCreate={onBoardCreate}
              onBoardTemplateUpdate={onBoardTemplateUpdate}
              onBoardTemplateDelete={onBoardTemplateDelete}
              onActivitiesProjectFetch={onActivitiesProjectFetch}
            />
          ))}
          {projects.length === 0 && !canAdd && <span className={s.info}>{t('common.needInvite')}</span>}
          {projects.length === 0 && canAdd && (
            <div className={s.info}>
              <ProjectAddPopup defaultData={defaultData} isSubmitting={isSubmitting} onCreate={onCreate} offset={16} position="bottom">
                <Button variant={ButtonVariant.NoBackground} title={t('common.addProject')} className={s.addButton}>
                  <Icon type={IconType.Plus} size={IconSize.Size16} className={s.addButtonIcon} />
                  {t('common.addProject')}
                </Button>
              </ProjectAddPopup>
            </div>
          )}
        </div>
      </div>
    );
  },
);

Projects.propTypes = {
  projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  filteredProjects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isFiltered: PropTypes.bool.isRequired,
  canAdd: PropTypes.bool.isRequired,
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isSubmitting: PropTypes.bool.isRequired,
  rightClickContextMenu: PropTypes.bool.isRequired,
  managedProjects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  boardTemplates: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isAdmin: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onBoardCreate: PropTypes.func.isRequired,
  onBoardTemplateUpdate: PropTypes.func.isRequired,
  onBoardTemplateDelete: PropTypes.func.isRequired,
  onActivitiesProjectFetch: PropTypes.func.isRequired,
};

export default Projects;
