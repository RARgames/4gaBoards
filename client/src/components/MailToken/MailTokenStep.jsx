import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useSteps } from '../../hooks';
import DeleteStep from '../DeleteStep';
import { Button, ButtonStyle, Popup } from '../Utils';

import * as s from './MailTokenStep.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
};

const MailTokenStep = React.memo(({ mailToken, totalMailTokens, contextType, contextId, onGenerate, onReset, onDelete, onCopy, onBack }) => {
  const [step, openStep, handleBack] = useSteps();
  const [t] = useTranslation();

  const handleGenerateMailToken = useCallback(() => {
    if (contextType === 'list') {
      onGenerate();
    } else if (contextType === 'board') {
      onGenerate(contextId);
    }
  }, [contextType, contextId, onGenerate]);

  const handleResetMailToken = useCallback(() => {
    if (contextType === 'list') {
      onReset();
    } else if (contextType === 'board') {
      onReset(contextId);
    }
  }, [contextType, contextId, onReset]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE, { mailToken });
  }, [mailToken, openStep]);

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
        {t('common.mailTokenCount')} : {totalMailTokens}{' '}
      </Popup.Header>
      <Popup.Content className={s.content}>
        {mailToken && (
          <Button style={ButtonStyle.PopupContext} onClick={onCopy}>
            {t('action.copyMailToken')}
          </Button>
        )}
        <Button style={ButtonStyle.PopupContext} onClick={mailToken ? () => handleResetMailToken() : () => handleGenerateMailToken()}>
          {t(mailToken ? 'action.resetMailToken' : 'action.generateMailToken')}
        </Button>
        {mailToken && (
          <Button style={ButtonStyle.PopupContext} onClick={() => handleDeleteClick()}>
            {t('action.deleteMailToken')}
          </Button>
        )}
      </Popup.Content>
    </>
  );
});

MailTokenStep.propTypes = {
  mailToken: PropTypes.string,
  totalMailTokens: PropTypes.number.isRequired,
  contextType: PropTypes.oneOf(['list', 'board']).isRequired,
  contextId: PropTypes.string,
  onGenerate: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCopy: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

MailTokenStep.defaultProps = {
  mailToken: undefined,
  contextId: undefined,
  onBack: undefined,
};

export default MailTokenStep;
