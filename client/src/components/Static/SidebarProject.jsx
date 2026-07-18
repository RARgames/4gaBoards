import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { isSortable, useSortable } from '@dnd-kit/react/sortable';
import clsx from 'clsx';
import pick from 'lodash/pick';
import PropTypes from 'prop-types';

import Paths from '../../constants/Paths';
import SortableTypes from '../../constants/SortableTypes';
import ProjectActionsPopup from '../ProjectActionsPopup';
import { Button, ButtonVariant, Icon, IconType, IconSize } from '../Utils';
import SidebarBoard from './SidebarBoard';

import * as ss from './Sidebar.module.scss';
import * as s from './SidebarProject.module.scss';

const SidebarProject = React.memo(
  ({
    project,
    index,
    isProjectManager,
    isAdmin,
    currProjectId,
    currBoardId,
    boardRefs,
    projectRefs,
    managedProjects,
    boardTemplates,
    mailServiceAvailable,
    mailServiceInboundEmail,
    isFilteringBoards,
    onProjectUpdate,
    onProjectMembershipUpdate,
    onBoardCreate,
    onBoardUpdate,
    onBoardDelete,
    onBoardExport,
    onBoardFetch,
    onBoardTemplateCreate,
    onBoardTemplateUpdate,
    onBoardTemplateDelete,
    onActivitiesProjectFetch,
    onActivitiesBoardFetch,
    onMailTokenCreate,
    onMailTokenUpdate,
    onMailTokenDelete,
    onBoardMembershipUpdate,
  }) => {
    const [t] = useTranslation();
    const projectRefsCurrent = projectRefs.current;

    const { ref, handleRef, isDragging } = useSortable({
      id: project.id,
      index,
      type: SortableTypes.PROJECT,
      accept: (source) => isSortable(source) && source.type === SortableTypes.PROJECT,
    });

    const handleToggleCollapse = useCallback(() => {
      onProjectMembershipUpdate(project.id, { isCollapsed: !project.isCollapsed });
    }, [project.id, project.isCollapsed, onProjectMembershipUpdate]);

    return (
      <div ref={ref} className={clsx(isDragging && s.projectDragging)}>
        <div
          className={clsx(s.sidebarItemProject, !currBoardId && currProjectId === project.id && ss.sidebarItemActive)}
          // eslint-disable-next-line no-return-assign
          ref={(el) => (projectRefsCurrent[project.id] = el)}
        >
          <Button variant={ButtonVariant.Icon} title={project.isCollapsed ? t('common.showBoards') : t('common.hideBoards')} className={ss.sidebarButton} onClick={handleToggleCollapse}>
            <Icon type={IconType.TriangleDown} size={IconSize.Size8} className={clsx(ss.collapseIcon, project.isCollapsed && ss.collapseIconCollapsed)} />
          </Button>
          <Link to={Paths.PROJECTS.replace(':id', project.id)} className={ss.sidebarItemInner}>
            <Button variant={ButtonVariant.NoBackground} content={project.name} className={clsx(ss.sidebarButton, ss.sidebarButtonPadding)} />
          </Link>
          <div ref={handleRef}>
            <Button variant={ButtonVariant.Icon} title={t('common.reorderProjects')} className={clsx(s.reorderProjectsButton, s.hoverButton)}>
              <Icon type={IconType.MoveUpDown} size={IconSize.Size13} />
            </Button>
          </div>
          {project.notificationsTotal > 0 && <span className={ss.notification}>{project.notificationsTotal}</span>}
          <ProjectActionsPopup
            activities={project.activities}
            isActivitiesFetching={project.isActivitiesFetching}
            isAllActivitiesFetched={project.isAllActivitiesFetched}
            lastActivityId={project.lastActivityId}
            name={project.name}
            projectId={project.id}
            managedProjects={managedProjects}
            defaultDataRename={pick(project, 'name')}
            isAdmin={isAdmin}
            createdAt={project.createdAt}
            createdBy={project.createdBy}
            updatedAt={project.updatedAt}
            updatedBy={project.updatedBy}
            memberships={project.memberships}
            templates={boardTemplates}
            isProjectManager={isProjectManager}
            onUpdate={(data) => onProjectUpdate(project.id, data)}
            onBoardCreate={onBoardCreate}
            onTemplateUpdate={onBoardTemplateUpdate}
            onTemplateDelete={onBoardTemplateDelete}
            onActivitiesFetch={() => onActivitiesProjectFetch(project.id)}
            position="right-start"
            offset={10}
            hideCloseButton
          >
            <Button variant={ButtonVariant.Icon} title={t('common.editProject', { context: 'title' })} className={clsx(ss.sidebarButton, s.hoverButton)}>
              <Icon type={IconType.EllipsisVertical} size={IconSize.Size13} />
            </Button>
          </ProjectActionsPopup>
        </div>
        {(!project.isCollapsed || isFilteringBoards || currProjectId === project.id) &&
          project.boards.map((board, boardIndex) => (
            <SidebarBoard
              key={board.id}
              board={board}
              index={boardIndex}
              projectId={project.id}
              isProjectManager={isProjectManager}
              isAdmin={isAdmin}
              currBoardId={currBoardId}
              boardRefs={boardRefs}
              boardTemplates={boardTemplates}
              mailServiceAvailable={mailServiceAvailable}
              mailServiceInboundEmail={mailServiceInboundEmail}
              onBoardUpdate={onBoardUpdate}
              onBoardDelete={onBoardDelete}
              onBoardExport={onBoardExport}
              onBoardFetch={onBoardFetch}
              onBoardTemplateCreate={onBoardTemplateCreate}
              onBoardTemplateUpdate={onBoardTemplateUpdate}
              onBoardTemplateDelete={onBoardTemplateDelete}
              onActivitiesBoardFetch={onActivitiesBoardFetch}
              onMailTokenCreate={onMailTokenCreate}
              onMailTokenUpdate={onMailTokenUpdate}
              onMailTokenDelete={onMailTokenDelete}
              onBoardMembershipUpdate={onBoardMembershipUpdate}
            />
          ))}
      </div>
    );
  },
);

