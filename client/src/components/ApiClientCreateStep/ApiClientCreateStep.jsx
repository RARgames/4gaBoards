import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { Permissions } from '../../constants/Enums';
import { useForm, useSteps } from '../../hooks';
import { usePrevious } from '../../lib/hooks';
import { ShowSecretStep } from '../ShowSecretStep';
import { Button, ButtonStyle, Popup, Input, InputStyle, Form, Message, MessageStyle, Checkbox2, CheckboxSize } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './ApiClientCreateStep.module.scss';

const createMessage = (error) => {
  if (!error) {
    return error;
  }
  switch (error.message) {
    case 'Invalid permissions':
      return {
        type: 'error',
        content: 'errors.invalidPermissions',
      };
    default:
      return {
        type: 'warning',
        content: 'common.unknownError',
      };
  }
};

const StepTypes = {
  SHOW_SECRET: 'SHOW_SECRET',
};

const ApiClientCreateStep = React.memo(({ secret, defaultData, isSubmitting, error, onCreate, onMessageDismiss, onBack, onClose }) => {
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();
  const wasSubmitting = usePrevious(isSubmitting);
  const message = useMemo(() => createMessage(error), [error]);
  const nameField = useRef(null);
  const [data, handleFieldChange, setData] = useForm({
    name: '',
    permissions: [],
    ...defaultData,
  });
  const permissions = useMemo(() => Object.entries(Permissions), []);
  const permissionValues = useMemo(() => Object.values(Permissions), []);
  const isAllSelected = data.permissions === '*';

  const handleSubmit = useCallback(() => {
    onCreate(data);
  }, [onCreate, data]);

  const selectedPermissions = useMemo(() => {
    if (isAllSelected) return permissionValues;
    if (Array.isArray(data.permissions)) return data.permissions;
    return [];
  }, [data.permissions, isAllSelected, permissionValues]);

  const handleAllPermissionsChange = useCallback(
    (event) => {
      const { checked } = event.target;

      setData((prev) => ({
        ...prev,
        permissions: checked ? '*' : [],
      }));
    },
    [setData],
  );

  const handlePermissionChange = useCallback(
    (permission) => (event) => {
      const { checked } = event.target;

      setData((prev) => {
        const allPermissions = permissionValues;

        // eslint-disable-next-line no-nested-ternary
        const prevSelected = prev.permissions === '*' ? allPermissions : Array.isArray(prev.permissions) ? prev.permissions : [];

        const nextSelected = checked ? [...new Set([...prevSelected, permission])] : prevSelected.filter((p) => p !== permission);

        return {
          ...prev,
          permissions: nextSelected.length === allPermissions.length ? '*' : nextSelected,
        };
      });
    },
    [setData, permissionValues],
  );

  useEffect(() => {
    nameField.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (wasSubmitting && !isSubmitting) {
      if (!error) {
        openStep(StepTypes.SHOW_SECRET);
      }
    }
  }, [isSubmitting, wasSubmitting, error, openStep]);

  useEffect(() => {
    onMessageDismiss();
  }, [onMessageDismiss]);

  if (step && step.type === StepTypes.SHOW_SECRET) {
    return <ShowSecretStep secret={secret} onBack={handleBack} onClose={onClose} />;
  }

  return (
    <>
      <Popup.Header onBack={onBack}>{t('common.generateNewApiClient')}</Popup.Header>
      <Popup.Content>
        {message && <Message style={message.type === 'error' ? MessageStyle.Error : MessageStyle.Warning} content={t(message.content)} onDismiss={onMessageDismiss} />}
        <Form className={s.form}>
          <div className={s.text}>{t('common.name')}</div>
          <Input ref={nameField} style={InputStyle.Default} name="name" value={data.name} onChange={handleFieldChange} />
          <div className={s.text}>{t('common.permissions')}</div>
          <div className={clsx(s.permissions, gs.scrollableY)}>
            <Checkbox2 checked={isAllSelected} label={t('common.all').toLowerCase()} size={CheckboxSize.Size14} onChange={handleAllPermissionsChange} />
            {permissions.map(([permissionKey, permissionValue]) => (
              <Checkbox2
                key={permissionValue}
                checked={isAllSelected || selectedPermissions.includes(permissionValue)}
                label={permissionKey.toLowerCase()}
                size={CheckboxSize.Size14}
                onChange={handlePermissionChange(permissionValue)}
              />
            ))}
          </div>
          <div className={gs.controls}>
            <Button style={ButtonStyle.Submit} content={t('common.generate')} disabled={isSubmitting} onClick={handleSubmit} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

ApiClientCreateStep.propTypes = {
  secret: PropTypes.string,
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isSubmitting: PropTypes.bool.isRequired,
  error: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onCreate: PropTypes.func.isRequired,
  onMessageDismiss: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

ApiClientCreateStep.defaultProps = {
  secret: null,
  error: undefined,
  onBack: undefined,
};

export default ApiClientCreateStep;
