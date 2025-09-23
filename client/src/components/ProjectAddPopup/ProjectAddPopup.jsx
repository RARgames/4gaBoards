import React, { useCallback, useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useForm } from '../../hooks';
import { Button, ButtonStyle, Popup, Input, InputStyle, Form, withPopup } from '../Utils';

import * as gs from '../../global.module.scss';

const ProjectAddPopup = React.memo(({ defaultData, isSubmitting, onCreate, onClose }) => {
  const [t] = useTranslation();
  const nameField = useRef(null);
  const [data, handleFieldChange] = useForm(defaultData);
  const [isError, setIsError] = useState(false);

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
    };

    if (!cleanData.name) {
      nameField.current?.focus();
      setIsError(true);
      return;
    }

    onCreate(cleanData);
    onClose();
  }, [data, onCreate, onClose]);

  const handleKeyDown = useCallback(
    (e) => {
      setIsError(false);
      switch (e.key) {
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
      <Popup.Header>{t('common.addProject')}</Popup.Header>
      <Popup.Content>
        <Form onKeyDown={handleKeyDown}>
          <Input ref={nameField} style={InputStyle.Default} name="name" placeholder={t('common.enterProjectName')} value={data.name} readOnly={isSubmitting} onChange={handleFieldChange} isError={isError} />
          <div className={gs.controls}>
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
