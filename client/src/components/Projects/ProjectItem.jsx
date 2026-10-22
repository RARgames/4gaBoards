import React, { useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import clsx from 'clsx';
import camelCase from 'lodash/camelCase';
import pick from 'lodash/pick';
import upperFirst from 'lodash/upperFirst';
import PropTypes from 'prop-types';

import { ProjectBackgroundTypes } from '../../constants/Enums';
import Paths from '../../constants/Paths';
import ProjectActionsPopup from '../ProjectActionsPopup';
import { Button, ButtonVariant, Icon, IconType, IconSize } from '../Utils';

import * as bs from '../../backgrounds.module.scss';
import * as s from './ProjectItem.module.scss';

const ProjectItem = React.memo(({ item, managedProjects, boardTemplates, isAdmin, rightClickContextMenu, onUpdate, onBoardCreate, onBoardTemplateUpdate, onBoardTemplateDelete, onActivitiesProjectFetch }) => {
  const [t] = useTranslation();
  const projectActionsPopupRef = useRef(null);

  const handleContextMenu = useCallback(
    (e) => {
      if (!rightClickContextMenu) {
        return;
      }

      e.preventDefault();
      projectActionsPopupRef.current?.open();
    },
    [rightClickContextMenu],
  );

  return (
    <div
      className={clsx(s.projectWrapper, item.background && item.background.type === ProjectBackgroundTypes.GRADIENT && bs[`background${upperFirst(camelCase(item.background.name))}`])}
      style={{
        background: item.background && item.background.type === 'image' && `url("${item.backgroundImage.coverUrl}") center / cover`,
      }}
      onContextMenu={handleContextMenu}
    >
      {item.notificationsTotal > 0 && <span className={s.notification}>{item.notificationsTotal}</span>}
      <Link to={Paths.PROJECTS.replace(':id', item.id)}>
        <div className={s.project}>
          <div title={item.name} className={s.projectTitle}>
            {item.name}
          </div>
        </div>
      </Link>
      <ProjectActionsPopup
        ref={projectActionsPopupRef}
        activities={item.activities}
        isActivitiesFetching={item.isActivitiesFetching}
        isAllActivitiesFetched={item.isAllActivitiesFetched}
        lastActivityId={item.lastActivityId}
        name={item.name}
        projectId={item.id}
        managedProjects={managedProjects}
        defaultDataRename={pick(item, 'name')}
        isAdmin={isAdmin}
        createdAt={item.createdAt}
        createdBy={item.createdBy}
        updatedAt={item.updatedAt}
        updatedBy={item.updatedBy}
        memberships={item.memberships}
        templates={boardTemplates}
        isProjectManager={managedProjects.some((p) => p.id === item.id)}
        onUpdate={(data) => onUpdate(item.id, data)}
        onBoardCreate={onBoardCreate}
        onTemplateUpdate={onBoardTemplateUpdate}
        onTemplateDelete={onBoardTemplateDelete}
        onActivitiesFetch={() => onActivitiesProjectFetch(item.id)}
        position="right-start"
        offset={10}
        hideCloseButton
        wrapperClassName={s.projectActionsWrapper}
      >
        <Button variant={ButtonVariant.IconCentered} title={t('common.editProject', { context: 'title' })} className={s.hoverButton}>
          <Icon type={IconType.EllipsisVertical} size={IconSize.Size13} />
        </Button>
      </ProjectActionsPopup>
    </div>
  );
});

ProjectItem.propTypes = {
  item: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  managedProjects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  boardTemplates: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isAdmin: PropTypes.bool.isRequired,
  rightClickContextMenu: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onBoardCreate: PropTypes.func.isRequired,
  onBoardTemplateUpdate: PropTypes.func.isRequired,
  onBoardTemplateDelete: PropTypes.func.isRequired,
  onActivitiesProjectFetch: PropTypes.func.isRequired,
};

export default ProjectItem;
