import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useSteps } from '../../../hooks';
import DeleteStep from '../../DeleteStep';
import { Button, ButtonStyle, Icon, IconType, IconSize, Popup, withPopup } from '../../Utils';
import DocumentEditStep from './DocumentEditStep';

import * as s from './DocumentActionsPopup.module.scss';

const StepTypes = {
  EDIT: 'EDIT',
  DELETE: 'DELETE',
};

const DocumentActionsPopup = React.memo(({ document, folders, canDelete, onUpdate, onDelete, onClose }) => {
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();

  const handleEditClick = useCallback(() => {
    openStep(StepTypes.EDIT);
  }, [openStep]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  const handleDownloadClick = useCallback(() => {
    window.open(document.url, '_blank', 'noreferrer');
    onClose();
  }, [document.url, onClose]);

  const handleDelete = useCallback(() => {
    onDelete();
    onClose();
  }, [onClose, onDelete]);

  if (step) {
    switch (step.type) {
      case StepTypes.EDIT:
        return <DocumentEditStep document={document} folders={folders} onUpdate={onUpdate} onBack={handleBack} onClose={onClose} />;
      case StepTypes.DELETE:
        return (
          <DeleteStep
            title={t('common.deleteDocument', { context: 'title' })}
            content={t('common.areYouSureYouWantToDeleteThisDocument')}
            buttonContent={t('action.deleteDocument', { context: 'title' })}
            onConfirm={handleDelete}
            onBack={handleBack}
          />
        );
      default:
    }
  }

  return (
    <>
      <Popup.Header>{document.name}</Popup.Header>
      <Popup.Content>
        <Button style={ButtonStyle.PopupContext} content={t('action.editDocument', { context: 'title' })} onClick={handleEditClick} />
        <Button style={ButtonStyle.PopupContext} content={t('action.download', { context: 'title' })} onClick={handleDownloadClick} />
        {canDelete && (
          <>
            <Popup.Separator />
            <Button style={ButtonStyle.PopupContext} onClick={handleDeleteClick}>
              <Icon type={IconType.Trash} size={IconSize.Size13} className={s.icon} />
              {t('action.deleteDocument', { context: 'title' })}
            </Button>
          </>
        )}
      </Popup.Content>
    </>
  );
});

DocumentActionsPopup.propTypes = {
  document: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  folders: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canDelete: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(DocumentActionsPopup);
