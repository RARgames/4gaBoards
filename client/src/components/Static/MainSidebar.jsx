import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import pick from 'lodash/pick';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';
import Paths from '../../constants/Paths';
import { useToggle } from '../../lib/hooks';
import Connections from '../BoardActions/Connections';
import ProjectAddPopup from '../ProjectAddPopup';
import BoardAddPopup from '../Boards/AddPopup';
import DroppableTypes from '../../constants/DroppableTypes';

import styles from './MainSidebar.module.scss';
import bStyles from '../Utils/Button/Button.module.scss';
import gStyles from '../../globalStyles.module.scss';
import Filter from '../Filter';
import BoardActionsPopup from './BoardActionsPopup';

const MainSidebar = React.memo(
  ({
    children,
    path,
    projects,
    filteredProjects,
    managedProjects,
    currProjectId,
    currBoardId,
    canAdd,
    defaultData,
    isSubmitting,
    onProjectCreate,
    onBoardCreate,
    onBoardUpdate,
    onBoardMove,
    onBoardDelete,
    onChangeFilterQuery,
    onUserProjectUpdate,
  }) => {
    const [t] = useTranslation();
    const [sidebarShown, toggleSidebar] = useToggle(true);

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

    const handleBoardUpdate = useCallback(
      (id, data) => {
        onBoardUpdate(id, data);
      },
      [onBoardUpdate],
    );

    const handleBoardDelete = useCallback(
      (id) => {
        onBoardDelete(id);
      },
      [onBoardDelete],
    );

    const projectsNode = filteredProjects.map((project) => (
      <div key={project.id} className={styles.sidebarItemProjectWrapper}>
        <div
          className={classNames(styles.sidebarItemProject, !currBoardId && currProjectId === project.id && styles.sidebarItemProjectActive, project.isCollapsed && styles.sidebarItemProjectCollapsed)}
        >
          <Button
            style={ButtonStyle.Icon}
            title={project.isCollapsed ? t('common.showBoards') : t('common.hideBoards')}
            className={styles.sidebarButton}
            onClick={() => handleToggleProjectCollapse(project)}
          >
            <Icon type={IconType.TriangleDown} size={IconSize.Size8} className={classNames(styles.collapseIcon, project.isCollapsed && styles.collapseIconCollapsed)} />
          </Button>
          <Link to={Paths.PROJECTS.replace(':id', project.id)} className={styles.linkButton}>
            <Button style={ButtonStyle.NoBackground} content={project.name} className={classNames(styles.sidebarButton, styles.sidebarButtonPadding)} />
          </Link>
        </div>
        {project.isCollapsed === false && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="boards" type={DroppableTypes.BOARD} direction="vertical">
              {({ innerRef, droppableProps, placeholder }) => (
                // eslint-disable-next-line react/jsx-props-no-spreading
                <div {...droppableProps} ref={innerRef}>
                  {project.boards.map((board, index) => {
                    const canManage = managedProjects.some((p) => p.id === project.id);
                    return (
                      <Draggable key={board.id} draggableId={board.id} index={index} isDragDisabled={!board.isPersisted || !canManage}>
                        {/* eslint-disable-next-line no-shadow */}
                        {({ innerRef, draggableProps, dragHandleProps }) => (
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          <div {...draggableProps} ref={innerRef} className={styles.boardDraggable}>
                            {board.isPersisted && (
                              <div key={board.id} className={classNames(styles.sidebarItemBoard, currBoardId === board.id && styles.sidebarActive)}>
                                {canManage && (
                                  // eslint-disable-next-line react/jsx-props-no-spreading
                                  <div {...dragHandleProps}>
                                    <Icon type={IconType.MoveUpDown} size={IconSize.Size13} className={styles.reorderBoardsIcon} title={t('common.reorderBoards')} />
                                  </div>
                                )}
                                <Link
                                  to={Paths.BOARDS.replace(':id', board.id)}
                                  className={classNames(styles.board, styles.linkButton, bStyles.button, bStyles.noBackground, styles.sidebarButton, !canManage && styles.boardCannotManage)}
                                >
                                  {board.name}
                                </Link>
                                {board.isGithubConnected &&
                                  (canManage ? (
                                    <Connections
                                      defaultData={pick(board, ['isGithubConnected', 'githubRepo'])}
                                      onUpdate={(data) => {
                                        handleBoardUpdate(board.id, data);
                                      }}
                                      offset={36}
                                      position="right-start"
                                    >
                                      <Icon
                                        type={IconType.Github}
                                        size={IconSize.Size13}
                                        className={classNames(styles.githubIcon, board.isGithubConnected ? styles.githubGreen : styles.githubGrey)}
                                        title={board.isGithubConnected ? t('common.connectedToGithub') : t('common.notConnectedToGithub')}
                                      />
                                    </Connections>
                                  ) : (
                                    <div>
                                      <Icon
                                        type={IconType.Github}
                                        size={IconSize.Size13}
                                        className={classNames(styles.githubIcon, board.isGithubConnected ? styles.githubGreen : styles.githubGrey, styles.githubCannotManage)}
                                        title={board.isGithubConnected ? t('common.connectedToGithub') : t('common.notConnectedToGithub')}
                                      />
                                    </div>
                                  ))}
                                {canManage && (
                                  <BoardActionsPopup
                                    defaultDataRename={pick(board, 'name')}
                                    defaultDataGithub={pick(board, ['isGithubConnected', 'githubRepo'])}
                                    onUpdate={(data) => handleBoardUpdate(board.id, data)}
                                    onDelete={() => handleBoardDelete(board.id)}
                                    position="right-start"
                                    offset={16}
                                    hideCloseButton
                                  >
                                    <Button style={ButtonStyle.Icon} title={t('common.editBoard', { context: 'title' })} className={classNames(styles.editBoardButton, styles.target)}>
                                      <Icon type={IconType.EllipsisVertical} size={IconSize.Size13} />
                                    </Button>
                                  </BoardActionsPopup>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    ));

    return (
      <div className={styles.wrapper}>
        <Button style={ButtonStyle.Icon} title={t('common.showSidebar')} onClick={toggleSidebar} className={classNames(styles.showSidebarButton, sidebarShown && styles.showSidebarButtonHidden)}>
          <Icon type={IconType.Show} size={IconSize.Size18} />
        </Button>
        <div className={classNames(styles.sidebar, !sidebarShown && styles.sidebarHidden)}>
          <div className={styles.sidebarFilter}>
            <Filter defaultValue="" projects={projects} filteredProjects={filteredProjects} onChangeFilterQuery={onChangeFilterQuery} />
          </div>
          <div className={classNames(styles.scrollable, gStyles.scrollableY)}>
            <div className={styles.sidebarTitle}>
              <Icon type={IconType.Settings} size={IconSize.Size16} className={styles.sidebarTitleIcon} />
              {t('common.settings')}
              <Button style={ButtonStyle.Icon} title={t('common.hideSidebar')} onClick={toggleSidebar} className={styles.hideSidebarButton}>
                <Icon type={IconType.Hide} size={IconSize.Size18} />
              </Button>
            </div>
            <div className={classNames(styles.sidebarItem, path === Paths.SETTINGS_PROFILE && styles.sidebarActive)}>
              <Link to={Paths.SETTINGS_PROFILE}>
                <Button style={ButtonStyle.NoBackground} title={t('common.profile')} className={classNames(styles.sidebarButton, styles.sidebarButtonPadding)}>
                  <Icon type={IconType.User} size={IconSize.Size14} className={styles.icon} />
                  {t('common.profile')}
                </Button>
              </Link>
            </div>
            <div>
              <div className={styles.sidebarTitle}>
                <Icon type={IconType.Projects} size={IconSize.Size16} className={styles.sidebarTitleIcon} /> {t('common.projects', { context: 'title' })}
              </div>
              {projectsNode}
            </div>
          </div>
          <div className={styles.sidebarFooter}>
            {canAdd && (
              <ProjectAddPopup defaultData={defaultData} isSubmitting={isSubmitting} onCreate={onProjectCreate} offset={6} position="right-end">
                <Button style={ButtonStyle.NoBackground} title={t('common.createProject')} className={styles.footerButton}>
                  <Icon type={IconType.Plus} size={IconSize.Size13} className={styles.footerButtonIcon} />
                  {t('common.createProject')}
                </Button>
              </ProjectAddPopup>
            )}
            {canAdd && (
              <BoardAddPopup projects={managedProjects} projectId={currProjectId} onCreate={onBoardCreate} offset={6} position="right-end">
                <Button style={ButtonStyle.NoBackground} title={t('common.createBoard')} className={styles.footerButton}>
                  <Icon type={IconType.Plus} size={IconSize.Size13} className={styles.footerButtonIcon} />
                  {t('common.createBoard')}
                </Button>
              </BoardAddPopup>
            )}
          </div>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    );
  },
);

MainSidebar.propTypes = {
  children: PropTypes.node.isRequired,
  path: PropTypes.string.isRequired,
  projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  filteredProjects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  managedProjects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currProjectId: PropTypes.string,
  currBoardId: PropTypes.string,
  canAdd: PropTypes.bool.isRequired,
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isSubmitting: PropTypes.bool.isRequired,
  onProjectCreate: PropTypes.func.isRequired,
  onBoardCreate: PropTypes.func.isRequired,
  onBoardUpdate: PropTypes.func.isRequired,
  onBoardMove: PropTypes.func.isRequired,
  onBoardDelete: PropTypes.func.isRequired,
  onChangeFilterQuery: PropTypes.func.isRequired,
  onUserProjectUpdate: PropTypes.func.isRequired,
};

MainSidebar.defaultProps = {
  currProjectId: undefined,
  currBoardId: undefined,
};

export default MainSidebar;
