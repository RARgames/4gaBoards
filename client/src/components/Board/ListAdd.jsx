import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDidUpdate, useToggle } from '../../lib/hooks';
import { Button, ButtonStyle, Form, TextArea } from '../Utils';
import { useForm } from '../../hooks';

import styles from './ListAdd.module.scss';
import gStyles from '../../globalStyles.module.scss';

const DEFAULT_DATA = {
  name: '',
  isCollapsed: false,
};

const ListAdd = React.memo(({ onCreate, onClose }) => {
  const [t] = useTranslation();
  const [data, handleFieldChange, setData] = useForm(DEFAULT_DATA);
  const [focusNameFieldState, focusNameField] = useToggle();

  const nameField = useRef(null);

  const close = useCallback(() => {
    setData(DEFAULT_DATA);
    onClose();
  }, [onClose, setData]);

  const submit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
    };

    if (!cleanData.name) {
      nameField.current.focus();
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
    (event) => {
      switch (event.key) {
        case 'Enter': {
          event.preventDefault();
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
    nameField.current.focus();
  }, []);

  useDidUpdate(() => {
    nameField.current.focus();
  }, [focusNameFieldState]);

  return (
    <Form className={styles.wrapper} onSubmit={handleSubmit}>
      <TextArea ref={nameField} name="name" value={data.name} placeholder={t('common.enterListTitle')} maxRows={2} onKeyDown={handleFieldKeyDown} onChange={handleFieldChange} onBlur={handleBlur} />
      <div className={gStyles.controls}>
        <Button style={ButtonStyle.Cancel} content={t('action.cancel')} onClick={handleCancel} />
        <Button style={ButtonStyle.Submit} content={t('action.addList')} />
      </div>
    </Form>
  );
});

ListAdd.propTypes = {
  onCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ListAdd;
