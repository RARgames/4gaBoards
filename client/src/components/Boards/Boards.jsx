import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';
import Paths from '../../constants/Paths';
import BoardAddPopup from '../BoardAddPopup';

import styles from './Boards.module.scss';
import gStyles from '../../globalStyles.module.scss';

const Boards = React.memo(({ projectId, projects, filteredProjects, managedProjects, isFiltered, onCreate }) => {
  const [t] = useTranslation();
  const headerButtonGroupRef = useRef(null);
  const headerButtonGroupOffsetRef = useRef(null);
  const currentFilteredProject = filteredProjects.find((project) => project.id === projectId);
  const currentProject = projects.find((project) => project.id === projectId);
  const isProjectManager = managedProjects.some((p) => p.id === projectId);

  const getBoardsText = () => {
    const boardsCount = currentFilteredProject?.boards.length || 0;
    const totalBoardsCount = currentProject?.boards.length || 0;
    if (!isFiltered) {
      return `${t('common.showing')} ${t('common.boards', { count: boardsCount, context: 'title' })}`;
    }
    return `${t('common.showing')} ${boardsCount} ${t('common.ofBoards', { count: totalBoardsCount, context: 'title' })}`;
  };

  useEffect(() => {
    if (headerButtonGroupRef.current) {
      headerButtonGroupOffsetRef.current.style.width = `${headerButtonGroupRef.current.offsetWidth}px`;
    }
  }, [projectId]);

  return (
    <div className={classNames(styles.wrapper)}>
      <div className={styles.header}>
        <div ref={headerButtonGroupOffsetRef} />
        <div className={classNames(styles.headerText)}>
          <span>{getBoardsText()}</span> <span className={styles.headerDetails}>[{t('common.selectedProject')}]</span>
        </div>
        <div ref={headerButtonGroupRef} className={styles.headerButtonGroup}>
          {isProjectManager && (
            <div className={styles.headerButton}>
              <BoardAddPopup projects={managedProjects} projectId={projectId} skipProjectDropdown onCreate={onCreate} offset={16} position="bottom">
                <Button style={ButtonStyle.NoBackground} title={t('common.addBoard')} className={styles.addButton}>
                  <Icon type={IconType.Plus} size={IconSize.Size16} className={styles.addButtonIcon} />
                  {t('common.addBoard')}
                </Button>
              </BoardAddPopup>
            </div>
          )}
          {isProjectManager && (
            <div className={styles.headerButton}>
              <Link to={Paths.SETTINGS_PROJECT.replace(':id', projectId)}>
                <Button style={ButtonStyle.Icon} title={t('common.projectSettings')}>
                  <Icon type={IconType.ProjectSettings} size={IconSize.Size18} />
                </Button>
              </Link>
            </div>
          )}
          <div className={styles.headerButton}>
            <Link to={Paths.ROOT}>
              <Button style={ButtonStyle.Icon} title={t('common.backToDashboard')}>
                <Icon type={IconType.ArrowLeftBig} size={IconSize.Size18} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className={classNames(styles.boardsWrapper, gStyles.scrollableY)}>
        {currentFilteredProject?.boards.map((item) => (
          <div key={item.id} className={classNames(styles.boardWrapper)}>
            {item.notificationsTotal > 0 && <span className={styles.notification}>{item.notificationsTotal}</span>}
            <Link to={Paths.BOARDS.replace(':id', item.id)}>
              <div className={styles.board}>
                <div title={item.name} className={styles.boardTitle}>
                  {item.name}
                </div>
              </div>
            </Link>
          </div>
        ))}
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
  onCreate: PropTypes.func.isRequired,
};

export default Boards;
