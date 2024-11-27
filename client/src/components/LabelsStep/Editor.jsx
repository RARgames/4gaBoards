import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle, Input, InputStyle } from '../Utils';

import LabelColors from '../../constants/LabelColors';

import * as s from './Editor.module.scss';
import * as globalStyles from '../../styles.module.scss';

const Editor = React.memo(({ data, onFieldChange }) => {
  const [t] = useTranslation();

  const nameField = useRef(null);

  useEffect(() => {
    nameField.current.focus();
  }, []);

  return (
    <>
      <Input ref={nameField} style={InputStyle.Default} name="name" value={data.name} placeholder={t('common.enterLabelName')} onChange={onFieldChange} />
      <div className={s.text}>{t('common.color')}</div>
      <div className={s.colorButtons}>
        {LabelColors.map((color) => (
          <Button
            style={ButtonStyle.Default}
            key={color}
            name="color"
            value={color}
            className={classNames(s.colorButton, color === data.color && s.colorButtonActive, globalStyles[`background${upperFirst(camelCase(color))}`])}
            onClick={onFieldChange}
          />
        ))}
      </div>
    </>
  );
});

Editor.propTypes = {
  data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onFieldChange: PropTypes.func.isRequired,
};

export default Editor;
