import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';
import Paths from '../../constants/Paths';
import { ProjectBackgroundTypes } from '../../constants/Enums';
import ProjectAddPopup from '../ProjectAddPopup';

import * as s from './Projects.module.scss';
import * as gStyles from '../../globalStyles.module.scss';
import * as globalStyles from '../../styles.module.scss';

const Projects = React.memo(({ projects, filteredProjects, isFiltered, defaultData, isSubmitting, onCreate }) => {
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
  }, []);

  return (
    <div className={s.wrapper}>
      <div className={s.header}>
        <div ref={headerButtonGroupOffsetRef} />
        <div className={classNames(s.headerText)}>
          <span>{getProjectsText()}</span> <span className={s.headerDetails}>{getBoardsText()}</span>
        </div>
        <div ref={headerButtonGroupRef} className={s.headerButtonGroup}>
          <div className={s.headerButton}>
            <ProjectAddPopup defaultData={defaultData} isSubmitting={isSubmitting} onCreate={onCreate} offset={16} position="bottom">
              <Button style={ButtonStyle.NoBackground} title={t('common.addProject')} className={s.addButton}>
                <Icon type={IconType.Plus} size={IconSize.Size16} className={s.addButtonIcon} />
                {t('common.addProject')}
              </Button>
            </ProjectAddPopup>
          </div>
        </div>
      </div>
      <div className={classNames(s.projectsWrapper, gStyles.scrollableY)}>
        {filteredProjects.map((item) => (
          <div
            key={item.id}
            className={classNames(s.projectWrapper, item.background && item.background.type === ProjectBackgroundTypes.GRADIENT && globalStyles[`background${upperFirst(camelCase(item.background.name))}`])}
            style={{
              background: item.background && item.background.type === 'image' && `url("${item.backgroundImage.coverUrl}") center / cover`,
            }}
          >
            {item.notificationsTotal > 0 && <span className={s.notification}>{item.notificationsTotal}</span>}
            <Link to={Paths.PROJECTS.replace(':id', item.id)}>
              <div className={s.project}>
                <div title={item.name} className={s.projectTitle}>
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
  isFiltered: PropTypes.bool.isRequired,
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isSubmitting: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default Projects;
