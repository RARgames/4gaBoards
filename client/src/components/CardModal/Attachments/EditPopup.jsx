import { dequal } from 'dequal';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { Button, ButtonStyle, Form, Input, InputStyle, Popup, withPopup } from '../../Utils';
import { useForm } from '../../../hooks';

import * as gStyles from '../../../globalStyles.module.scss';

const EditStep = React.memo(({ defaultData, onUpdate, onClose }) => {
  const [t] = useTranslation();
  const [isError, setIsError] = useState(false);

  const [data, handleFieldChange] = useForm(() => ({
    name: '',
    ...defaultData,
  }));

  const nameField = useRef(null);

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
    };

    if (!cleanData.name) {
      nameField.current.focus();
      setIsError(true);
      return;
    }

    if (!dequal(cleanData, defaultData)) {
      onUpdate(cleanData);
    }

    onClose();
  }, [defaultData, onUpdate, onClose, data]);

  const handleFieldKeyDown = useCallback(() => {
    setIsError(false);
  }, []);

  useEffect(() => {
    nameField.current.focus();
  }, []);

  return (
    <>
      <Popup.Header>{t('common.editAttachmentName')}</Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <Input
            ref={nameField}
            style={InputStyle.DefaultLast}
            name="name"
            value={data.name}
            placeholder={t('common.enterAttachmentName')}
            onKeyDown={handleFieldKeyDown}
            onChange={handleFieldChange}
            isError={isError}
          />
          <div className={gStyles.controls}>
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
  onClose: PropTypes.func.isRequired,
};

export default withPopup(EditStep);
