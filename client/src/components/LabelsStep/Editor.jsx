import React, { useEffect, useRef, useCallback, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { LabelColors } from '../../constants/LabelColors';
import { normalizeHexColor } from '../../utils/color-utils';
import ColorPickerPopup from '../ColorPickerPopup';
import { Button, ButtonVariant, Input, InputVariant } from '../Utils';

import * as s from './Editor.module.scss';

const DEFAULT_CUSTOM_COLOR = LabelColors[0];

const Editor = React.forwardRef(({ data, isError, onFieldChange }, ref) => {
  const [t] = useTranslation();
  const [colorValue, setColorValue] = useState(() => normalizeHexColor(data.color) || DEFAULT_CUSTOM_COLOR);
  const [isColorError, setIsColorError] = useState(false);
  const nameField = useRef(null);
  const colorField = useRef(null);

  const handleColorChange = useCallback(
    (color) => {
      const normalizedColor = normalizeHexColor(color?.hex);

      if (!normalizedColor) {
        return;
      }

      onFieldChange({
        target: {
          name: 'color',
          value: normalizedColor,
        },
      });
    },
    [onFieldChange],
  );

  const validateColor = useCallback(() => {
    const normalizedColor = normalizeHexColor(colorValue);

    if (!normalizedColor) {
      setIsColorError(true);
      colorField.current?.focus();
      return false;
    }
    return true;
  }, [colorValue]);

  useImperativeHandle(
    ref,
    () => ({
      focusName: () => nameField.current?.focus(),
      validateColor,
    }),
    [validateColor],
  );

  useEffect(() => {
    nameField.current?.focus();
  }, []);

  const handlePresetColorClick = useCallback(
    (color) => {
      const normalizedColor = normalizeHexColor(color) || DEFAULT_CUSTOM_COLOR;

      setIsColorError(false);
      setColorValue(normalizedColor);
      handleColorChange({ hex: normalizedColor });
    },
    [handleColorChange],
  );

  const handleColorInputChange = useCallback(
    (event) => {
      const { value } = event.target;
      setColorValue(value);

      if (isColorError) {
        setIsColorError(false);
      }
    },
    [isColorError],
  );

  const handleColorInputBlur = useCallback(() => {
    const normalizedColor = normalizeHexColor(colorValue);

    if (!normalizedColor) {
      setIsColorError(true);
      return;
    }

    setIsColorError(false);
    setColorValue(normalizedColor);
    handleColorChange({ hex: normalizedColor });
  }, [colorValue, handleColorChange]);

  const handleColorPickerUpdate = useCallback(
    (value) => {
      const normalizedColor = normalizeHexColor(value) || DEFAULT_CUSTOM_COLOR;

      setIsColorError(false);
      setColorValue(normalizedColor);
      handleColorChange({ hex: normalizedColor });
    },
    [handleColorChange],
  );

  return (
    <>
      <Input ref={nameField} variant={InputVariant.Default} name="name" value={data.name} placeholder={t('common.enterLabelName')} isError={isError} onChange={onFieldChange} />
      <div className={s.text}>{t('common.color')}</div>
      <div className={s.customColor}>
        <ColorPickerPopup defaultValue={colorValue} onUpdate={handleColorPickerUpdate}>
          <Button variant={ButtonVariant.Default} name="color" title={t('common.editColor')} value={colorValue} style={{ backgroundColor: colorValue }} className={clsx(s.colorButton, s.customColorSwatch)} />
        </ColorPickerPopup>
        <Input
          ref={colorField}
          variant={InputVariant.Default}
          className={s.customColorInput}
          value={colorValue}
          onChange={handleColorInputChange}
          onBlur={handleColorInputBlur}
          isError={isColorError}
          maxLength={9}
        />
      </div>
      <div className={s.text}>{t('common.presetColors')}</div>
      <div className={s.colorButtons}>
        {LabelColors.map((color) => (
          <Button
            variant={ButtonVariant.Default}
            key={color}
            name="color"
            value={color}
            title={color}
            style={{ backgroundColor: color }}
            className={clsx(s.colorButton, data.color === color && s.colorButtonActive)}
            onClick={() => handlePresetColorClick(color)}
          />
        ))}
      </div>
    </>
  );
});

Editor.propTypes = {
  data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isError: PropTypes.bool.isRequired,
  onFieldChange: PropTypes.func.isRequired,
};

export default Editor;
