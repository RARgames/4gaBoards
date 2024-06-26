import { dequal } from 'dequal';
import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle, Form, Input, Popup, withPopup } from '../../Utils';

import { useForm, useSteps } from '../../../hooks';
import DeleteStep from '../../DeleteStep';

import styles from './EditPopup.module.scss';
import gStyles from '../../../globalStyles.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
};

const EditStep = React.memo(({ defaultData, onUpdate, onDelete, onClose }) => {
  const [t] = useTranslation();

  const [data, handleFieldChange] = useForm(() => ({
    name: '',
    ...defaultData,
  }));

  const [step, openStep, handleBack] = useSteps();

  const nameField = useRef(null);

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
    };

    if (!cleanData.name) {
      nameField.current.select();
      return;
    }

    if (!dequal(cleanData, defaultData)) {
      onUpdate(cleanData);
    }

    onClose();
  }, [defaultData, onUpdate, onClose, data]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  useEffect(() => {
    nameField.current.select();
  }, []);

  if (step && step.type === StepTypes.DELETE) {
    return (
      <DeleteStep
        title={t('common.deleteAttachment', { context: 'title' })}
        content={t('common.areYouSureYouWantToDeleteThisAttachment')}
        buttonContent={t('action.deleteAttachment')}
        onConfirm={onDelete}
        onBack={handleBack}
      />
    );
  }

  return (
    <>
      <Popup.Header>{t('common.editAttachment', { context: 'title' })}</Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <div className={styles.text}>{t('common.title')}</div>
          <Input ref={nameField} name="name" value={data.name} className={styles.field} onChange={handleFieldChange} />
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
  onClose: PropTypes.func.isRequired,
};

export default withPopup(EditStep);
