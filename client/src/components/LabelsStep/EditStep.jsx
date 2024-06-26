import { dequal } from 'dequal';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle, Popup, Form } from '../Utils';

import { useForm, useSteps } from '../../hooks';
import LabelColors from '../../constants/LabelColors';
import Editor from './Editor';
import DeleteStep from '../DeleteStep';

import gStyles from '../../globalStyles.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
};

const EditStep = React.memo(({ defaultData, onUpdate, onDelete, onBack }) => {
  const [t] = useTranslation();

  const [data, handleFieldChange] = useForm(() => ({
    color: LabelColors[0],
    ...defaultData,
    name: defaultData.name || '',
  }));

  const [step, openStep, handleBack] = useSteps();

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim() || null,
    };

    if (!dequal(cleanData, defaultData)) {
      onUpdate(cleanData);
    }

    onBack();
  }, [defaultData, data, onUpdate, onBack]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  if (step && step.type === StepTypes.DELETE) {
    return (
      <DeleteStep
        title={t('common.deleteLabel', { context: 'title' })}
        content={t('common.areYouSureYouWantToDeleteThisLabel')}
        buttonContent={t('action.deleteLabel')}
        onConfirm={onDelete}
        onBack={handleBack}
      />
    );
  }

  return (
    <>
      <Popup.Header onBack={onBack}>{t('common.editLabel', { context: 'title' })}</Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <Editor data={data} onFieldChange={handleFieldChange} />
          <div className={gStyles.controlsSpaceBetween}>
            <Button style={ButtonStyle.Cancel} content={t('action.delete')} onClick={handleDeleteClick} />
            <Button style={ButtonStyle.Submit} content={t('action.save')} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

EditStep.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default EditStep;
