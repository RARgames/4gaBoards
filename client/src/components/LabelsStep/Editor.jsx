import React, { useEffect, useRef, useCallback, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import PropTypes from 'prop-types';

import LabelColors from '../../constants/LabelColors';
import { Button, ButtonStyle, Input, InputStyle } from '../Utils';

import * as bs from '../../backgrounds.module.scss';
import * as s from './Editor.module.scss';

const Editor = React.forwardRef(({ data, isError, onFieldChange }, ref) => {
  const [t] = useTranslation();

  const nameField = useRef(null);

  const focus = useCallback(() => {
    if (!nameField.current) return;
    nameField.current.focus();
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      focus,
    }),
    [focus],
  );

  useEffect(() => {
    nameField.current.focus();
  }, []);

  return (
    <>
      <Input ref={nameField} style={InputStyle.Default} name="name" value={data.name} placeholder={t('common.enterLabelName')} isError={isError} onChange={onFieldChange} />
      <div className={s.text}>{t('common.color')}</div>
      <div className={s.colorButtons}>
        {LabelColors.map((color) => (
          <Button
            style={ButtonStyle.Default}
            key={color}
            name="color"
            value={color}
            className={classNames(s.colorButton, color === data.color && s.colorButtonActive, bs[`background${upperFirst(camelCase(color))}`])}
            onClick={onFieldChange}
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
