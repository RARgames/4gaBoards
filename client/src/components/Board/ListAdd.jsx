import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import classNames from 'classnames';
import { Form, TextArea } from 'semantic-ui-react';
import { useDidUpdate, useToggle } from '../../lib/hooks';
import { Button, ButtonStyle } from '../Utils/Button';

import { useClosableForm, useForm } from '../../hooks';

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

  const [handleFieldBlur, handleControlMouseOver, handleControlMouseOut, handleValueChange, handleClearModified] = useClosableForm(close);

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
    handleClearModified();
    focusNameField();
  }, [data, onCreate, setData, handleClearModified, focusNameField]);

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

  useEffect(() => {
    nameField.current.focus();
  }, []);

  useDidUpdate(() => {
    nameField.current.focus();
  }, [focusNameFieldState]);

  const handleChange = useCallback(
    (_, { name: fieldName, value }) => {
      handleFieldChange(_, { name: fieldName, value });
      handleValueChange(value, DEFAULT_DATA.name);
    },
    [handleFieldChange, handleValueChange],
  );

  return (
    <Form className={styles.wrapper} onSubmit={handleSubmit}>
      <TextArea
        ref={nameField}
        as={TextareaAutosize}
        name="name"
        value={data.name}
        placeholder={t('common.enterListTitle')}
        maxRows={2}
        spellCheck
        className={classNames(styles.field, gStyles.scrollableY)}
        onKeyDown={handleFieldKeyDown}
        onChange={handleChange}
        onBlur={handleFieldBlur}
      />
      <div className={gStyles.controls}>
        <Button style={ButtonStyle.Cancel} content={t('action.cancel')} onClick={handleCancel} onMouseOver={handleControlMouseOver} onMouseOut={handleControlMouseOut} />
        <Button style={ButtonStyle.Submit} content={t('action.addList')} onMouseOver={handleControlMouseOver} onMouseOut={handleControlMouseOut} />
      </div>
    </Form>
  );
});

ListAdd.propTypes = {
  onCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ListAdd;
