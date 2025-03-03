import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useForm } from '../../../hooks';
import { Button, ButtonStyle, Input, InputStyle, Form, withModal } from '../../Utils';

import * as gs from '../../../globalStyles.module.scss';
import * as s from './TextFileAddModal.module.scss';

const TextFileAddModal = React.memo(({ content, onCreate, onClose }) => {
  const [t] = useTranslation();
  const [isError, setIsError] = useState(false);

  const [data, handleFieldChange] = useForm(() => ({
    name: '',
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

    const file = new File([content], `${cleanData.name}.txt`, {
      type: 'plain/text',
    });

    onCreate(file);
    onClose();
  }, [content, onCreate, onClose, data]);

  const handleFieldKeyDown = useCallback(() => {
    setIsError(false);
  }, []);

  useEffect(() => {
    nameField.current.focus();
  }, []);

  return (
    <>
      <div className={s.title}>{t('common.createTextFile', { context: 'title' })}</div>
      <Form className={s.form}>
        <Input
          ref={nameField}
          style={InputStyle.Default}
          placeholder={t('common.enterFileName')}
          name="name"
          value={data.name}
          className={s.field}
          onKeyDown={handleFieldKeyDown}
          onChange={handleFieldChange}
          isError={isError}
        />
        <div className={s.inputLabel}>.txt</div>
        <div className={gs.controls}>
          <Button style={ButtonStyle.Submit} content={t('action.createFile')} onClick={handleSubmit} />
        </div>
      </Form>
    </>
  );
});

TextFileAddModal.propTypes = {
  content: PropTypes.string.isRequired,
  onCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withModal(TextFileAddModal);
