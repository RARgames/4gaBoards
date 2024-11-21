import React, { useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useForm } from '../../hooks';
import { Button, ButtonStyle, Popup, Input, Form, withPopup } from '../Utils';

import styles from './ProjectAddPopup.module.scss';
import gStyles from '../../globalStyles.module.scss';

const ProjectAddPopup = React.memo(({ defaultData, isSubmitting, onCreate, onClose }) => {
  const [t] = useTranslation();
  const nameField = useRef(null);
  const [data, handleFieldChange] = useForm(defaultData);

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
    };

    if (!cleanData.name) {
      nameField.current.select();
      return;
    }

    onCreate(cleanData);
    onClose();
  }, [data, onCreate, onClose]);

  const handleKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case 'Enter':
          handleSubmit();
          break;
        default:
      }
    },
    [handleSubmit],
  );

  useEffect(() => {
    nameField.current?.focus();
  }, []);

  return (
    <>
      <Popup.Header className={styles.header}>{t('common.addProject')}</Popup.Header>
      <Popup.Content className={styles.content}>
        <Form onSubmit={handleSubmit} className={styles.formWrapper} onKeyDown={handleKeyDown}>
          <Input ref={nameField} name="name" value={data.name} readOnly={isSubmitting} className={styles.field} onChange={handleFieldChange} />
          <div className={gStyles.controls}>
            <Button style={ButtonStyle.Submit} content={t('common.addProject')} disabled={isSubmitting} onClick={handleSubmit} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

ProjectAddPopup.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isSubmitting: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(ProjectAddPopup);
