import React, { useCallback, useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useForm } from '../../hooks';
import { Button, ButtonVariant, Popup, Form, TextArea, TextAreaStyle } from '../Utils';

import * as gs from '../../global.module.scss';

const BoardTemplateAddStep = React.memo(({ title, defaultData, placeholder, onUpdate, onBack, onClose }) => {
  const [t] = useTranslation();
  const field = useRef(null);
  const [isError, setIsError] = useState(false);

  const [data, handleFieldChange, , handleFocus] = useForm(() => ({
    name: '',
    ...defaultData,
  }));

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
    };

    if (!cleanData.name) {
      field.current?.focus();
      setIsError(true);
      return;
    }

    onUpdate(cleanData);
    onClose();
  }, [data, onClose, onUpdate]);

  const handleFieldKeyDown = useCallback(
    (e) => {
      setIsError(false);
      switch (e.key) {
        case 'Enter': {
          e.preventDefault(); // Prevent adding new line in TextArea
          handleSubmit();
          break;
        }
        case 'Escape': {
          onClose();
          break;
        }
        default:
      }
    },
    [handleSubmit, onClose],
  );

  useEffect(() => {
    field.current?.focus();
  }, []);

  return (
    <>
      <Popup.Header onBack={onBack}>{title}</Popup.Header>
      <Popup.Content>
        <Form>
          <TextArea
            ref={field}
            style={TextAreaStyle.Default}
            name="name"
            placeholder={placeholder}
            value={data.name}
            onChange={handleFieldChange}
            onKeyDown={handleFieldKeyDown}
            maxRows={1}
            onFocus={handleFocus}
            isError={isError}
          />
          <div className={gs.controlsSpaceBetween}>
            <Button variant={ButtonVariant.Cancel} content={t('action.cancel')} onClick={onClose} />
            <Button variant={ButtonVariant.Submit} content={t('action.save')} onClick={handleSubmit} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

BoardTemplateAddStep.propTypes = {
  title: PropTypes.string.isRequired,
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  placeholder: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

BoardTemplateAddStep.defaultProps = {
  onBack: undefined,
};

export default BoardTemplateAddStep;
