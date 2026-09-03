import React, { useCallback, useRef, useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import clsx from 'clsx';
import pick from 'lodash/pick';
import PropTypes from 'prop-types';

import DroppableTypes from '../../constants/DroppableTypes';
import Paths from '../../constants/Paths';
import { useToggle } from '../../lib/hooks';
import { getBoardAccentColor } from '../../utils/board-colors';
import BoardActionsPopup from '../BoardActionsPopup';
import BoardAddPopup from '../BoardAddPopup';
import ConnectionsPopup from '../ConnectionsPopup';
import Filter from '../Filter';
import ProjectActionsPopup from '../ProjectActionsPopup';
import ProjectAddPopup from '../ProjectAddPopup';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './Sidebar.module.scss';

const SIDEBAR_WIDTH_STORAGE_KEY = 'sidebarWidth';
const MIN_SIDEBAR_WIDTH = 180;
const MAX_SIDEBAR_WIDTH = 480;

const getStoredSidebarWidth = () => {
  const storedWidth = Number(window.localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY));

  return Number.isFinite(storedWidth) && storedWidth >= MIN_SIDEBAR_WIDTH && storedWidth <= MAX_SIDEBAR_WIDTH ? storedWidth : null;
};

const Sidebar = React.memo(
  ({
    children,
    settingsOnly,
    path,
    projects,
    filteredProjects,
    managedProjects,
    currProjectId,
    currBoardId,
    isAdmin,
    canAddProject,
    defaultData,
    isSubmitting,
    filterQuery,
    filterTarget,
    sidebarCompact,
    onProjectCreate,
    onProjectUpdate,
    onBoardCreate,
    onBoardUpdate,
    onBoardMove,
    onBoardDelete,
    onBoardExport,
    onChangeFilterQuery,
    onUserProjectUpdate,
  }) => {
    const [t] = useTranslation();
    const [sidebarShown, toggleSidebar] = useToggle(true);
    const [sidebarWidth, setSidebarWidth] = useState(getStoredSidebarWidth);
    const projectRefs = useRef({});
    const boardRefs = useRef({});
    const resizeCleanupRef = useRef();
    const isFilteringBoards = filterTarget === 'board' && !!filterQuery;

    const handleToggleProjectCollapse = useCallback(
      (project) => {
        onUserProjectUpdate(project.id, { isCollapsed: !project.isCollapsed });
      },
      [onUserProjectUpdate],
    );

    const handleDragEnd = useCallback(
      ({ draggableId, source, destination }) => {
        if (!destination || source.index === destination.index) {
          return;
        }

        onBoardMove(draggableId, destination.index);
      },
      [onBoardMove],
    );

    const scrollItemIntoView = useCallback((itemRef) => {
      if (itemRef) {
        const rect = itemRef.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

        if (!isVisible) {
          itemRef.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
      }
    }, []);

    const handleFilterQueryClear = useCallback(() => {
      const timeout = setTimeout(() => {
        if (currBoardId) {
          scrollItemIntoView(boardRefs.current[currBoardId]);
        } else if (currProjectId) {
          scrollItemIntoView(projectRefs.current[currProjectId]);
        }
      }, 0);
      return () => clearTimeout(timeout);
    }, [currBoardId, currProjectId, scrollItemIntoView]);

    useEffect(() => {
      if (currBoardId) {
        scrollItemIntoView(boardRefs.current[currBoardId]);
      } else if (currProjectId) {
        scrollItemIntoView(projectRefs.current[currProjectId]);
      }
    }, [currProjectId, currBoardId, scrollItemIntoView]);

    useEffect(
      () => () => {
        resizeCleanupRef.current?.();
      },
      [],
    );

    const updateSidebarWidth = useCallback((width) => {
      const maxWidth = Math.min(MAX_SIDEBAR_WIDTH, Math.floor(window.innerWidth / 2));
      const nextWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(maxWidth, width));

      setSidebarWidth(nextWidth);
      window.localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(nextWidth));
    }, []);

    const handleResizePointerDown = useCallback(
      (event) => {
        event.preventDefault();
        const startX = event.clientX;
        const startWidth = event.currentTarget.previousElementSibling.getBoundingClientRect().width;

        const handlePointerMove = (moveEvent) => {
          updateSidebarWidth(startWidth + moveEvent.clientX - startX);
        };
        const cleanup = () => {
          document.removeEventListener('pointermove', handlePointerMove);
          document.removeEventListener('pointerup', cleanup);
          document.removeEventListener('pointercancel', cleanup);
          document.body.classList.remove(s.resizingSidebar);
          resizeCleanupRef.current = undefined;
        };

        resizeCleanupRef.current?.();
        resizeCleanupRef.current = cleanup;
        document.body.classList.add(s.resizingSidebar);
        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', cleanup);
        document.addEventListener('pointercancel', cleanup);
      },
      [updateSidebarWidth],
    );

    const handleResizeKeyDown = useCallback(
      (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
          return;
        }

        event.preventDefault();
        const currentWidth = event.currentTarget.previousElementSibling.getBoundingClientRect().width;
        updateSidebarWidth(currentWidth + (event.key === 'ArrowLeft' ? -10 : 10));
      },
      [updateSidebarWidth],
    );

    const projectsNode = filteredProjects.map((project) => {
      const isProjectManager = managedProjects.some((p) => p.id === project.id);
      return (
        <div key={project.id}>
          {/* eslint-disable-next-line no-return-assign */}
          <div className={clsx(s.sidebarItemProject, !currBoardId && currProjectId === project.id && s.sidebarItemActive)} ref={(el) => (projectRefs.current[project.id] = el)}>
            <Button style={ButtonStyle.Icon} title={project.isCollapsed ? t('common.showBoards') : t('common.hideBoards')} className={s.sidebarButton} onClick={() => handleToggleProjectCollapse(project)}>
              <Icon type={IconType.TriangleDown} size={IconSize.Size8} className={clsx(s.collapseIcon, project.isCollapsed && s.collapseIconCollapsed)} />
            </Button>
            <Link to={Paths.PROJECTS.replace(':id', project.id)} className={s.sidebarItemInner}>
              <Button style={ButtonStyle.NoBackground} content={project.name} className={clsx(s.sidebarButton, s.sidebarButtonPadding)} />
            </Link>
            {project.notificationsTotal > 0 && <span className={clsx(s.notification, !isProjectManager && s.notificationNonManager)}>{project.notificationsTotal}</span>}
            {isProjectManager && (
              <ProjectActionsPopup
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
                onUpdate={(data) => onProjectUpdate(project.id, data)}
                onBoardCreate={onBoardCreate}
                position="right-start"
                offset={10}
                hideCloseButton
              >
                <Button style={ButtonStyle.Icon} title={t('common.editProject', { context: 'title' })} className={clsx(s.sidebarButton, s.hoverButton)}>
                  <Icon type={IconType.EllipsisVertical} size={IconSize.Size13} />
                </Button>
              </ProjectActionsPopup>
            )}
          </div>
          {(!project.isCollapsed || isFilteringBoards || currProjectId === project.id) && (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="boards" type={DroppableTypes.BOARD} direction="vertical">
                {({ innerRef, droppableProps, placeholder }) => (
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  <div {...droppableProps} ref={innerRef}>
                    {project.boards.map((board, index) => (
                      <Draggable key={board.id} draggableId={board.id} index={index} isDragDisabled={!board.isPersisted || !isProjectManager}>
                        {/* eslint-disable-next-line no-shadow */}
                        {({ innerRef, draggableProps, dragHandleProps }) => (
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          <div {...draggableProps} ref={innerRef} className={s.boardDraggable}>
                            {board.isPersisted && (
                              <div
                                key={board.id}
                                className={clsx(s.sidebarItemBoard, currBoardId === board.id && s.sidebarItemActive)}
                                // eslint-disable-next-line no-return-assign
                                ref={(el) => (boardRefs.current[board.id] = el)}
                              >
                                {isProjectManager && (
                                  // eslint-disable-next-line react/jsx-props-no-spreading
                                  <div {...dragHandleProps}>
                                    <Button style={ButtonStyle.Icon} title={t('common.reorderBoards')} className={clsx(s.reorderBoardsButton, s.hoverButton)}>
                                      <Icon type={IconType.MoveUpDown} size={IconSize.Size13} />
                                    </Button>
                                  </div>
                                )}
                                <span className={s.boardAccentSwatch} style={{ background: getBoardAccentColor(board.id) }} aria-hidden="true" />
                                <Link to={Paths.BOARDS.replace(':id', board.id)} className={clsx(s.sidebarItemInner, !isProjectManager && s.boardCannotManage)}>
                                  <Button style={ButtonStyle.NoBackground} content={board.name} className={clsx(s.boardButton, s.sidebarButton)} />
                                </Link>
                                {board.stats && <span className={s.boardOpenCount}>{board.stats.openCount}</span>}
                                {board.isGithubConnected &&
                                  (isProjectManager ? (
                                    <ConnectionsPopup defaultData={pick(board, ['isGithubConnected', 'githubRepo'])} onUpdate={(data) => onBoardUpdate(board.id, data)} offset={30} position="right-start">
                                      <Icon
                                        type={IconType.GitHub}
                                        size={IconSize.Size13}
                                        className={clsx(s.githubGreen, board.notificationsTotal > 0 && s.githubNotifications)}
                                        title={t('common.connectedToGithub', { repo: board.githubRepo })}
                                      />
                                    </ConnectionsPopup>
                                  ) : (
                                    <div>
                                      <Icon
                                        type={IconType.GitHub}
                                        size={IconSize.Size13}
                                        className={clsx(s.githubGreen, s.githubCannotManage, board.notificationsTotal > 0 && s.githubNotificationsCannotManage)}
                                        title={t('common.connectedToGithub', { repo: board.githubRepo })}
                                      />
                                    </div>
                                  ))}
                                {board.notificationsTotal > 0 && <span className={clsx(s.notification, !isProjectManager && s.notificationNonManager)}>{board.notificationsTotal}</span>}
                                {isProjectManager && (
                                  <BoardActionsPopup
                                    defaultDataRename={pick(board, 'name')}
                                    defaultDataGithub={pick(board, ['isGithubConnected', 'githubRepo'])}
                                    createdAt={board.createdAt}
                                    createdBy={board.createdBy}
                                    updatedAt={board.updatedAt}
                                    updatedBy={board.updatedBy}
                                    memberships={board.memberships}
                                    onUpdate={(data) => onBoardUpdate(board.id, data)}
                                    onExport={(data) => onBoardExport(board.id, data)}
                                    onDelete={() => onBoardDelete(board.id)}
                                    position="right-start"
                                    offset={10}
                                    hideCloseButton
                                  >
                                    <Button style={ButtonStyle.Icon} title={t('common.editBoard', { context: 'title' })} className={s.hoverButton}>
                                      <Icon type={IconType.EllipsisVertical} size={IconSize.Size13} />
                                    </Button>
                                  </BoardActionsPopup>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      );
    });

    return (
      <div className={s.wrapper}>
        <Button style={ButtonStyle.Icon} title={sidebarShown ? t('common.hideSidebar') : t('common.showSidebar')} onClick={toggleSidebar} className={s.toggleSidebarButton}>
          <Icon type={sidebarShown ? IconType.Hide : IconType.Show} size={IconSize.Size18} />
        </Button>
        <div className={clsx(s.sidebar, sidebarCompact && s.sidebarCompact, !sidebarShown && s.sidebarHidden)} style={sidebarShown && sidebarWidth ? { width: sidebarWidth } : undefined}>
          <div>
            {!settingsOnly && (
              <Filter defaultValue="" projects={projects} filteredProjects={filteredProjects} path={path} onChangeFilterQuery={onChangeFilterQuery} onFilterQueryClear={handleFilterQueryClear} />
            )}
          </div>
          <div className={clsx(s.scrollable, gs.scrollableY)}>
            {settingsOnly && (
              <div>
                <div className={s.sidebarTitle}>
                  <Icon type={IconType.Settings} size={IconSize.Size16} className={s.sidebarTitleIcon} />
                  {t('common.settings')}
                </div>
                <div className={clsx(s.sidebarItem, path === Paths.SETTINGS_PROFILE && s.sidebarActive)}>
                  <Link to={Paths.SETTINGS_PROFILE}>
                    <Button style={ButtonStyle.NoBackground} title={t('common.profile')} className={clsx(s.sidebarButton, s.sidebarButtonPadding)}>
                      <Icon type={IconType.User} size={IconSize.Size14} className={s.icon} />
                      {t('common.profile')}
                    </Button>
                  </Link>
                </div>
                <div className={clsx(s.sidebarItem, path === Paths.SETTINGS_PREFERENCES && s.sidebarActive)}>
                  <Link to={Paths.SETTINGS_PREFERENCES}>
                    <Button style={ButtonStyle.NoBackground} title={t('common.preferences')} className={clsx(s.sidebarButton, s.sidebarButtonPadding)}>
                      <Icon type={IconType.Sliders} size={IconSize.Size14} className={s.icon} />
                      {t('common.preferences')}
                    </Button>
                  </Link>
                </div>
                <div className={clsx(s.sidebarItem, path === Paths.SETTINGS_ACCOUNT && s.sidebarActive)}>
                  <Link to={Paths.SETTINGS_ACCOUNT}>
                    <Button style={ButtonStyle.NoBackground} title={t('common.account')} className={clsx(s.sidebarButton, s.sidebarButtonPadding)}>
                      <Icon type={IconType.AddressCard} size={IconSize.Size14} className={s.icon} />
                      {t('common.account')}
                    </Button>
                  </Link>
                </div>
                <div className={clsx(s.sidebarItem, path === Paths.SETTINGS_AUTHENTICATION && s.sidebarActive)}>
                  <Link to={Paths.SETTINGS_AUTHENTICATION}>
                    <Button style={ButtonStyle.NoBackground} title={t('common.authentication')} className={clsx(s.sidebarButton, s.sidebarButtonPadding)}>
                      <Icon type={IconType.Key} size={IconSize.Size14} className={s.icon} />
                      {t('common.authentication')}
                    </Button>
                  </Link>
                </div>
                <div className={clsx(s.sidebarItem, path === Paths.SETTINGS_ABOUT && s.sidebarActive)}>
                  <Link to={Paths.SETTINGS_ABOUT}>
                    <Button style={ButtonStyle.NoBackground} title={t('common.aboutShort')} className={clsx(s.sidebarButton, s.sidebarButtonPadding)}>
                      <Icon type={IconType.Info} size={IconSize.Size14} className={s.icon} />
                      {t('common.aboutShort')}
                    </Button>
                  </Link>
                </div>
              </div>
            )}
            {isAdmin && settingsOnly && (
              <div>
                <div className={s.sidebarTitle}>
                  <Icon type={IconType.Server} size={IconSize.Size16} className={s.sidebarTitleIcon} />
                  {t('common.instanceSettings')}
                </div>
                <div className={clsx(s.sidebarItem, path === Paths.SETTINGS_USERS && s.sidebarActive)}>
                  <Link to={Paths.SETTINGS_USERS}>
                    <Button style={ButtonStyle.NoBackground} title={t('common.users')} className={clsx(s.sidebarButton, s.sidebarButtonPadding)}>
                      <Icon type={IconType.Users} size={IconSize.Size14} className={s.icon} />
                      {t('common.users')}
                    </Button>
                  </Link>
                </div>
                <div className={clsx(s.sidebarItem, path === Paths.SETTINGS_MEMBERS && s.sidebarActive)}>
                  <Link to={Paths.SETTINGS_MEMBERS}>
                    <Button style={ButtonStyle.NoBackground} title={t('common.members')} className={clsx(s.sidebarButton, s.sidebarButtonPadding)}>
                      <Icon type={IconType.Users} size={IconSize.Size14} className={s.icon} />
                      {t('common.members')}
                    </Button>
                  </Link>
                </div>
                <div className={clsx(s.sidebarItem, path === Paths.SETTINGS_CALENDAR && s.sidebarActive)}>
                  <Link to={Paths.SETTINGS_CALENDAR}>
                    <Button style={ButtonStyle.NoBackground} title={t('common.settingsCalendar')} className={clsx(s.sidebarButton, s.sidebarButtonPadding)}>
                      <Icon type={IconType.Calendar} size={IconSize.Size14} className={s.icon} />
                      {t('common.calendar')}
                    </Button>
                  </Link>
                </div>
                <div className={clsx(s.sidebarItem, path === Paths.SETTINGS_INSTANCE && s.sidebarActive)}>
                  <Link to={Paths.SETTINGS_INSTANCE}>
                    <Button style={ButtonStyle.NoBackground} title={t('common.settings')} className={clsx(s.sidebarButton, s.sidebarButtonPadding)}>
                      <Icon type={IconType.Settings} size={IconSize.Size14} className={s.icon} />
                      {t('common.settings')}
                    </Button>
                  </Link>
                </div>
              </div>
            )}
            {!settingsOnly && <div>{projectsNode}</div>}
          </div>
          <div>
            {!settingsOnly && canAddProject && (
              <ProjectAddPopup defaultData={defaultData} isSubmitting={isSubmitting} onCreate={onProjectCreate} offset={2} position="right">
                <Button style={ButtonStyle.NoBackground} title={t('common.addProject')} className={s.footerButton}>
                  <Icon type={IconType.Plus} size={IconSize.Size13} className={s.footerButtonIcon} />
                  {t('common.addProject')}
                </Button>
              </ProjectAddPopup>
            )}
            {managedProjects.length > 0 && !settingsOnly && (
              <BoardAddPopup projects={managedProjects} projectId={currProjectId} isAdmin={isAdmin} onCreate={onBoardCreate} offset={2} position="right">
                <Button style={ButtonStyle.NoBackground} title={t('common.addBoard')} className={s.footerButton}>
                  <Icon type={IconType.Plus} size={IconSize.Size13} className={s.footerButtonIcon} />
                  {t('common.addBoard')}
                </Button>
              </BoardAddPopup>
            )}
            {settingsOnly && (
              <Link to={Paths.ROOT}>
                <Button style={ButtonStyle.NoBackground} title={t('common.backToDashboard')} className={s.footerButton}>
                  <Icon type={IconType.ArrowLeftBig} size={IconSize.Size13} className={s.footerButtonIcon} />
                  {t('common.dashboard')}
                </Button>
              </Link>
            )}
          </div>
        </div>
        {sidebarShown && (
          /* The separator is operable by pointer and keyboard like a native splitter. */
          /* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
          <div
            className={s.resizeHandle}
            role="separator"
            aria-label={t('common.resizeSidebar')}
            aria-orientation="vertical"
            aria-valuemin={MIN_SIDEBAR_WIDTH}
            aria-valuemax={MAX_SIDEBAR_WIDTH}
            aria-valuenow={sidebarWidth || (sidebarCompact ? 200 : 260)}
            tabIndex={0}
            onPointerDown={handleResizePointerDown}
            onKeyDown={handleResizeKeyDown}
          />
          /* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
        )}
        <div className={s.content}>{children}</div>
      </div>
    );
  },
);

Sidebar.propTypes = {
  children: PropTypes.node.isRequired,
  settingsOnly: PropTypes.bool,
  path: PropTypes.string.isRequired,
  projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  filteredProjects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  managedProjects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currProjectId: PropTypes.string,
  currBoardId: PropTypes.string,
  isAdmin: PropTypes.bool.isRequired,
  canAddProject: PropTypes.bool.isRequired,
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isSubmitting: PropTypes.bool.isRequired,
  filterQuery: PropTypes.string,
  filterTarget: PropTypes.string,
  sidebarCompact: PropTypes.bool.isRequired,
  onProjectCreate: PropTypes.func.isRequired,
  onProjectUpdate: PropTypes.func.isRequired,
  onBoardCreate: PropTypes.func.isRequired,
  onBoardUpdate: PropTypes.func.isRequired,
  onBoardMove: PropTypes.func.isRequired,
  onBoardDelete: PropTypes.func.isRequired,
  onBoardExport: PropTypes.func.isRequired,
  onChangeFilterQuery: PropTypes.func.isRequired,
  onUserProjectUpdate: PropTypes.func.isRequired,
};

Sidebar.defaultProps = {
  settingsOnly: false,
  currProjectId: undefined,
  currBoardId: undefined,
  filterQuery: undefined,
  filterTarget: undefined,
};

export default Sidebar;
