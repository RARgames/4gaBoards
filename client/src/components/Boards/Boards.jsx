import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';
import Paths from '../../constants/Paths';
import BoardAddPopup from '../BoardAddPopup';

import styles from './Boards.module.scss';
import gStyles from '../../globalStyles.module.scss';

const Boards = React.memo(({ projectId, projects, filteredProjects, managedProjects, onCreate }) => {
  const [t] = useTranslation();
  const currentFilteredProject = filteredProjects.find((project) => project.id === projectId);
  const currentProject = projects.find((project) => project.id === projectId);
  const canManage = managedProjects.some((p) => p.id === projectId);

  const getBoardsText = () => {
    const boardsCount = currentFilteredProject?.boards.length || 0;
    const totalBoardsCount = currentProject?.boards.length || 0;
    if (boardsCount === totalBoardsCount) {
      return `${t('common.showing')} ${boardsCount} ${[boardsCount !== 1 ? t('common.boards__title') : t('common.board__title')]}`;
    }
    return [`${t('common.showing')} ${boardsCount} ${t('common.of')} ${totalBoardsCount} ${[boardsCount !== 1 ? t('common.boards__title') : t('common.board__title')]}`];
  };

  return (
    <div className={classNames(styles.wrapper, gStyles.scrollableY)}>
      <div className={styles.header}>
        <span>{getBoardsText()}</span> <span className={styles.headerDetails}>[{t('common.selectedProject')}]</span>
      </div>
      <div className={classNames(styles.boardsWrapper)}>
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
        {canManage && (
          <BoardAddPopup projects={managedProjects} projectId={projectId} skipProjectDropdown onCreate={onCreate} offset={2} position="bottom">
            <Button style={ButtonStyle.Icon} title={t('common.createBoard')} className={classNames(styles.boardWrapper, styles.add)}>
              <Icon type={IconType.Plus} size={IconSize.Size20} className={styles.addGridIcon} />
              {t('common.createBoard')}
            </Button>
          </BoardAddPopup>
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
  onCreate: PropTypes.func.isRequired,
};

export default Boards;
