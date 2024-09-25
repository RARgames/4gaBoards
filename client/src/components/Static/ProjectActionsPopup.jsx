import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, ButtonStyle, Icon, IconType, IconSize, withPopup } from '../Utils';
import Paths from '../../constants/Paths';
import { useSteps } from '../../hooks';
import RenameStep from '../RenameStep';
import { BoardAddStep } from '../BoardAddPopup';

import styles from './ProjectActionsPopup.module.scss';

const StepTypes = {
  RENAME: 'RENAME',
  ADD: 'ADD',
};

const ProjectActionsStep = React.memo(({ projectId, managedProjects, defaultDataRename, onUpdate, onBoardCreate, onClose }) => {
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();

  if (step) {
    switch (step.type) {
      case StepTypes.RENAME:
        return <RenameStep title={t('common.renameProject', { context: 'title' })} defaultData={defaultDataRename} onUpdate={onUpdate} onBack={handleBack} onClose={onClose} />;
      case StepTypes.ADD:
        return <BoardAddStep projects={managedProjects} projectId={projectId} skipProjectDropdown onCreate={onBoardCreate} onBack={handleBack} onClose={onClose} />;
      default:
    }
  }

  return (
    <>
      <Button style={ButtonStyle.PopupContext} title={t('common.renameProject', { context: 'title' })} onClick={() => openStep(StepTypes.RENAME)}>
        <Icon type={IconType.Pencil} size={IconSize.Size13} className={styles.icon} />
        {t('common.renameProject', { context: 'title' })}
      </Button>
      <Link to={Paths.SETTINGS_PROJECT.replace(':id', projectId)}>
        <Button style={ButtonStyle.PopupContext} title={t('common.projectSettings', { context: 'title' })}>
          <Icon type={IconType.ProjectSettings} size={IconSize.Size13} className={styles.icon} />
          {t('common.projectSettings', { context: 'title' })}
        </Button>
      </Link>
      <Button style={ButtonStyle.PopupContext} title={t('common.addBoard', { context: 'title' })} onClick={() => openStep(StepTypes.ADD)}>
        <Icon type={IconType.Plus} size={IconSize.Size13} className={styles.icon} />
        {t('common.addBoard', { context: 'title' })}
      </Button>
    </>
  );
});

ProjectActionsStep.propTypes = {
  projectId: PropTypes.string.isRequired,
  managedProjects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  defaultDataRename: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onBoardCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(ProjectActionsStep);
