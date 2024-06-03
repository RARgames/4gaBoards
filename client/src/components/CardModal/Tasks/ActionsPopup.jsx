import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle, Icon, IconType, IconSize, Popup, withPopup } from '../../Utils';

import { useSteps } from '../../../hooks';
import DeleteStep from '../../DeleteStep';

import styles from './ActionsPopup.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
};

// eslint-disable-next-line no-unused-vars
const ActionsStep = React.memo(({ onNameEdit, onDelete, onClose }) => {
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();

  const handleEditNameClick = useCallback(() => {
    onNameEdit();
  }, [onNameEdit]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  if (step && step.type === StepTypes.DELETE) {
    return (
      <DeleteStep
        title={t('common.deleteTask', { context: 'title' })}
        content={t('common.areYouSureYouWantToDeleteThisTask')}
        buttonContent={t('action.deleteTask')}
        onConfirm={onDelete}
        onBack={handleBack}
      />
    );
  }

  return (
    <>
      <Button style={ButtonStyle.Popup} title={t('action.editDescription', { context: 'title' })} onClick={handleEditNameClick}>
        <Icon type={IconType.Pencil} size={IconSize.Size13} className={styles.icon} />
        {t('action.editDescription', { context: 'title' })}
      </Button>
      <Popup.Separator />
      <Button style={ButtonStyle.Popup} title={t('action.deleteTask', { context: 'title' })} onClick={handleDeleteClick}>
        <Icon type={IconType.Trash} size={IconSize.Size13} className={styles.icon} />
        {t('action.deleteTask', { context: 'title' })}
      </Button>
    </>
  );
});

ActionsStep.propTypes = {
  onNameEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(ActionsStep);
