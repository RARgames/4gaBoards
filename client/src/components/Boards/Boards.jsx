import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import Paths from '../../constants/Paths';
import BoardAddPopup from '../BoardAddPopup';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './Boards.module.scss';

const Boards = React.memo(({ projectId, projects, filteredProjects, managedProjects, isFiltered, isAdmin, onCreate }) => {
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
    return `${t('common.showing')} ${t('common.ofBoards', { filteredCount: boardsCount, count: totalBoardsCount, context: 'title' })}`;
  };

  useEffect(() => {
    if (headerButtonGroupRef.current) {
      headerButtonGroupOffsetRef.current.style.width = `${headerButtonGroupRef.current.offsetWidth}px`;
    }
  }, [projectId]);

  return (
    <div className={clsx(s.wrapper)}>
      <div className={s.header}>
        <div ref={headerButtonGroupOffsetRef} />
        <div className={clsx(s.headerText)}>
          <span>{getBoardsText()}</span> <span className={s.headerDetails}>[{t('common.selectedProject')}]</span>
        </div>
        <div ref={headerButtonGroupRef} className={s.headerButtonGroup}>
          {isProjectManager && (
            <div className={s.headerButton}>
              <BoardAddPopup projects={managedProjects} projectId={projectId} skipProjectDropdown isAdmin={isAdmin} onCreate={onCreate} offset={16} position="bottom">
                <Button style={ButtonStyle.NoBackground} title={t('common.addBoard')} className={s.addButton}>
                  <Icon type={IconType.Plus} size={IconSize.Size16} className={s.addButtonIcon} />
                  {t('common.addBoard')}
                </Button>
              </BoardAddPopup>
            </div>
          )}
          {isProjectManager && (
            <div className={s.headerButton}>
              <Link to={Paths.SETTINGS_PROJECT.replace(':id', projectId)}>
                <Button style={ButtonStyle.Icon} title={t('common.projectSettings')}>
                  <Icon type={IconType.ProjectSettings} size={IconSize.Size18} />
                </Button>
              </Link>
            </div>
          )}
          <div className={s.headerButton}>
            <Link to={Paths.ROOT}>
              <Button style={ButtonStyle.Icon} title={t('common.backToDashboard')}>
                <Icon type={IconType.ArrowLeftBig} size={IconSize.Size18} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className={clsx(s.boardsWrapper, gs.scrollableY, currentProject?.boards.length === 0 && s.boardsWrapperEmpty)}>
        {currentFilteredProject?.boards.map((item) => (
          <div key={item.id} className={clsx(s.boardWrapper)}>
            {item.notificationsTotal > 0 && <span className={s.notification}>{item.notificationsTotal}</span>}
            <Link to={Paths.BOARDS.replace(':id', item.id)}>
              <div className={s.board}>
                <div title={item.name} className={s.boardTitle}>
                  {item.name}
                </div>
              </div>
            </Link>
          </div>
        ))}
        {currentProject?.boards.length === 0 && isProjectManager && (
          <div className={s.info}>
            <BoardAddPopup projects={managedProjects} projectId={projectId} skipProjectDropdown isAdmin={isAdmin} onCreate={onCreate} offset={16} position="bottom">
              <Button style={ButtonStyle.NoBackground} title={t('common.addBoard')} className={s.addButton}>
                <Icon type={IconType.Plus} size={IconSize.Size16} className={s.addButtonIcon} />
                {t('common.addBoard')}
              </Button>
            </BoardAddPopup>
          </div>
        )}
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
};

export default Boards;