SidebarProject.propTypes = {
  project: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  index: PropTypes.number.isRequired,
  isProjectManager: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  currProjectId: PropTypes.string,
  currBoardId: PropTypes.string,
  boardRefs: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  projectRefs: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  managedProjects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  boardTemplates: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  mailServiceAvailable: PropTypes.bool.isRequired,
  mailServiceInboundEmail: PropTypes.string.isRequired,
  isFilteringBoards: PropTypes.bool.isRequired,
  onProjectUpdate: PropTypes.func.isRequired,
  onProjectMembershipUpdate: PropTypes.func.isRequired,
  onBoardCreate: PropTypes.func.isRequired,
  onBoardUpdate: PropTypes.func.isRequired,
  onBoardDelete: PropTypes.func.isRequired,
  onBoardExport: PropTypes.func.isRequired,
  onBoardFetch: PropTypes.func.isRequired,
  onBoardTemplateCreate: PropTypes.func.isRequired,
  onBoardTemplateUpdate: PropTypes.func.isRequired,
  onBoardTemplateDelete: PropTypes.func.isRequired,
  onActivitiesProjectFetch: PropTypes.func.isRequired,
  onActivitiesBoardFetch: PropTypes.func.isRequired,
  onMailTokenCreate: PropTypes.func.isRequired,
  onMailTokenUpdate: PropTypes.func.isRequired,
  onMailTokenDelete: PropTypes.func.isRequired,
  onBoardMembershipUpdate: PropTypes.func.isRequired,
};

SidebarProject.defaultProps = {
  currProjectId: undefined,
  currBoardId: undefined,
};

export default SidebarProject;
