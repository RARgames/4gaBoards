import { dequal } from 'dequal';
import pickBy from 'lodash/pickBy';
import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle, Form, Input } from '../../Utils';

import { useForm } from '../../../hooks';

import styles from './InformationEdit.module.scss';
import gStyles from '../../../globalStyles.module.scss';

const InformationEdit = React.memo(({ defaultData, onUpdate }) => {
  const [t] = useTranslation();

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
      nameField.current.select();
      return;
    }

    onUpdate(cleanData);
  }, [onUpdate, cleanData]);

  useEffect(() => {
    setData({
      name: '',
      ...pickBy(defaultData),
    });
  }, [defaultData, setData]);

  return (
    <Form onSubmit={handleSubmit}>
      <div className={styles.text}>{t('common.title')}</div>
      <Input ref={nameField} name="name" value={data.name} className={styles.field} onChange={handleFieldChange} />
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
