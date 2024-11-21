import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle, Input, Form, withModal } from '../../Utils';
import { useForm } from '../../../hooks';

import styles from './TextFileAddModal.module.scss';
import gStyles from '../../../globalStyles.module.scss';

const TextFileAddModal = React.memo(({ content, onCreate, onClose }) => {
  const [t] = useTranslation();

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
      nameField.current.select();
      return;
    }

    const file = new File([content], `${cleanData.name}.txt`, {
      type: 'plain/text',
    });

    onCreate(file);
    onClose();
  }, [content, onCreate, onClose, data]);

  useEffect(() => {
    nameField.current.focus();
  }, []);

  return (
    <>
      <div className={styles.title}>{t('common.createTextFile', { context: 'title' })}</div>
      <div className={styles.text}>{t('common.enterFilename')}</div>
      <Form onSubmit={handleSubmit} className={styles.form}>
        <Input ref={nameField} name="name" value={data.name} className={styles.field} onChange={handleFieldChange} />
        <div className={styles.inputLabel}>.txt</div>
        <div className={gStyles.controls}>
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
