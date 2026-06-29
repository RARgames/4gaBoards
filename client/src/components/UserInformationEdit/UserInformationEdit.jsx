import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { dequal } from 'dequal';
import pickBy from 'lodash/pickBy';
import PropTypes from 'prop-types';

import { useForm } from '../../hooks';
import { Button, ButtonVariant, Input, InputVariant, Form } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './UserInformationEdit.module.scss';

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
      nameField.current?.focus();
      setIsError(true);
      return;
    }

    onUpdate(cleanData);
  }, [onUpdate, cleanData]);

  const handleFieldKeyDown = useCallback(() => {
    setIsError(false);
  }, []);

  return (
    <Form>
      <div className={s.text}>{t('common.name')}</div>
      <Input variant={InputVariant.Default} ref={nameField} name="name" value={data.name} className={s.field} onKeyDown={handleFieldKeyDown} onChange={handleFieldChange} isError={isError} />
      <div className={s.text}>{t('common.phone')}</div>
      <Input variant={InputVariant.Default} name="phone" value={data.phone} className={s.field} onChange={handleFieldChange} />
      <div className={s.text}>{t('common.organization')}</div>
      <Input variant={InputVariant.Default} name="organization" value={data.organization} onChange={handleFieldChange} />
      <div className={gs.controls}>
        <Button variant={ButtonVariant.Submit} content={t('common.save')} disabled={dequal(cleanData, defaultData)} onClick={handleSubmit} />
      </div>
    </Form>
  );
});

UserInformationEdit.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
};

export default UserInformationEdit;
