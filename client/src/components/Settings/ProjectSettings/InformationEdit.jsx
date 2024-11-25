import { dequal } from 'dequal';
import pickBy from 'lodash/pickBy';
import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle, Form, Input, InputStyle } from '../../Utils';

import { useForm } from '../../../hooks';

import * as styles from './InformationEdit.module.scss';
import * as gStyles from '../../../globalStyles.module.scss';

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
    <Form onSubmit={handleSubmit}>
      <div className={styles.text}>{t('common.title')}</div>
      <Input ref={nameField} style={InputStyle.DefaultLast} name="name" value={data.name} onKeyDown={handleFieldKeyDown} onChange={handleFieldChange} isError={isError} />
      <div className={gStyles.controls}>
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
