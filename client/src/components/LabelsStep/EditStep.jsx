import React, { useCallback, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { dequal } from 'dequal';
import PropTypes from 'prop-types';

import LabelColors from '../../constants/LabelColors';
import { useForm, useSteps } from '../../hooks';
import DeleteStep from '../DeleteStep';
import { Button, ButtonStyle, Popup, Form } from '../Utils';
import Editor from './Editor';

import * as gs from '../../global.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
};

const EditStep = React.memo(({ defaultData, onUpdate, onDelete, onBack }) => {
  const [t] = useTranslation();
  const [isError, setIsError] = useState(false);
  const editorRef = useRef(null);

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

    if (!cleanData.name) {
      setIsError(true);
      editorRef.current?.focus();
      return;
    }

    if (!dequal(cleanData, defaultData)) {
      onUpdate(cleanData);
    }

    onBack();
  }, [defaultData, data, onUpdate, onBack]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  const handleKeyDown = useCallback(
    (e) => {
      setIsError(false);
      switch (e.key) {
        case 'Enter': {
          handleSubmit();
          break;
        }
        case 'Escape': {
          e.stopPropagation(); // TODO Prevent closing whole popup - change how popup handles key input
          onBack();
          break;
        }
        default:
      }
    },
    [handleSubmit, onBack],
  );

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
      <Popup.Content isMinContent>
        <Form onKeyDown={handleKeyDown}>
          <Editor ref={editorRef} data={data} onFieldChange={handleFieldChange} isError={isError} />
          <div className={gs.controlsSpaceBetween}>
            <Button style={ButtonStyle.Cancel} content={t('action.delete')} onClick={handleDeleteClick} />
            <Button style={ButtonStyle.Submit} content={t('action.save')} onClick={handleSubmit} />
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
