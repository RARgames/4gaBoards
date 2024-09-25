import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';
import Paths from '../../constants/Paths';
import { ProjectBackgroundTypes } from '../../constants/Enums';
import ProjectAddPopup from '../ProjectAddPopup';

import styles from './Projects.module.scss';
import gStyles from '../../globalStyles.module.scss';
import globalStyles from '../../styles.module.scss';

const Projects = React.memo(({ projects, filteredProjects, isAdmin, isFiltered, defaultData, isSubmitting, onCreate }) => {
  const [t] = useTranslation();
  const headerButtonGroupRef = useRef(null);
  const headerButtonGroupOffsetRef = useRef(null);

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

  useEffect(() => {
    if (headerButtonGroupRef.current) {
      headerButtonGroupOffsetRef.current.style.width = `${headerButtonGroupRef.current.offsetWidth}px`;
    }
  }, [isAdmin]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div ref={headerButtonGroupOffsetRef} />
        <div className={classNames(styles.headerText)}>
          <span>{getProjectsText()}</span> <span className={styles.headerDetails}>{getBoardsText()}</span>
        </div>
        <div ref={headerButtonGroupRef} className={styles.headerButtonGroup}>
          {isAdmin && (
            <div className={styles.headerButton}>
              <ProjectAddPopup defaultData={defaultData} isSubmitting={isSubmitting} onCreate={onCreate} offset={16} position="bottom">
                <Button style={ButtonStyle.NoBackground} title={t('common.addProject')} className={styles.addButton}>
                  <Icon type={IconType.Plus} size={IconSize.Size16} className={styles.addButtonIcon} />
                  {t('common.addProject')}
                </Button>
              </ProjectAddPopup>
            </div>
          )}
        </div>
      </div>
      <div className={classNames(styles.projectsWrapper, gStyles.scrollableY)}>
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
      </div>
    </div>
  );
});

Projects.propTypes = {
  projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  filteredProjects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isAdmin: PropTypes.bool.isRequired,
  isFiltered: PropTypes.bool.isRequired,
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isSubmitting: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default Projects;
