import React, { useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { dropTargetForElements, monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import DroppableTypes from '../../constants/DroppableTypes';
import Paths from '../../constants/Paths';
import { useToggle } from '../../lib/hooks';
import { dropAnimation } from '../../lib/hooks/use-drop-animation';
import { resolveSidebarDropSlot, setSidebarDropSlot, useSidebarDropSlot } from '../../lib/hooks/use-sidebar-drop-slot';
import BoardAddPopup from '../BoardAddPopup';
import Filter from '../Filter';
import ProjectAddPopup from '../ProjectAddPopup';
import { Button, ButtonVariant, Icon, IconType, IconSize } from '../Utils';
import SidebarProject from './SidebarProject';

import * as gs from '../../global.module.scss';
import * as s from './Sidebar.module.scss';

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
    instanceNotificationCount,
    usersNotificationCount,
    boardTemplates,
    mailServiceAvailable,
    mailServiceInboundEmail,
    onProjectCreate,
    onProjectUpdate,
    onProjectMove,
    onBoardCreate,
    onBoardUpdate,
    onBoardMove,
    onBoardDelete,
    onBoardExport,
    onBoardFetch,
    onBoardTemplateCreate,
    onBoardTemplateUpdate,
    onBoardTemplateDelete,
    onChangeFilterQuery,
    onProjectMembershipUpdate,
    onActivitiesProjectFetch,
    onActivitiesBoardFetch,
    onMailTokenCreate,
    onMailTokenUpdate,
    onMailTokenDelete,
    onBoardMembershipUpdate,
  }) => {
    const [t] = useTranslation();
    const [sidebarShown, toggleSidebar] = useToggle(true);
    const projectRefs = useRef({});
    const boardRefs = useRef({});
    const scrollableRef = useRef(null);
    const isFilteringBoards = filterTarget === 'board' && !!filterQuery;
    const projectsCount = filteredProjects.length;

    const projectsPlaceholderHeight = useSidebarDropSlot((slot) => (slot && slot.type === DroppableTypes.PROJECT && slot.placeholderIndex >= projectsCount ? slot.height : null));

    const handleToggleProjectCollapse = useCallback(
      (project) => {
        onProjectMembershipUpdate(project.id, { isCollapsed: !project.isCollapsed });
      },
      [onProjectMembershipUpdate],
    );

    const handleProjectRef = useCallback((projectId, el) => {
      projectRefs.current[projectId] = el;
    }, []);

    const handleBoardRef = useCallback((boardId, el) => {
      boardRefs.current[boardId] = el;
    }, []);

    useEffect(() => {
      const cleanup = monitorForElements({
        canMonitor: ({ source }) => source.data.type === DroppableTypes.PROJECT || source.data.type === DroppableTypes.BOARD,
        onGenerateDragPreview: dropAnimation.onGenerateDragPreview,
        onDragStart: (args) => {
          setSidebarDropSlot(resolveSidebarDropSlot(args.source, args.location));
          dropAnimation.onDragStart(args);
        },
        onDrag: (args) => {
          setSidebarDropSlot(resolveSidebarDropSlot(args.source, args.location));
          dropAnimation.onDrag(args);
        },
        onDrop: (args) => {
          const { source, location } = args;
          const destination = resolveSidebarDropSlot(source, location);
          setSidebarDropSlot(null);

          if (destination.index !== source.data.index) {
            if (source.data.type === DroppableTypes.PROJECT) {
              onProjectMove(source.data.id, destination.index);
            } else {
              onBoardMove(source.data.id, destination.index);
            }
          }

          dropAnimation.onDrop(args);
        },
      });

      return () => {
        cleanup();
        setSidebarDropSlot(null);
      };
    }, [onProjectMove, onBoardMove]);

    // Auto scroll of the sidebar while dragging projects/boards and the drop target for dropping a project after the last one
    useEffect(() => {
      if (!scrollableRef.current) {
        return undefined;
      }

      return combine(
        autoScrollForElements({
          element: scrollableRef.current,
          canScroll: ({ source }) => source.data.type === DroppableTypes.PROJECT || source.data.type === DroppableTypes.BOARD,
        }),
        dropTargetForElements({
          element: scrollableRef.current,
          canDrop: ({ source }) => source.data.type === DroppableTypes.PROJECT,
          getData: () => ({ type: DroppableTypes.PROJECT, endIndex: projectsCount }),
        }),
      );
    }, [projectsCount]);

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

    const projectsNode = filteredProjects.map((project, index) => (
      <SidebarProject
        key={project.id}
        project={project}
        index={index}
        currProjectId={currProjectId}
        currBoardId={currBoardId}
        managedProjects={managedProjects}
        boardTemplates={boardTemplates}
        isAdmin={isAdmin}
        isProjectManager={managedProjects.some((p) => p.id === project.id)}
        isFilteringBoards={isFilteringBoards}
        mailServiceAvailable={mailServiceAvailable}
        mailServiceInboundEmail={mailServiceInboundEmail}
        onProjectRef={handleProjectRef}
        onBoardRef={handleBoardRef}
        onProjectUpdate={onProjectUpdate}
        onProjectMembershipUpdate={onProjectMembershipUpdate}
        onBoardCreate={onBoardCreate}
        onBoardUpdate={onBoardUpdate}
        onBoardDelete={onBoardDelete}
        onBoardExport={onBoardExport}
        onBoardFetch={onBoardFetch}
        onBoardMembershipUpdate={onBoardMembershipUpdate}
        onBoardTemplateCreate={onBoardTemplateCreate}
        onBoardTemplateUpdate={onBoardTemplateUpdate}
        onBoardTemplateDelete={onBoardTemplateDelete}
        onActivitiesProjectFetch={onActivitiesProjectFetch}
        onActivitiesBoardFetch={onActivitiesBoardFetch}
        onMailTokenCreate={onMailTokenCreate}
        onMailTokenUpdate={onMailTokenUpdate}
        onMailTokenDelete={onMailTokenDelete}
      />
    ));

    return (
      <div className={s.wrapper}>
        <Button variant={ButtonVariant.Icon} title={sidebarShown ? t('common.hideSidebar') : t('common.showSidebar')} onClick={toggleSidebar} className={s.toggleSidebarButton}>
          <Icon type={sidebarShown ? IconType.Hide : IconType.Show} size={IconSize.Size18} />
        </Button>
        <div className={clsx(s.sidebar, sidebarCompact && s.sidebarCompact, !sidebarShown && s.sidebarHidden)}>
          <div>
            {!settingsOnly && (
              <Filter defaultValue="" projects={projects} filteredProjects={filteredProjects} path={path} onChangeFilterQuery={onChangeFilterQuery} onFilterQueryClear={handleFilterQueryClear} />
            )}
          </div>
          <div ref={scrollableRef} className={clsx(s.scrollable, gs.scrollableY)}>
            {settingsOnly && (
              <div>
                <div className={s.sidebarTitle}>
                  <Icon type={IconType.Settings} size={IconSize.Size16} className={s.sidebarTitleIcon} />
                  {t('common.settings')}
                </div>
                <div className={clsx(s.sidebarItem, path === Paths.SETTINGS_PROFILE && s.sidebarActive)}>
                  <Link to={Paths.SETTINGS_PROFILE}>
                    <Button variant={ButtonVariant.NoBackground} title={t('common.profile')} className={clsx(s.sidebarButton, s.sidebarButtonPadding)}>
                      <Icon type={IconType.User} size={IconSize.Size14} className={s.icon} />
                      {t('common.profile')}
                    </Button>
                  </Link>
                </div>
                <div className={clsx(s.sidebarItem, path === Paths.SETTINGS_PREFERENCES && s.sidebarActive)}>
                  <Link to={Paths.SETTINGS_PREFERENCES}>
                    <Button variant={ButtonVariant.NoBackground} title={t('common.preferences')} className={clsx(s.sidebarButton, s.sidebarButtonPadding)}>
                      <Icon type={IconType.Sliders} size={IconSize.Size14} className={s.icon} />
                      {t('common.preferences')}
                    </Button>
                  </Link>
                </div>
                <div className={clsx(s.sidebarItem, path === Paths.SETTINGS_ACCOUNT && s.sidebarActive)}>
                  <Link to={Paths.SETTINGS_ACCOUNT}>
                    <Button variant={ButtonVariant.NoBackground} title={t('common.account')} className={clsx(s.sidebarButton, s.sidebarButtonPadding)}>
                      <Icon type={IconType.AddressCard} size={IconSize.Size14} className={s.icon} />
                      {t('common.account')}
                    </Button>
                  </Link>
                </div>
                <div className={clsx(s.sidebarItem, path === Paths.SETTINGS_AUTHENTICATION && s.sidebarActive)}>
                  <Link to={Paths.SETTINGS_AUTHENTICATION}>
                    <Button variant={ButtonVariant.NoBackground} title={t('common.authentication')} className={clsx(s.sidebarButton, s.sidebarButtonPadding)}>
                      <Icon type={IconType.Key} size={IconSize.Size14} className={s.icon} />
                      {t('common.authentication')}
                    </Button>
                  </Link>
                </div>
                <div className={clsx(s.sidebarItem, path === Paths.SETTINGS_ABOUT && s.sidebarActive)}>
                  <Link to={Paths.SETTINGS_ABOUT}>
                    <Button variant={ButtonVariant.NoBackground} title={t('common.aboutShort')} className={clsx(s.sidebarButton, s.sidebarButtonPadding)}>
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
                    <Button variant={ButtonVariant.NoBackground} title={t('common.users')} className={clsx(s.sidebarButton, s.sidebarButtonPadding)}>
                      <Icon type={IconType.Users} size={IconSize.Size14} className={s.icon} />
                      {t('common.users')}
                      {usersNotificationCount > 0 && <span className={s.notification}>{usersNotificationCount}</span>}
                    </Button>
                  </Link>
                </div>
                <div className={clsx(s.sidebarItem, path === Paths.SETTINGS_INSTANCE && s.sidebarActive)}>
                  <Link to={Paths.SETTINGS_INSTANCE}>
                    <Button variant={ButtonVariant.NoBackground} title={t('common.settings')} className={clsx(s.sidebarButton, s.sidebarButtonPadding)}>
                      <Icon type={IconType.Settings} size={IconSize.Size14} className={s.icon} />
                      {t('common.settings')}
                      {instanceNotificationCount > 0 && <span className={s.notification}>{instanceNotificationCount}</span>}
                    </Button>
                  </Link>
                </div>
              </div>
            )}
            {!settingsOnly && (
              <>
                {projectsNode}
                {projectsPlaceholderHeight !== null && <div style={{ height: projectsPlaceholderHeight }} />}
              </>
            )}
          </div>
          <div>
            {!settingsOnly && canAddProject && (
              <ProjectAddPopup defaultData={defaultData} isSubmitting={isSubmitting} onCreate={onProjectCreate} offset={2} position="right">
                <Button variant={ButtonVariant.NoBackground} title={t('common.addProject')} className={s.footerButton}>
                  <Icon type={IconType.Plus} size={IconSize.Size13} className={s.footerButtonIcon} />
                  {t('common.addProject')}
                </Button>
              </ProjectAddPopup>
            )}
            {managedProjects.length > 0 && !settingsOnly && (
              <BoardAddPopup
                projects={managedProjects}
                projectId={currProjectId}
                isAdmin={isAdmin}
                templates={boardTemplates}
                onCreate={onBoardCreate}
                onTemplateUpdate={onBoardTemplateUpdate}
                onTemplateDelete={onBoardTemplateDelete}
                offset={2}
                position="right"
              >
                <Button variant={ButtonVariant.NoBackground} title={t('common.addBoard')} className={s.footerButton}>
                  <Icon type={IconType.Plus} size={IconSize.Size13} className={s.footerButtonIcon} />
                  {t('common.addBoard')}
                </Button>
              </BoardAddPopup>
            )}
            {settingsOnly && (
              <Link to={Paths.ROOT}>
                <Button variant={ButtonVariant.NoBackground} title={t('common.backToDashboard')} className={s.footerButton}>
                  <Icon type={IconType.ArrowLeftBig} size={IconSize.Size13} className={s.footerButtonIcon} />
                  {t('common.dashboard')}
                </Button>
              </Link>
            )}
          </div>
        </div>
        <div className={clsx(s.content, sidebarCompact && s.contentCompact)}>{children}</div>
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
  instanceNotificationCount: PropTypes.number.isRequired,
  usersNotificationCount: PropTypes.number.isRequired,
  boardTemplates: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  mailServiceAvailable: PropTypes.bool.isRequired,
  mailServiceInboundEmail: PropTypes.string.isRequired,
  onProjectCreate: PropTypes.func.isRequired,
  onProjectUpdate: PropTypes.func.isRequired,
  onProjectMove: PropTypes.func.isRequired,
  onBoardCreate: PropTypes.func.isRequired,
  onBoardUpdate: PropTypes.func.isRequired,
  onBoardMove: PropTypes.func.isRequired,
  onBoardDelete: PropTypes.func.isRequired,
  onBoardExport: PropTypes.func.isRequired,
  onBoardFetch: PropTypes.func.isRequired,
  onBoardTemplateCreate: PropTypes.func.isRequired,
  onBoardTemplateUpdate: PropTypes.func.isRequired,
  onBoardTemplateDelete: PropTypes.func.isRequired,
  onChangeFilterQuery: PropTypes.func.isRequired,
  onProjectMembershipUpdate: PropTypes.func.isRequired,
  onActivitiesProjectFetch: PropTypes.func.isRequired,
  onActivitiesBoardFetch: PropTypes.func.isRequired,
  onMailTokenCreate: PropTypes.func.isRequired,
  onMailTokenUpdate: PropTypes.func.isRequired,
  onMailTokenDelete: PropTypes.func.isRequired,
  onBoardMembershipUpdate: PropTypes.func.isRequired,
};

Sidebar.defaultProps = {
  settingsOnly: false,
  currProjectId: undefined,
  currBoardId: undefined,
  filterQuery: undefined,
  filterTarget: undefined,
};

export default Sidebar;
