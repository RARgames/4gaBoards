import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useSteps } from '../../hooks';
import { useToggle } from '../../lib/hooks';
import { Button, ButtonStyle, Popup, Form, Checkbox } from '../Utils';
import ExportConfirmationStep from './ExportConfirmationStep';

import * as gs from '../../global.module.scss';
import * as s from './ExportStep.module.scss';

const StepTypes = {
  EXPORT_CONFIRMATION: 'EXPORT_CONFIRMATION',
};

const ExportStep = React.memo(({ title, onExport, onBack, onClose }) => {
  const [t] = useTranslation();

  const [skipAttachments, toggleSkipAttachments] = useToggle(false);
  const [skipUserAvatars, toggleSkipUserAvatars] = useToggle(false);
  const [skipProjectBackgrounds, toggleSkipProjectBackgrounds] = useToggle(false);
  const [skipMetadata, toggleSkipMetadata] = useToggle(false);
  const [skipActions, toggleSkipActions] = useToggle(true);
  const [step, openStep, handleBack] = useSteps();

  const handleSubmit = useCallback(() => {
    const data = {
      skipAttachments,
      skipUserAvatars,
      skipProjectBackgrounds,
      skipMetadata,
      skipActions,
    };

    onExport(data);
    openStep(StepTypes.EXPORT_CONFIRMATION);
  }, [skipAttachments, skipUserAvatars, skipProjectBackgrounds, skipMetadata, skipActions, onExport, openStep]);

  const handleFormKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case 'Enter': {
          handleSubmit();
          break;
        }
        default:
      }
    },
    [handleSubmit],
  );

  if (step && step.type === StepTypes.EXPORT_CONFIRMATION) {
    return <ExportConfirmationStep title={t('common.exportBoard', { context: 'title' })} onBack={handleBack} onClose={onClose} />;
  }

  return (
    <>
      <Popup.Header onBack={onBack}>{title}</Popup.Header>
      <Popup.Content>
        <Form onKeyDown={handleFormKeyDown}>
          <div className={s.wrapper}>
            <Checkbox checked={skipAttachments} label={t('common.exportSkipAttachments')} onChange={toggleSkipAttachments} wrapperClassName={s.checkboxWrapper} />
            <Checkbox checked={skipUserAvatars} label={t('common.exportSkipUserAvatars')} onChange={toggleSkipUserAvatars} wrapperClassName={s.checkboxWrapper} />
            <Checkbox checked={skipProjectBackgrounds} label={t('common.exportSkipProjectBackgrounds')} onChange={toggleSkipProjectBackgrounds} wrapperClassName={s.checkboxWrapper} />
            <Checkbox checked={skipMetadata} label={t('common.exportSkipMetadata')} onChange={toggleSkipMetadata} wrapperClassName={s.checkboxWrapper} />
            <Checkbox checked={skipActions} label={t('common.exportSkipActions')} onChange={toggleSkipActions} wrapperClassName={s.checkboxWrapper} />
          </div>
          <div className={gs.controls}>
            <Button style={ButtonStyle.Submit} content={t('common.exportBoard', { context: 'title' })} className={s.submitButton} onClick={handleSubmit} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

ExportStep.propTypes = {
  title: PropTypes.string.isRequired,
  onExport: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

ExportStep.defaultProps = {
  onBack: undefined,
};

export default ExportStep;
