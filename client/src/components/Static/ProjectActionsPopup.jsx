import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import PropTypes from 'prop-types';

import Paths from '../../constants/Paths';
import { useSteps } from '../../hooks';
import { BoardAddStep } from '../BoardAddPopup';
import RenameStep from '../RenameStep';
import { Button, ButtonStyle, Icon, IconType, IconSize, withPopup } from '../Utils';

import * as s from './ProjectActionsPopup.module.scss';

const StepTypes = {
  RENAME: 'RENAME',
  ADD: 'ADD',
};

const ProjectActionsStep = React.memo(({ sidebarRef, projectId, managedProjects, defaultDataRename, isAdmin, onUpdate, onBoardCreate, onClose }) => {
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();

  const handleSidebarScroll = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const sidebar = sidebarRef?.current;
    sidebar?.addEventListener('scroll', handleSidebarScroll);

    return () => {
      sidebar?.removeEventListener('scroll', handleSidebarScroll);
    };
  }, [handleSidebarScroll, sidebarRef]);

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
      <Button style={ButtonStyle.PopupContext} title={t('common.addBoard', { context: 'title' })} onClick={() => openStep(StepTypes.ADD)}>
        <Icon type={IconType.Plus} size={IconSize.Size13} className={s.icon} />
        {t('common.addBoard', { context: 'title' })}
      </Button>
    </>
  );
});

ProjectActionsStep.propTypes = {
  sidebarRef: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  projectId: PropTypes.string.isRequired,
  managedProjects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  defaultDataRename: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isAdmin: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onBoardCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(ProjectActionsStep);
