import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useForm } from '../../hooks';
import { useDidUpdate, useToggle } from '../../lib/hooks';
import { Button, ButtonStyle, Form, TextArea, TextAreaStyle } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './ListAdd.module.scss';

const DEFAULT_DATA = {
  name: '',
  isCollapsed: false,
};

const ListAdd = React.memo(({ onCreate, onClose }) => {
  const [t] = useTranslation();
  const [data, handleFieldChange, setData] = useForm(DEFAULT_DATA);
  const [focusNameFieldState, focusNameField] = useToggle();
  const [isError, setIsError] = useState(false);

  const nameField = useRef(null);

  const close = useCallback(() => {
    setData(DEFAULT_DATA);
    setIsError(false);
    onClose();
  }, [onClose, setData]);

  const submit = useCallback(() => {
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
    setData(DEFAULT_DATA);
    focusNameField();
  }, [data, focusNameField, onCreate, setData]);

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
          submit();
          break;
        }
        case 'Escape': {
          handleCancel();
          break;
        }
        default:
      }
    },
    [handleCancel, submit],
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
    nameField.current?.focus();
  }, []);

  useDidUpdate(() => {
    nameField.current?.focus();
  }, [focusNameFieldState]);

  return (
    <Form className={s.wrapper}>
      <TextArea
        ref={nameField}
        style={TextAreaStyle.Default}
        name="name"
        value={data.name}
        placeholder={t('common.enterListName')}
        maxRows={2}
        onKeyDown={handleFieldKeyDown}
        onChange={handleFieldChange}
        onBlur={handleBlur}
        isError={isError}
      />
      <div className={gs.controls}>
        <Button style={ButtonStyle.Cancel} content={t('action.cancel')} onClick={handleCancel} />
        <Button style={ButtonStyle.Submit} content={t('action.addList')} onClick={handleSubmit} />
      </div>
    </Form>
  );
});

ListAdd.propTypes = {
  onCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ListAdd;
