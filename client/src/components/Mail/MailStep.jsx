import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useSteps } from '../../hooks';
import DeleteStep from '../DeleteStep';
import { Button, ButtonStyle, Popup } from '../Utils';

import * as s from './MailStep.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
};

const MailStep = React.memo(({ mailId, totalMails, contextType, contextId, onGenerate, onReset, onDelete, onCopy, onBack }) => {
  const [step, openStep, handleBack] = useSteps();
  const [t] = useTranslation();

  const handleGenerateMail = useCallback(() => {
    if (contextType === 'list') {
      onGenerate();
    } else if (contextType === 'board') {
      onGenerate(contextId);
    }
  }, [contextType, contextId, onGenerate]);

  const handleResetMail = useCallback(() => {
    if (contextType === 'list') {
      onReset();
    } else if (contextType === 'board') {
      onReset(contextId);
    }
  }, [contextType, contextId, onReset]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE, { mailId });
  }, [mailId, openStep]);

  if (step) {
    switch (step.type) {
      case StepTypes.DELETE:
        return (
          <DeleteStep
            title={t('common.deleteMailId_title', { context: 'title' })}
            content={t('common.areYouSureYouWantToDeleteThisMailId')}
            buttonContent={t('action.delete')}
            onConfirm={() => {
              onDelete(step.params.mailId);
              handleBack();
            }}
            onBack={handleBack}
          />
        );
      default:
    }
  }

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.mailIdCount')} : {totalMails}{' '}
      </Popup.Header>
      <Popup.Content className={s.content}>
        {mailId && (
          <Button style={ButtonStyle.PopupContext} onClick={onCopy}>
            {t('action.copyMailId')}
          </Button>
        )}
        <Button style={ButtonStyle.PopupContext} onClick={mailId ? () => handleResetMail() : () => handleGenerateMail()}>
          {t(mailId ? 'action.resetMailId' : 'action.generateMailId')}
        </Button>
        {mailId && (
          <Button style={ButtonStyle.PopupContext} onClick={() => handleDeleteClick()}>
            {t('action.deleteMailId')}
          </Button>
        )}
      </Popup.Content>
    </>
  );
});

MailStep.propTypes = {
  mailId: PropTypes.string,
  totalMails: PropTypes.number.isRequired,
  contextType: PropTypes.oneOf(['list', 'board']).isRequired,
  contextId: PropTypes.string,
  onGenerate: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCopy: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

MailStep.defaultProps = {
  mailId: undefined,
  contextId: undefined,
  onBack: undefined,
};

export default MailStep;
