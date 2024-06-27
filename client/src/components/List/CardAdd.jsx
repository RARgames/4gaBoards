import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useDidUpdate, useToggle } from '../../lib/hooks';
import { Button, ButtonStyle, Form, TextArea } from '../Utils';

import { useClosableForm, useForm } from '../../hooks';

import styles from './CardAdd.module.scss';
import gStyles from '../../globalStyles.module.scss';

const DEFAULT_DATA = {
  name: '',
};

// eslint-disable-next-line no-unused-vars
const CardAdd = React.memo(({ isOpen, onCreate, onClose, labelIds, memberIds }) => {
  const [t] = useTranslation();
  const [data, handleFieldChange, setData] = useForm(DEFAULT_DATA);
  const [focusNameFieldState, focusNameField] = useToggle();
  const nameField = useRef(null);

  const close = useCallback(() => {
    setData(DEFAULT_DATA);
    onClose();
  }, [onClose, setData]);

  const [handleFieldBlur, handleControlMouseOver, handleControlMouseOut, handleValueChange, handleClearModified] = useClosableForm(close);

  const submit = useCallback(
    (autoOpen) => {
      const cleanData = {
        ...data,
        name: data.name.trim(),
        // TODO remove example - how to submit
        // labelIds: ['895796152710988857', '907861629801072269', '920273931925980818'],
        // userIds: ['895703383690707969'],
      };

      if (!cleanData.name) {
        setData(DEFAULT_DATA);
        focusNameField();
        return;
      }

      onCreate(cleanData, autoOpen);
      setData(DEFAULT_DATA);
      handleClearModified();

      if (autoOpen) {
        onClose();
      } else {
        focusNameField();
      }
    },
    [data, onCreate, setData, handleClearModified, onClose, focusNameField],
  );

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  const handleCancel = useCallback(() => {
    setData(DEFAULT_DATA);
    handleClearModified();
    onClose();
  }, [handleClearModified, onClose, setData]);

  const handleFieldKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case 'Enter': {
          event.preventDefault();
          const autoOpen = event.ctrlKey;
          submit(autoOpen);
          break;
        }
        case 'Escape': {
          handleCancel();
          break;
        }
        default:
      }
    },
    [submit, handleCancel],
  );

  useEffect(() => {
    if (isOpen) {
      nameField.current.focus();
    }
  }, [isOpen]);

  useDidUpdate(() => {
    nameField.current.focus();
  }, [focusNameFieldState]);

  const handleChange = useCallback(
    (event) => {
      handleFieldChange(event);
      handleValueChange(event, DEFAULT_DATA.name);
    },
    [handleFieldChange, handleValueChange],
  );

  return (
    <Form className={classNames(styles.wrapper, !isOpen && styles.wrapperClosed)} onSubmit={handleSubmit}>
      <TextArea ref={nameField} name="name" value={data.name} placeholder={t('common.enterCardTitle')} maxRows={3} onKeyDown={handleFieldKeyDown} onChange={handleChange} onBlur={handleFieldBlur} />
      <div className={gStyles.controls}>
        <Button style={ButtonStyle.Cancel} content={t('action.cancel')} onClick={handleCancel} onMouseOver={handleControlMouseOver} onMouseOut={handleControlMouseOut} />
        <Button style={ButtonStyle.Submit} content={t('action.addCard')} onMouseOver={handleControlMouseOver} onMouseOut={handleControlMouseOut} />
      </div>
    </Form>
  );
});

CardAdd.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  labelIds: PropTypes.array.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  memberIds: PropTypes.array.isRequired,
};

export default CardAdd;
