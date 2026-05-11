import React, { useCallback, useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { dequal } from 'dequal';
import PropTypes from 'prop-types';

import { useForm } from '../../hooks';
import { Button, ButtonStyle, Popup, Form, TextArea, TextAreaStyle } from '../Utils';

import * as gs from '../../global.module.scss';

const RenameStep = React.memo(({ title, defaultData, placeholder, onUpdate, onBack, onClose }) => {
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

    if (!dequal(cleanData, defaultData)) {
      onUpdate(cleanData);
    }

    onClose();
  }, [data, defaultData, onClose, onUpdate]);

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
            maxRows={3}
            onFocus={handleFocus}
            isError={isError}
          />
          <div className={gs.controlsSpaceBetween}>
            <Button style={ButtonStyle.Cancel} content={t('action.cancel')} onClick={onClose} />
            <Button style={ButtonStyle.Submit} content={t('action.save')} onClick={handleSubmit} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

RenameStep.propTypes = {
  title: PropTypes.string.isRequired,
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  placeholder: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

RenameStep.defaultProps = {
  onBack: undefined,
};

export default RenameStep;
