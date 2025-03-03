import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { dequal } from 'dequal';
import pickBy from 'lodash/pickBy';
import PropTypes from 'prop-types';

import { useForm } from '../../../hooks';
import { Button, ButtonStyle, Form, Input, InputStyle } from '../../Utils';

import * as gs from '../../../globalStyles.module.scss';
import * as s from './InformationEdit.module.scss';

const InformationEdit = React.memo(({ defaultData, onUpdate }) => {
  const [t] = useTranslation();
  const [isError, setIsError] = useState(false);

  const [data, handleFieldChange, setData] = useForm(() => ({
    name: '',
    ...pickBy(defaultData),
  }));

  const cleanData = useMemo(
    () => ({
      ...data,
      name: data.name.trim(),
    }),
    [data],
  );

  const nameField = useRef(null);

  const handleSubmit = useCallback(() => {
    if (!cleanData.name) {
      nameField.current.focus();
      setIsError(true);
      return;
    }

    onUpdate(cleanData);
  }, [onUpdate, cleanData]);

  const handleFieldKeyDown = useCallback(() => {
    setIsError(false);
  }, []);

  useEffect(() => {
    setData({
      name: '',
      ...pickBy(defaultData),
    });
  }, [defaultData, setData]);

  return (
    <Form>
      <div className={s.text}>{t('common.name')}</div>
      <Input ref={nameField} style={InputStyle.Default} name="name" placeholder={t('common.enterProjectName')} value={data.name} onKeyDown={handleFieldKeyDown} onChange={handleFieldChange} isError={isError} />
      <div className={gs.controls}>
        <Button style={ButtonStyle.Submit} content={t('action.save')} disabled={dequal(cleanData, defaultData)} onClick={handleSubmit} />
      </div>
    </Form>
  );
});

InformationEdit.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
};

export default InformationEdit;
