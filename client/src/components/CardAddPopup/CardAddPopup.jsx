import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useForm } from '../../hooks';
import { useDidUpdate, useToggle } from '../../lib/hooks';
import { Button, ButtonStyle, Popup, Form, withPopup, Dropdown, DropdownStyle, TextArea, TextAreaStyle } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './CardAddPopup.module.scss';

const DEFAULT_DATA = {
  name: '',
};

// eslint-disable-next-line no-unused-vars
const CardAddStep = React.memo(({ lists, labelIds, memberIds, forcedDefaultListId, onCreate, onBack, onClose }) => {
  const [t] = useTranslation();
  const [data, handleFieldChange, setData] = useForm(DEFAULT_DATA);
  const [focusNameFieldState, focusNameField] = useToggle();
  const [isError, setIsError] = useState(false);
  const [isDropdownError, setIsDropdownError] = useState(false);
  const nameField = useRef(null);
  const listDropdownRef = useRef(null);

  const formRef = useRef(null);
  const [focusFromState, focusForm] = useToggle();

  const [selectedList, setSelectedList] = useState(lists.length > 0 ? lists[0] : null);

  const handleSubmit = useCallback(
    (autoOpen, keepOpen) => {
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

      if (selectedList === null && !forcedDefaultListId) {
        listDropdownRef.current?.open(); // TODO with default first list (just add option to create new list)
        setIsDropdownError(true);
        return;
      }

      onCreate(selectedList ? selectedList.id : forcedDefaultListId, cleanData, autoOpen);
      setData(DEFAULT_DATA);

      setIsError(false);
      setIsDropdownError(false);

      if (keepOpen) {
        focusNameField();
      } else {
        onClose();
      }
    },
    [data, focusNameField, forcedDefaultListId, onClose, onCreate, selectedList, setData],
  );

  const handleKeyDown = useCallback(
    (e) => {
      setIsError(false);
      switch (e.key) {
        case 'Enter': {
          e.preventDefault(); // Prevent adding new line in TextArea
          const autoOpen = e.ctrlKey;
          const keepOpen = e.shiftKey;
          handleSubmit(autoOpen, keepOpen);
          break;
        }
        default:
      }
    },
    [handleSubmit],
  );

  const handleListChange = useCallback((value) => {
    setSelectedList(value);
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
          <TextArea ref={nameField} style={TextAreaStyle.Default} name="name" value={data.name} placeholder={t('common.enterCardNameWithHint')} maxRows={3} onChange={handleFieldChange} isError={isError} />
          {!forcedDefaultListId && <div className={s.text}>{t('common.list', { context: 'title' })}</div>}
          {!forcedDefaultListId && (
            <Dropdown
              ref={listDropdownRef}
              style={DropdownStyle.Default}
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
            />
          )}
          <div className={gs.controls}>
            <Button style={ButtonStyle.Submit} content={t('common.addCard')} onClick={(e) => handleSubmit(e.ctrlKey, e.shiftKey)} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

CardAddStep.propTypes = {
  lists: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  labelIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  memberIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
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
