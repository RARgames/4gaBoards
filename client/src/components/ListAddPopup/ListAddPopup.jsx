import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useForm } from '../../hooks';
import { Button, ButtonStyle, Popup, Form, withPopup, TextArea, TextAreaStyle } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './ListAddPopup.module.scss';

const DEFAULT_DATA = {
  name: '',
  isCollapsed: false,
};

const ListAddStep = React.memo(({ onCreate, onBack, onClose }) => {
  const [t] = useTranslation();
  const [data, handleFieldChange, setData] = useForm(DEFAULT_DATA);
  const [isError, setIsError] = useState(false);

  const nameField = useRef(null);

  const handleSubmit = useCallback(
    (keepOpen) => {
      const cleanData = {
        ...data,
        name: data.name.trim(),
      };

      if (!cleanData.name) {
        setData(DEFAULT_DATA);
        nameField.current?.focus();
        setIsError(true);
        return;
      }

      onCreate(cleanData);
      setData(DEFAULT_DATA);
      setIsError(false);

      if (keepOpen) {
        nameField.current?.focus();
      } else {
        onClose();
      }
    },
    [data, onClose, onCreate, setData],
  );

  const handleKeyDown = useCallback(
    (e) => {
      setIsError(false);
      switch (e.key) {
        case 'Enter': {
          e.preventDefault(); // Prevent adding new line in TextArea
          const keepOpen = e.shiftKey;
          handleSubmit(keepOpen);
          break;
        }
        default:
      }
    },
    [handleSubmit],
  );

  useEffect(() => {
    nameField.current?.focus();
  }, []);

  return (
    <>
      <Popup.Header onBack={onBack} tooltip={t('common.addListTooltip')}>
        {t('common.addList')}
      </Popup.Header>
      <Popup.Content className={s.content}>
        <Form onKeyDown={handleKeyDown}>
          <TextArea ref={nameField} style={TextAreaStyle.Default} name="name" value={data.name} placeholder={t('common.enterListName')} maxRows={2} onChange={handleFieldChange} isError={isError} />
          <div className={gs.controls}>
            <Button style={ButtonStyle.Submit} content={t('common.addList')} onClick={(e) => handleSubmit(e.shiftKey)} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

ListAddStep.propTypes = {
  onCreate: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

ListAddStep.defaultProps = {
  onBack: undefined,
};

export default withPopup(ListAddStep);
export { ListAddStep };
