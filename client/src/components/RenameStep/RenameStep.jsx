import React, { useCallback, useRef, useEffect } from 'react';
import { dequal } from 'dequal';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle, Popup, Form, TextArea } from '../Utils';
import { useForm } from '../../hooks';

import gStyles from '../../globalStyles.module.scss';

const RenameStep = React.memo(({ title, defaultData, onUpdate, onBack, onClose }) => {
  const [t] = useTranslation();
  const field = useRef(null);

  const [data, handleFieldChange] = useForm(() => ({
    name: '',
    ...defaultData,
  }));

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
    };

    if (!cleanData.name) {
      field.current.select();
      return;
    }

    if (!dequal(cleanData, defaultData)) {
      onUpdate(cleanData);
    }

    onClose();
  }, [data, defaultData, onClose, onUpdate]);

  const handleFieldKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case 'Enter': {
          event.preventDefault();
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
    field.current.focus();
  }, []);

  return (
    <>
      <Popup.Header onBack={onBack}>{title}</Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <TextArea ref={field} name="name" value={data.name} onChange={handleFieldChange} onKeyDown={handleFieldKeyDown} maxRows={3} />
          <div className={gStyles.controlsSpaceBetween}>
            <Button style={ButtonStyle.Cancel} content={t('action.cancel')} onClick={onClose} />
            <Button style={ButtonStyle.Submit} content={t('action.save')} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

RenameStep.propTypes = {
  title: PropTypes.string.isRequired,
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

RenameStep.defaultProps = {
  onBack: undefined,
};

export default RenameStep;
