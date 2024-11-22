import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle, Icon, IconType, IconSize, Popup, withPopup } from '../Utils';

import { useSteps } from '../../hooks';
import DeleteStep from '../DeleteStep';

import * as styles from './ActionsPopup.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
};

// eslint-disable-next-line no-unused-vars
const ActionsStep = React.memo(({ onNameEdit, onCardAdd, onDelete, onClose }) => {
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();

  const handleEditNameClick = useCallback(() => {
    onNameEdit();
  }, [onNameEdit]);

  const handleAddCardClick = useCallback(() => {
    onCardAdd();
  }, [onCardAdd]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  if (step && step.type === StepTypes.DELETE) {
    return (
      <DeleteStep title={t('common.deleteList', { context: 'title' })} content={t('common.areYouSureYouWantToDeleteThisList')} buttonContent={t('action.deleteList')} onConfirm={onDelete} onBack={handleBack} />
    );
  }

  return (
    <>
      <Button style={ButtonStyle.PopupContext} content={t('action.editTitle', { context: 'title' })} onClick={handleEditNameClick} />
      <Button style={ButtonStyle.PopupContext} content={t('action.addCard', { context: 'title' })} onClick={handleAddCardClick} />
      <Popup.Separator />
      <Button style={ButtonStyle.PopupContext} title={t('action.deleteList', { context: 'title' })} onClick={handleDeleteClick}>
        <Icon type={IconType.Trash} size={IconSize.Size13} className={styles.icon} />
        {t('action.deleteList', { context: 'title' })}
      </Button>
    </>
  );
});

ActionsStep.propTypes = {
  onNameEdit: PropTypes.func.isRequired,
  onCardAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(ActionsStep);
