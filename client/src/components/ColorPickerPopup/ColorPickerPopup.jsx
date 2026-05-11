import React, { useCallback, useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ColorPicker from '@uiw/react-color-sketch';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { Button, ButtonStyle } from '../Utils/Button';
import Form from '../Utils/Form';
import withPopup from '../Utils/Popup';
import Popup from '../Utils/PopupElements';

import * as gs from '../../global.module.scss';
import * as s from './ColorPickerPopup.module.scss';

const ColorPickerStep = React.memo(({ defaultValue, onUpdate, onClose }) => {
  const [t] = useTranslation();
  const colorPickerRef = useRef(null);
  const [value, setValue] = useState(defaultValue);

  const submit = useCallback(() => {
    if (value !== defaultValue) {
      onUpdate(value);
    }
    onClose();
  }, [value, defaultValue, onUpdate, onClose]);

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  // FIXME workaround until https://github.com/uiwjs/react-color/issues/198 is fixed
  useEffect(() => {
    const onKeyDown = (e) => {
      switch (e.key) {
        case 'Enter': {
          e.preventDefault();
          handleSubmit();
          break;
        }
        default:
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [handleSubmit]);

  return (
    <Popup.Content className={s.popupContent}>
      <Form>
        <ColorPicker ref={colorPickerRef} color={value} onChange={(color) => setValue(color.hexa)} presetColors={false} />
        <div className={clsx(gs.controlsSpaceBetween, s.controls)}>
          <Button style={ButtonStyle.Cancel} content={t('action.cancel')} onClick={handleCancel} className={s.button} />
          <Button style={ButtonStyle.Submit} content={t('action.save')} onClick={handleSubmit} className={s.button} />
        </div>
      </Form>
    </Popup.Content>
  );
});

ColorPickerStep.propTypes = {
  defaultValue: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(ColorPickerStep, { hideCloseButton: true });
export { ColorPickerStep };
