import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import pick from 'lodash/pick';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';
import Paths from '../../constants/Paths';
import { useToggle } from '../../lib/hooks';
import Connections from '../BoardActions/Connections';
import ProjectAddPopup from '../ProjectAddPopup';
import BoardAddPopup from '../Boards/AddPopup';

import styles from './MainSidebar.module.scss';
import gStyles from '../../globalStyles.module.scss';
import Filter from '../Filter';

const MainSidebar = React.memo(
  ({
    children,
    path,
    projects,
    filteredProjects,
    currProjectId,
    currBoardId,
    canAdd,
    defaultData,
    isSubmitting,
    onProjectCreate,
    onBoardCreate,
    onChangeFilterQuery,
    onBoardUpdate,
    onUserProjectUpdate,
  }) => {
    const [t] = useTranslation();
    const [sidebarShown, toggleSidebar] = useToggle(true);

    const handleConnectionsUpdate = useCallback(
      (id, data) => {
        onBoardUpdate(id, data);
      },
      [onBoardUpdate],
    );

    const handleToggleProjectCollapse = useCallback(
      (project) => {
        onUserProjectUpdate(project.id, { isCollapsed: !project.isCollapsed });
      },
      [onUserProjectUpdate],
    );

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
              {filteredProjects.map((project) => (
                <div key={project.id} className={styles.sidebarItemProjectWrapper}>
                  <div
                    className={classNames(
                      styles.sidebarItemProject,
                      !currBoardId && currProjectId === project.id && styles.sidebarItemProjectActive,
                      project.isCollapsed && styles.sidebarItemProjectCollapsed,
                    )}
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
                  {project.isCollapsed === false &&
                    project.boards.map((board) => (
                      <div key={board.id} className={classNames(styles.sidebarItemBoard, currBoardId === board.id && styles.sidebarActive)}>
                        <Link to={Paths.BOARDS.replace(':id', board.id)} className={classNames(styles.board, styles.linkButton)}>
                          <Button style={ButtonStyle.NoBackground} content={board.name} className={styles.sidebarButton} />
                        </Link>
                        {board.isGithubConnected && (
                          <Connections
                            defaultData={pick(board, ['isGithubConnected', 'githubRepo'])}
                            onUpdate={(data) => {
                              handleConnectionsUpdate(board.id, data);
                            }}
                            offset={30}
                            position="right-start"
                            wrapperClassName={styles.connections}
                          >
                            <Icon
                              type={IconType.Github}
                              size={IconSize.Size14}
                              className={classNames(styles.githubIcon, board.isGithubConnected ? styles.githubGreen : styles.githubGrey)}
                              title={board.isGithubConnected ? t('common.connectedToGithub') : t('common.notConnectedToGithub')}
                            />
                          </Connections>
                        )}
                      </div>
                    ))}
                </div>
              ))}
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
              <BoardAddPopup projects={projects} projectId={currProjectId} onCreate={onBoardCreate} offset={6} position="right-end">
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
  currProjectId: PropTypes.string,
  currBoardId: PropTypes.string,
  canAdd: PropTypes.bool.isRequired,
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isSubmitting: PropTypes.bool.isRequired,
  onProjectCreate: PropTypes.func.isRequired,
  onBoardCreate: PropTypes.func.isRequired,
  onChangeFilterQuery: PropTypes.func.isRequired,
  onBoardUpdate: PropTypes.func.isRequired,
  onUserProjectUpdate: PropTypes.func.isRequired,
};

MainSidebar.defaultProps = {
  currProjectId: undefined,
  currBoardId: undefined,
};

export default MainSidebar;
