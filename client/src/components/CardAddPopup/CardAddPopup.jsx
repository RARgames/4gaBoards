import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useDidUpdate, useToggle } from '../../lib/hooks';
import { Button, ButtonVariant, Popup, Form, withPopup, Dropdown, DropdownVariant, MentionTextArea, TextAreaVariant } from '../Utils';
import { useMentionTriggers, useMentionValue, getCleanName, toExtras } from '../Utils/Mention';

import * as gs from '../../global.module.scss';
import * as s from './CardAddPopup.module.scss';

const CardAddStep = React.memo(({ lists, boardLabels, boardMemberships, forcedDefaultListId, onCreate, onBack, onClose }) => {
  const [t] = useTranslation();
  const [value, submitData, handleChange, resetValue] = useMentionValue();
  const [focusNameFieldState, focusNameField] = useToggle();
  const [isError, setIsError] = useState(false);
  const [isDropdownError, setIsDropdownError] = useState(false);
  const nameField = useRef(null);
  const listDropdownRef = useRef(null);

  const formRef = useRef(null);
  const [focusFromState, focusForm] = useToggle();

  const [selectedList, setSelectedList] = useState(lists.length > 0 ? lists[0] : null);
  const mentionTriggers = useMentionTriggers({ memberships: boardMemberships, labels: boardLabels });

  const handleSubmit = useCallback(
    (autoOpen, keepOpen) => {
      const name = getCleanName(value, submitData);

      if (!name) {
        resetValue();
        focusNameField();
        setIsError(true);
        return;
      }

      if (selectedList === null && !forcedDefaultListId) {
        listDropdownRef.current?.open(); // TODO with default first list (just add option to create new list)
        setIsDropdownError(true);
        return;
      }

      onCreate(selectedList ? selectedList.id : forcedDefaultListId, { name, isCompleted: false, ...toExtras(submitData) }, autoOpen);
      resetValue();
      setIsError(false);
      setIsDropdownError(false);

      if (keepOpen) {
        focusNameField();
      } else {
        onClose();
      }
    },
    [value, submitData, resetValue, focusNameField, forcedDefaultListId, onClose, onCreate, selectedList],
  );

  const handleKeyDown = useCallback(
    (e) => {
      setIsError(false);
      if (e.key === 'Enter') {
        e.preventDefault(); // Prevent adding new line in TextArea
        const autoOpen = e.ctrlKey;
        const keepOpen = e.shiftKey;
        handleSubmit(autoOpen, keepOpen);
      }
    },
    [handleSubmit],
  );

  const handleListChange = useCallback((list) => {
    setSelectedList(list);
  }, []);

  useEffect(() => {
    nameField.current?.focus();
  }, []);

  useDidUpdate(() => {
    nameField.current?.focus();
  }, [focusNameFieldState]);

  useDidUpdate(() => {
    formRef.current?.focus();
  }, [focusFromState]);

  return (
    <>
      <Popup.Header onBack={onBack} tooltip={t('common.addCardTooltip')}>
        {t('common.addCard', { context: 'title' })}
      </Popup.Header>
      <Popup.Content className={s.content}>
        <Form ref={formRef} tabIndex="0" onKeyDown={handleKeyDown}>
          <div className={s.text}>{t('common.name')}</div>
          <MentionTextArea
            ref={nameField}
            variant={TextAreaVariant.Default}
            value={value}
            placeholder={t('common.enterCardName')}
            maxRows={3}
            onChange={handleChange}
            isError={isError}
            mentionTriggers={mentionTriggers}
          />
          {!forcedDefaultListId && <div className={s.text}>{t('common.list', { context: 'title' })}</div>}
          {!forcedDefaultListId && (
            <Dropdown
              ref={listDropdownRef}
              variant={DropdownVariant.Default}
              options={lists}
              placeholder={lists.length < 1 ? t('common.noLists') : selectedList ? selectedList.name : t('common.selectList')} // eslint-disable-line no-nested-ternary
              defaultItem={selectedList}
              isSearchable
              isError={isDropdownError}
              selectFirstOnSearch
              onBlur={focusForm}
              onChange={handleListChange}
              onErrorClear={() => setIsDropdownError(false)}
              dropdownMenuClassName={s.dropdownMenu}
              translateI18nKeys
            />
          )}
          <div className={gs.controls}>
            <Button variant={ButtonVariant.Submit} content={t('common.addCard')} onClick={(e) => handleSubmit(e.ctrlKey, e.shiftKey)} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

CardAddStep.propTypes = {
  lists: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  boardLabels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  forcedDefaultListId: PropTypes.string,
  onCreate: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

CardAddStep.defaultProps = {
  forcedDefaultListId: undefined,
  onBack: undefined,
};

export default withPopup(CardAddStep);
export { CardAddStep };
