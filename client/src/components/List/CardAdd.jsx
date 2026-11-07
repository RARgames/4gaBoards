import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { useDidUpdate, useToggle } from '../../lib/hooks';
import { Button, ButtonVariant, Form, Icon, IconType, IconSize, MentionTextArea, TextAreaVariant } from '../Utils';
import { useMentionTriggers, useMentionValue, getCleanName, toExtras } from '../Utils/Mention';

import * as gs from '../../global.module.scss';
import * as s from './CardAdd.module.scss';

const CardAdd = React.memo(({ isOpen, onCreate, onClose, boardLabels, boardMemberships }) => {
  const [t] = useTranslation();
  const [value, submitData, handleChange, resetValue] = useMentionValue();
  const [focusNameFieldState, focusNameField] = useToggle();
  const nameField = useRef(null);
  const [isError, setIsError] = useState(false);
  const mentionTriggers = useMentionTriggers({ memberships: boardMemberships, labels: boardLabels });

  const close = useCallback(() => {
    resetValue();
    setIsError(false);
    onClose();
  }, [onClose, resetValue]);

  const submit = useCallback(
    (autoOpen) => {
      const name = getCleanName(value, submitData);

      if (!name) {
        resetValue();
        focusNameField();
        setIsError(true);
        return;
      }

      onCreate({ name, isCompleted: false, ...toExtras(submitData) }, autoOpen);
      resetValue();

      if (autoOpen) {
        onClose();
      } else {
        focusNameField();
      }
    },
    [value, submitData, onCreate, resetValue, onClose, focusNameField],
  );

  const handleSubmit = useCallback(() => submit(false), [submit]);

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
        case 'Escape':
          close();
          break;
        default:
      }
    },
    [submit, close],
  );

  const handleBlur = useCallback(
    (e) => {
      if (e.target.value.trim() === '') {
        // FIXME timeout introduced to fix a bug with dragging card when CardAdd is open and List is scrollable
        setTimeout(() => {
          close();
        }, 100);
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
      <MentionTextArea
        ref={nameField}
        variant={TextAreaVariant.Default}
        value={value}
        placeholder={t('common.enterCardName')}
        maxRows={3}
        onKeyDown={handleFieldKeyDown}
        onChange={handleChange}
        onBlur={handleBlur}
        isError={isError}
        mentionTriggers={mentionTriggers}
      />
      <div className={s.controlsWrapper}>
        <Icon type={IconType.CircleQuestion} size={IconSize.Size12} className={s.controlsInfo} title={t('common.addCardTooltipShort')} />
        <div className={clsx(gs.controls, s.controls)}>
          <Button variant={ButtonVariant.Cancel} content={t('common.cancel')} onClick={close} />
          <Button variant={ButtonVariant.Submit} content={t('common.addCard')} onClick={handleSubmit} />
        </div>
      </div>
    </Form>
  );
});

CardAdd.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  boardLabels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default CardAdd;
