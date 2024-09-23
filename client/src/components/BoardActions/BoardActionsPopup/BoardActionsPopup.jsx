import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle, Icon, IconType, IconSize, Popup, withPopup } from '../../Utils';

import { useSteps } from '../../../hooks';
import DeleteStep from '../../DeleteStep';
import RenameStep from '../../RenameStep';
import { ConnectionsStep } from '../Connections';

import styles from './BoardActionsPopup.module.scss';

const StepTypes = {
  RENAME: 'RENAME',
  GITHUB: 'GITHUB',
  DELETE: 'DELETE',
};

const BoardActionsStep = React.memo(({ defaultDataRename, defaultDataGithub, onUpdate, onDelete, onClose }) => {
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();

  if (step) {
    switch (step.type) {
      case StepTypes.RENAME:
        return <RenameStep title={t('common.renameBoard', { context: 'title' })} defaultData={defaultDataRename} onUpdate={onUpdate} onBack={handleBack} onClose={onClose} />;
      case StepTypes.GITHUB:
        return <ConnectionsStep defaultData={defaultDataGithub} onUpdate={onUpdate} onBack={handleBack} onClose={onClose} />;
      case StepTypes.DELETE:
        return (
          <DeleteStep
            title={t('common.deleteBoard', { context: 'title' })}
            content={t('common.areYouSureYouWantToDeleteThisBoard')}
            buttonContent={t('common.deleteBoard', { context: 'title' })}
            onConfirm={onDelete}
            onBack={handleBack}
          />
        );
      default:
    }
  }

  return (
    <>
      <Button style={ButtonStyle.PopupContext} title={t('common.renameBoard', { context: 'title' })} onClick={() => openStep(StepTypes.RENAME)}>
        <Icon type={IconType.Pencil} size={IconSize.Size13} className={styles.icon} />
        {t('common.renameBoard', { context: 'title' })}
      </Button>
      <Button style={ButtonStyle.PopupContext} title={t('common.connections', { context: 'title' })} onClick={() => openStep(StepTypes.GITHUB)}>
        <Icon type={IconType.Github} size={IconSize.Size13} className={styles.icon} />
        {t('common.connections', { context: 'title' })}
      </Button>
      <Popup.Separator />
      <Button style={ButtonStyle.PopupContext} title={t('common.deleteBoard', { context: 'title' })} onClick={() => openStep(StepTypes.DELETE)}>
        <Icon type={IconType.Trash} size={IconSize.Size13} className={styles.icon} />
        {t('common.deleteBoard', { context: 'title' })}
      </Button>
    </>
  );
});

BoardActionsStep.propTypes = {
  defaultDataRename: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  defaultDataGithub: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(BoardActionsStep);
