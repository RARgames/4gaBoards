import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';
import Paths from '../../constants/Paths';
import { ProjectBackgroundTypes } from '../../constants/Enums';
import ProjectAdd from './ProjectAdd';

import styles from './Projects.module.scss';
import gStyles from '../../globalStyles.module.scss';
import globalStyles from '../../styles.module.scss';

const Projects = React.memo(({ projects, filteredProjects, canAdd, isFiltered, defaultData, isSubmitting, onCreate }) => {
  const [t] = useTranslation();
  const projectAdd = useRef(null);

  const handleProjectAdd = useCallback(() => {
    if (canAdd) {
      projectAdd.current?.open();
    }
  }, [canAdd]);

  const getProjectsText = () => {
    if (!isFiltered) {
      return `${t('common.showing')} ${t('common.projects', { count: projects.length, context: 'title' })}`;
    }
    return `${t('common.showing')} ${filteredProjects.length} ${t('common.ofProjects', { count: projects.length, context: 'title' })} `;
  };

  const getBoardsText = () => {
    const boardsCount = filteredProjects.reduce((sum, project) => sum + (project.boards ? project.boards.length : 0), 0);
    return `[${t('common.boards', { count: boardsCount, context: 'title' })}]`;
  };

  return (
    <div className={classNames(styles.wrapper, gStyles.scrollableY)}>
      <div className={styles.header}>
        <span>{getProjectsText()}</span> <span className={styles.headerDetails}>{getBoardsText()}</span>
      </div>
      <div className={classNames(styles.projectsWrapper)}>
        {filteredProjects.map((item) => (
          <div
            key={item.id}
            className={classNames(
              styles.projectWrapper,
              item.background && item.background.type === ProjectBackgroundTypes.GRADIENT && globalStyles[`background${upperFirst(camelCase(item.background.name))}`],
            )}
            style={{
              background: item.background && item.background.type === 'image' && `url("${item.backgroundImage.coverUrl}") center / cover`,
            }}
          >
            {item.notificationsTotal > 0 && <span className={styles.notification}>{item.notificationsTotal}</span>}
            <Link to={Paths.PROJECTS.replace(':id', item.id)}>
              <div className={styles.project}>
                <div title={item.name} className={styles.projectTitle}>
                  {item.name}
                </div>
              </div>
            </Link>
          </div>
        ))}
        {canAdd && (
          <ProjectAdd ref={projectAdd} defaultData={defaultData} isSubmitting={isSubmitting} onCreate={onCreate}>
            <Button style={ButtonStyle.Icon} title={t('common.createProject')} onClick={handleProjectAdd} className={classNames(styles.projectWrapper, styles.add)}>
              <Icon type={IconType.Plus} size={IconSize.Size20} className={styles.addGridIcon} />
              {t('common.createProject')}
            </Button>
          </ProjectAdd>
        )}
      </div>
    </div>
  );
});

Projects.propTypes = {
  projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  filteredProjects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canAdd: PropTypes.bool.isRequired,
  isFiltered: PropTypes.bool.isRequired,
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isSubmitting: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default Projects;
