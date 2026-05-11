import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { useForm } from '../../hooks';
import { useDidUpdate, useToggle } from '../../lib/hooks';
import { Button, ButtonStyle, Form, TextArea, TextAreaStyle } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './CardAdd.module.scss';

const DEFAULT_DATA = {
  name: '',
};

// eslint-disable-next-line no-unused-vars
const CardAdd = React.memo(({ isOpen, onCreate, onClose, labelIds, memberIds }) => {
  const [t] = useTranslation();
  const [data, handleFieldChange, setData] = useForm(DEFAULT_DATA);
  const [focusNameFieldState, focusNameField] = useToggle();
  const nameField = useRef(null);
  const [isError, setIsError] = useState(false);

  const close = useCallback(() => {
    setData(DEFAULT_DATA);
    setIsError(false);
    onClose();
  }, [onClose, setData]);

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
        setIsError(true);
        return;
      }

      onCreate(cleanData, autoOpen);
      setData(DEFAULT_DATA);

      if (autoOpen) {
        onClose();
      } else {
        focusNameField();
      }
    },
    [data, onCreate, setData, onClose, focusNameField],
  );

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  const handleCancel = useCallback(() => {
    close();
  }, [close]);

  const handleFieldKeyDown = useCallback(
    (e) => {
      setIsError(false);
      switch (e.key) {
        case 'Enter': {
          e.preventDefault(); // Prevent adding new line in TextArea
          const autoOpen = e.ctrlKey;
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

  const handleBlur = useCallback(
    (e) => {
      if (e.target.value.trim() === DEFAULT_DATA.name.trim()) {
        close();
      }
    },
    [close],
  );

  useEffect(() => {
    if (isOpen) {
      nameField.current?.focus();
    }
  }, [isOpen]);

  useDidUpdate(() => {
    nameField.current?.focus();
  }, [focusNameFieldState]);

  return (
    <Form className={clsx(s.wrapper, !isOpen && s.wrapperClosed)}>
      <TextArea
        ref={nameField}
        style={TextAreaStyle.Default}
        name="name"
        value={data.name}
        placeholder={t('common.enterCardNameWithHint')}
        maxRows={3}
        onKeyDown={handleFieldKeyDown}
        onChange={handleFieldChange}
        onBlur={handleBlur}
        isError={isError}
      />
      <div className={gs.controls}>
        <Button style={ButtonStyle.Cancel} content={t('action.cancel')} onClick={handleCancel} />
        <Button style={ButtonStyle.Submit} content={t('action.addCard')} onClick={handleSubmit} />
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
