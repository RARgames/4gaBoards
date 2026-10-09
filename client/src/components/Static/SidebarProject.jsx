import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { attachClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import clsx from 'clsx';
import pick from 'lodash/pick';
import PropTypes from 'prop-types';

import DroppableTypes from '../../constants/DroppableTypes';
import Paths from '../../constants/Paths';
import { dragKey, getDragData, useDropAnimation } from '../../lib/hooks/use-drop-animation';
import { useSidebarDropSlot } from '../../lib/hooks/use-sidebar-drop-slot';
import ProjectActionsPopup from '../ProjectActionsPopup';
import { Button, ButtonVariant, Icon, IconType, IconSize } from '../Utils';
import SidebarBoard from './SidebarBoard';

import * as gs from '../../global.module.scss';
import * as ss from './Sidebar.module.scss';
import * as s from './SidebarProject.module.scss';

const SidebarProject = React.memo(
  ({
    project,
    index,
    currProjectId,
    currBoardId,
    managedProjects,
    boardTemplates,
    isAdmin,
    isProjectManager,
    isFilteringBoards,
    mailServiceAvailable,
    mailServiceInboundEmail,
    projectRefs,
    boardRefs,
    onProjectUpdate,
    onProjectMembershipUpdate,
    onBoardCreate,
    onBoardUpdate,
    onBoardDelete,
    onBoardExport,
    onBoardFetch,
    onBoardMembershipUpdate,
    onBoardTemplateCreate,
    onBoardTemplateUpdate,
    onBoardTemplateDelete,
    onActivitiesProjectFetch,
    onActivitiesBoardFetch,
    onMailTokenCreate,
    onMailTokenUpdate,
    onMailTokenDelete,
  }) => {
    const [t] = useTranslation();
    const wrapperRef = useRef(null);
    const projectRef = useRef(null);
    const headerRef = useRef(null);
    const handleRef = useRef(null);
    const projectRefsCurrent = projectRefs.current;
    const { id } = project;
    const key = dragKey('project', id);

    const isDragging = useSidebarDropSlot((slot) => !!slot && slot.type === DroppableTypes.PROJECT && slot.id === id);
    const placeholderHeight = useSidebarDropSlot((slot) => (slot && slot.type === DroppableTypes.PROJECT && slot.placeholderIndex === index ? slot.height : null));
    const boardsPlaceholderHeight = useSidebarDropSlot((slot) => (slot && slot.type === DroppableTypes.BOARD && slot.parentId === id && slot.placeholderIndex >= project.boards.length ? slot.height : null));

    useEffect(() => {
      // DnD: only the handle starts the drag, and the whole project is a drop target (drop above/below it)
      const wrapper = wrapperRef.current;
      const projectElement = projectRef.current;
      const header = headerRef.current;

      if (!wrapper || !projectElement || !header) {
        return undefined;
      }

      const data = { type: DroppableTypes.PROJECT, id, index };

      return combine(
        draggable({
          element: wrapper,
          dragHandle: handleRef.current || undefined,
          getInitialData: ({ input }) => ({
            ...data,
            height: projectElement.offsetHeight,
            ...getDragData(projectElement, input, key),
          }),
        }),
        dropTargetForElements({
          element: wrapper,
          canDrop: ({ source }) => source.data.type === DroppableTypes.PROJECT,
          getData: ({ input }) =>
            attachClosestEdge(data, {
              input,
              element: header,
              allowedEdges: ['top', 'bottom'],
            }),
        }),
      );
    }, [id, index, key]);

    useDropAnimation(projectRef, key);

    const handleToggleCollapse = useCallback(() => {
      onProjectMembershipUpdate(project.id, { isCollapsed: !project.isCollapsed });
    }, [project.id, project.isCollapsed, onProjectMembershipUpdate]);

    return (
      <div ref={wrapperRef}>
        {placeholderHeight !== null && <div style={{ height: placeholderHeight }} />}
        <div ref={projectRef} className={clsx(isDragging && gs.hidden)}>
          <div
            className={clsx(s.sidebarItemProject, !currBoardId && currProjectId === id && ss.sidebarItemActive)}
            ref={(el) => {
              headerRef.current = el;
              projectRefsCurrent[id] = el;
            }}
          >
            <Button variant={ButtonVariant.Icon} title={project.isCollapsed ? t('common.showBoards') : t('common.hideBoards')} className={clsx(ss.sidebarButton)} onClick={handleToggleCollapse}>
              <Icon type={IconType.TriangleDown} size={IconSize.Size8} className={clsx(ss.collapseIcon, project.isCollapsed && ss.collapseIconCollapsed)} />
            </Button>
            <Link to={Paths.PROJECTS.replace(':id', id)} className={ss.sidebarItemInner}>
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
              projectId={id}
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
              onUpdate={(data) => onProjectUpdate(id, data)}
              onBoardCreate={onBoardCreate}
              onTemplateUpdate={onBoardTemplateUpdate}
              onTemplateDelete={onBoardTemplateDelete}
              onActivitiesFetch={() => onActivitiesProjectFetch(id)}
              position="right-start"
              offset={10}
              hideCloseButton
            >
              <Button variant={ButtonVariant.Icon} title={t('common.editProject', { context: 'title' })} className={clsx(ss.sidebarButton, s.hoverButton)}>
                <Icon type={IconType.EllipsisVertical} size={IconSize.Size13} />
              </Button>
            </ProjectActionsPopup>
          </div>
          {(!project.isCollapsed || isFilteringBoards || currProjectId === id) && (
            <div>
              {project.boards.map((board, boardIndex) => (
                <SidebarBoard
                  key={board.id}
                  board={board}
                  index={boardIndex}
                  projectId={id}
                  boardRefs={boardRefs}
                  isActive={currBoardId === board.id}
                  isAdmin={isAdmin}
                  isProjectManager={isProjectManager}
                  templates={boardTemplates}
                  mailServiceAvailable={mailServiceAvailable}
                  mailServiceInboundEmail={mailServiceInboundEmail}
                  onUpdate={onBoardUpdate}
                  onExport={onBoardExport}
                  onFetch={onBoardFetch}
                  onDelete={onBoardDelete}
                  onMembershipUpdate={onBoardMembershipUpdate}
                  onActivitiesFetch={onActivitiesBoardFetch}
                  onMailTokenCreate={onMailTokenCreate}
                  onMailTokenUpdate={onMailTokenUpdate}
                  onMailTokenDelete={onMailTokenDelete}
                  onTemplateCreate={onBoardTemplateCreate}
                  onTemplateUpdate={onBoardTemplateUpdate}
                  onTemplateDelete={onBoardTemplateDelete}
                />
              ))}
              {boardsPlaceholderHeight !== null && <div style={{ height: boardsPlaceholderHeight }} />}
            </div>
          )}
        </div>
      </div>
    );
  },
);

SidebarProject.propTypes = {
  project: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  index: PropTypes.number.isRequired,
  currProjectId: PropTypes.string,
  currBoardId: PropTypes.string,
  managedProjects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  boardTemplates: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isAdmin: PropTypes.bool.isRequired,
  isProjectManager: PropTypes.bool.isRequired,
  isFilteringBoards: PropTypes.bool.isRequired,
  mailServiceAvailable: PropTypes.bool.isRequired,
  mailServiceInboundEmail: PropTypes.string.isRequired,
  projectRefs: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  boardRefs: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onProjectUpdate: PropTypes.func.isRequired,
  onProjectMembershipUpdate: PropTypes.func.isRequired,
  onBoardCreate: PropTypes.func.isRequired,
  onBoardUpdate: PropTypes.func.isRequired,
  onBoardDelete: PropTypes.func.isRequired,
  onBoardExport: PropTypes.func.isRequired,
  onBoardFetch: PropTypes.func.isRequired,
  onBoardMembershipUpdate: PropTypes.func.isRequired,
  onBoardTemplateCreate: PropTypes.func.isRequired,
  onBoardTemplateUpdate: PropTypes.func.isRequired,
  onBoardTemplateDelete: PropTypes.func.isRequired,
  onActivitiesProjectFetch: PropTypes.func.isRequired,
  onActivitiesBoardFetch: PropTypes.func.isRequired,
  onMailTokenCreate: PropTypes.func.isRequired,
  onMailTokenUpdate: PropTypes.func.isRequired,
  onMailTokenDelete: PropTypes.func.isRequired,
};

SidebarProject.defaultProps = {
  currProjectId: undefined,
  currBoardId: undefined,
};

export default SidebarProject;
