import React, { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDidUpdate, useToggle } from '../../../lib/hooks';
import { Button, ButtonStyle, Form, TextArea } from '../../Utils';

import { useClosableForm, useForm2 } from '../../../hooks';

import styles from './CommentAdd.module.scss';
import gStyles from '../../../globalStyles.module.scss';

const DEFAULT_DATA = {
  text: '',
};

const CommentAdd = React.memo(({ onCreate }) => {
  const [t] = useTranslation();
  const [isOpened, setIsOpened] = useState(false);
  const [data, handleFieldChange, setData] = useForm2(DEFAULT_DATA);
  const [focusTextFieldState, focusTextField] = useToggle();
  const [placeholder, setPlaceholder] = useState(t('common.writeComment'));

  const textField = useRef(null);

  const close = useCallback(() => {
    setData(DEFAULT_DATA);
    setIsOpened(false);
  }, [setData]);

  const [handleFieldBlur, handleControlMouseOver, handleControlMouseOut, handleValueChange, handleClearModified] = useClosableForm(close);

  const submit = useCallback(() => {
    const cleanData = {
      ...data,
      text: data.text.trim(),
    };

    if (!cleanData.text) {
      textField.current.focus();
      return;
    }

    onCreate(cleanData);
    setData(DEFAULT_DATA);
    handleClearModified();
    focusTextField();
  }, [data, onCreate, setData, handleClearModified, focusTextField]);

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  const handleCancel = useCallback(() => {
    setData(DEFAULT_DATA);
    handleClearModified();
    close();
  }, [close, handleClearModified, setData]);

  const handleFieldFocus = useCallback(() => {
    setIsOpened(true);
    setPlaceholder(`${t('common.writeComment')} ${t('common.writeCommentHint')}`);
  }, [t]);

  const handleFieldBlurOverride = useCallback(() => {
    setPlaceholder(t('common.writeComment'));
    handleFieldBlur();
  }, [handleFieldBlur, t]);

  const handleFieldKeyDown = useCallback(
    (event) => {
      if (event.ctrlKey && event.key === 'Enter') {
        submit();
      } else if (event.key === 'Escape') {
        handleCancel();
      }
    },
    [handleCancel, submit],
  );

  useDidUpdate(() => {
    textField.current.focus();
  }, [focusTextFieldState]);

  const handleChange = useCallback(
    (event) => {
      handleFieldChange(event);
      handleValueChange(event.target.value, DEFAULT_DATA.text);
    },
    [handleFieldChange, handleValueChange],
  );

  return (
    <Form onSubmit={handleSubmit}>
      <TextArea
        ref={textField}
        name="text"
        value={data.text}
        placeholder={placeholder}
        className={styles.field}
        onFocus={handleFieldFocus}
        onKeyDown={handleFieldKeyDown}
        onChange={handleChange}
        onBlur={handleFieldBlurOverride}
      />
      {isOpened && (
        <div className={gStyles.controls}>
          <Button style={ButtonStyle.Cancel} content={t('action.cancel')} onClick={handleCancel} onMouseOver={handleControlMouseOver} onMouseOut={handleControlMouseOut} />
          <Button style={ButtonStyle.Submit} content={t('action.addComment')} onMouseOver={handleControlMouseOver} onMouseOut={handleControlMouseOut} />
        </div>
      )}
    </Form>
  );
});

CommentAdd.propTypes = {
  onCreate: PropTypes.func.isRequired,
};

export default CommentAdd;
