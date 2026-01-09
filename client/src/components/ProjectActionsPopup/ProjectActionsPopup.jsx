import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import PropTypes from 'prop-types';

import Paths from '../../constants/Paths';
import { useSteps } from '../../hooks';
import { ActivityStep } from '../ActivityPopup';
import { BoardAddStep } from '../BoardAddPopup';
import RenameStep from '../RenameStep';
import { Button, ButtonStyle, Icon, IconType, IconSize, withPopup } from '../Utils';

import * as s from './ProjectActionsPopup.module.scss';

const StepTypes = {
  RENAME: 'RENAME',
  ADD: 'ADD',
  ACTIVITY: 'ACTIVITY',
};

const ProjectActionsStep = React.memo(
  ({
    activities,
    isActivitiesFetching,
    isAllActivitiesFetched,
    name,
    projectId,
    managedProjects,
    defaultDataRename,
    isAdmin,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
    memberships,
    onUpdate,
    onBoardCreate,
    onActivitiesFetch,
    onClose,
  }) => {
    const [t] = useTranslation();
    const [step, openStep, handleBack] = useSteps();

    if (step) {
      switch (step.type) {
        case StepTypes.RENAME:
          return (
            <RenameStep
              title={t('common.renameProject', { context: 'title' })}
              defaultData={defaultDataRename}
              placeholder={t('common.enterProjectName')}
              onUpdate={onUpdate}
              onBack={handleBack}
              onClose={onClose}
            />
          );
        case StepTypes.ADD:
          return <BoardAddStep projects={managedProjects} projectId={projectId} skipProjectDropdown isAdmin={isAdmin} onCreate={onBoardCreate} onBack={handleBack} onClose={onClose} />;
        case StepTypes.ACTIVITY:
          return (
            <ActivityStep
              title={t('common.activityFor', { name })}
              createdAt={createdAt}
              createdBy={createdBy}
              updatedAt={updatedAt}
              updatedBy={updatedBy}
              memberships={memberships}
              isNotMemberTitle={t('common.noLongerProjectMember')}
              activities={activities}
              isFetching={isActivitiesFetching}
              isAllFetched={isAllActivitiesFetched}
              hideProjectDetails
              onFetch={onActivitiesFetch}
              onBack={handleBack}
              onClose={onClose}
            />
          );
        default:
      }
    }

    return (
      <>
        <Button style={ButtonStyle.PopupContext} title={t('common.renameProject', { context: 'title' })} onClick={() => openStep(StepTypes.RENAME)}>
          <Icon type={IconType.Pencil} size={IconSize.Size13} className={s.icon} />
          {t('common.renameProject', { context: 'title' })}
        </Button>
        <Link to={Paths.SETTINGS_PROJECT.replace(':id', projectId)}>
          <Button style={ButtonStyle.PopupContext} title={t('common.projectSettings', { context: 'title' })}>
            <Icon type={IconType.ProjectSettings} size={IconSize.Size13} className={s.icon} />
            {t('common.projectSettings', { context: 'title' })}
          </Button>
        </Link>
        <Button style={ButtonStyle.PopupContext} title={t('common.checkActivity', { context: 'title' })} onClick={() => openStep(StepTypes.ACTIVITY)}>
          <Icon type={IconType.Activity} size={IconSize.Size13} className={s.icon} />
          {t('common.checkActivity', { context: 'title' })}
        </Button>
        <Button style={ButtonStyle.PopupContext} title={t('common.addBoard', { context: 'title' })} onClick={() => openStep(StepTypes.ADD)}>
          <Icon type={IconType.Plus} size={IconSize.Size13} className={s.icon} />
          {t('common.addBoard', { context: 'title' })}
        </Button>
      </>
    );
  },
);

ProjectActionsStep.propTypes = {
  activities: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isActivitiesFetching: PropTypes.bool.isRequired,
  isAllActivitiesFetched: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  projectId: PropTypes.string.isRequired,
  managedProjects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  defaultDataRename: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isAdmin: PropTypes.bool.isRequired,
  createdAt: PropTypes.instanceOf(Date),
  createdBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  updatedAt: PropTypes.instanceOf(Date),
  updatedBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  memberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onBoardCreate: PropTypes.func.isRequired,
  onActivitiesFetch: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

ProjectActionsStep.defaultProps = {
  createdAt: undefined,
  createdBy: undefined,
  updatedAt: undefined,
  updatedBy: undefined,
};

export default withPopup(ProjectActionsStep);
