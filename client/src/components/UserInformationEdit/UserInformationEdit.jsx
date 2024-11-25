import { dequal } from 'dequal';
import pickBy from 'lodash/pickBy';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle, Input, InputStyle, Form } from '../Utils';

import { useForm } from '../../hooks';

import * as styles from './UserInformationEdit.module.scss';
import * as gStyles from '../../globalStyles.module.scss';

const UserInformationEdit = React.memo(({ defaultData, onUpdate }) => {
  const [t] = useTranslation();
  const [isError, setIsError] = useState(false);

  const [data, handleFieldChange] = useForm(() => ({
    name: '',
    phone: '',
    organization: '',
    ...pickBy(defaultData),
  }));

  const cleanData = useMemo(
    () => ({
      ...data,
      name: data.name.trim(),
      phone: data.phone.trim() || null,
      organization: data.organization.trim() || null,
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

  return (
    <Form onSubmit={handleSubmit}>
      <div className={styles.text}>{t('common.name')}</div>
      <Input style={InputStyle.Default} ref={nameField} name="name" value={data.name} className={styles.field} onKeyDown={handleFieldKeyDown} onChange={handleFieldChange} isError={isError} />
      <div className={styles.text}>{t('common.phone')}</div>
      <Input style={InputStyle.Default} name="phone" value={data.phone} className={styles.field} onChange={handleFieldChange} />
      <div className={styles.text}>{t('common.organization')}</div>
      <Input style={InputStyle.DefaultLast} name="organization" value={data.organization} onChange={handleFieldChange} />
      <div className={gStyles.controls}>
        <Button style={ButtonStyle.Submit} content={t('action.save')} disabled={dequal(cleanData, defaultData)} onClick={handleSubmit} />
      </div>
    </Form>
  );
});

UserInformationEdit.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
};

export default UserInformationEdit;
