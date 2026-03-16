import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { Permissions } from '../../constants/Enums';
import { useForm, useSteps } from '../../hooks';
import { usePrevious } from '../../lib/hooks';
import { ShowSecretStep } from '../ShowSecretStep';
import { Button, ButtonStyle, Popup, Input, InputStyle, Form, Message, MessageStyle, Checkbox, CheckboxSize } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './ApiClientStep.module.scss';

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

const ApiClientStep = React.memo(({ id, secret, defaultData, isSubmitting, error, isUpdate, title, submitButtonText, onSubmit, onMessageDismiss, onBack, onClose }) => {
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();
  const wasSubmitting = usePrevious(isSubmitting);
  const message = useMemo(() => createMessage(error), [error]);
  const nameField = useRef(null);
  const [data, handleFieldChange, setData] = useForm({
    name: '',
    permissions: [],
    ...(isUpdate && { regenerateSecret: false }),
    ...defaultData,
  });
  const permissionValues = useMemo(() => Object.values(Permissions), []);
  const groupedPermissions = useMemo(() => {
    const groups = {};
    Object.entries(Permissions).forEach(([key, value]) => {
      const group = value.split('.')[0];
      if (!groups[group]) groups[group] = [];
      groups[group].push({
        key,
        value,
      });
    });

    Object.values(groups).forEach((perms) => {
      perms.sort((a, b) => a.key.localeCompare(b.key));
    });
    return Object.fromEntries(Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)));
  }, []);
  const isAllSelected = data.permissions.includes('*');
  const [regenerateSecret, setRegenerateSecret] = useState(false);

  const normalizePermissions = useCallback(
    (perms) => {
      const expanded = new Set();

      perms.forEach((perm) => {
        if (perm === '*') {
          permissionValues.forEach((p) => expanded.add(p));
        } else if (perm.endsWith('.*')) {
          const group = perm.split('.')[0];
          groupedPermissions[group].forEach((p) => expanded.add(p.value));
        } else {
          expanded.add(perm);
        }
      });

      if (permissionValues.every((p) => expanded.has(p))) {
        return ['*'];
      }

      const result = new Set(expanded);
      Object.entries(groupedPermissions).forEach(([group, gPerms]) => {
        const values = gPerms.map((p) => p.value);
        if (values.every((p) => expanded.has(p))) {
          values.forEach((p) => result.delete(p));
          result.add(`${group}.*`);
        }
      });
      return [...result];
    },
    [permissionValues, groupedPermissions],
  );

  const handleSubmit = useCallback(() => {
    onSubmit(data);
  }, [onSubmit, data]);

  const selectedPermissions = useMemo(() => {
    if (isAllSelected) return permissionValues;

    const expanded = [];
    data.permissions.forEach((perm) => {
      if (perm.endsWith('.*')) {
        const group = perm.split('.')[0];
        groupedPermissions[group]?.forEach((p) => expanded.push(p.value));
      } else {
        expanded.push(perm);
      }
    });
    return expanded;
  }, [isAllSelected, permissionValues, data.permissions, groupedPermissions]);

  const isGroupSelected = useCallback(
    (group) => {
      if (isAllSelected) return true;
      if (data.permissions.includes(`${group}.*`)) return true;
      const perms = groupedPermissions[group].map((p) => p.value);
      return perms.every((p) => selectedPermissions.includes(p));
    },
    [isAllSelected, data.permissions, selectedPermissions, groupedPermissions],
  );

  const handleAllPermissionsChange = useCallback(
    (event) => {
      const { checked } = event.target;

      setData((prev) => ({
        ...prev,
        permissions: checked ? ['*'] : [],
      }));
    },
    [setData],
  );

  const handlePermissionChange = useCallback(
    (permission) => (event) => {
      const { checked } = event.target;

      setData((prev) => {
        const expanded = new Set(selectedPermissions);
        if (checked) {
          expanded.add(permission);
        } else {
          expanded.delete(permission);
        }

        return {
          ...prev,
          permissions: normalizePermissions([...expanded]),
        };
      });
    },
    [setData, selectedPermissions, normalizePermissions],
  );

  const handleGroupPermissionChange = useCallback(
    (group) => (event) => {
      const { checked } = event.target;

      const groupPerms = groupedPermissions[group].map((p) => p.value);

      setData((prev) => {
        const expanded = new Set(selectedPermissions);
        if (checked) {
          groupPerms.forEach((p) => expanded.add(p));
        } else {
          groupPerms.forEach((p) => expanded.delete(p));
        }

        return {
          ...prev,
          permissions: normalizePermissions([...expanded]),
        };
      });
    },
    [setData, groupedPermissions, selectedPermissions, normalizePermissions],
  );

  const handleRegenerateSecretChange = useCallback(
    (event) => {
      const { checked } = event.target;
      setRegenerateSecret(checked);

      setData((prev) => ({
        ...prev,
        regenerateSecret: checked,
      }));
    },
    [setData],
  );

  useEffect(() => {
    nameField.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (wasSubmitting && !isSubmitting) {
      if (!error) {
        if (regenerateSecret || !isUpdate) {
          openStep(StepTypes.SHOW_SECRET);
        } else {
          onClose();
        }
      }
    }
  }, [isSubmitting, wasSubmitting, error, openStep, isUpdate, onClose, regenerateSecret]);

  useEffect(() => {
    onMessageDismiss();
  }, [onMessageDismiss]);

  if (step && step.type === StepTypes.SHOW_SECRET) {
    return <ShowSecretStep id={id} secret={secret} onBack={handleBack} onClose={onClose} />;
  }

  return (
    <>
      <Popup.Header onBack={onBack}>{title}</Popup.Header>
      <Popup.Content>
        {message && <Message style={message.type === 'error' ? MessageStyle.Error : MessageStyle.Warning} content={t(message.content)} onDismiss={onMessageDismiss} />}
        <Form className={s.form}>
          <div className={s.text}>{t('common.name')}</div>
          <Input ref={nameField} style={InputStyle.Default} name="name" value={data.name} onChange={handleFieldChange} />
          {isUpdate && <div className={s.text}>{t('common.regenerateSecret')}</div>}
          {isUpdate && <Checkbox checked={regenerateSecret} label={t('common.regenerateSecret')} size={CheckboxSize.Size14} onChange={handleRegenerateSecretChange} wrapperClassName={s.checkbox} />}
          <div className={s.text}>{t('common.permissions')}</div>
          <div className={clsx(s.permissions, gs.scrollableY)}>
            <Checkbox checked={isAllSelected} label={t('common.all').toLowerCase()} size={CheckboxSize.Size14} onChange={handleAllPermissionsChange} />
            {Object.entries(groupedPermissions).map(([group, perms]) => (
              <div key={group} className={s.permissionGroup}>
                <Checkbox checked={isGroupSelected(group)} label={group.replaceAll('-', ' ')} size={CheckboxSize.Size14} onChange={handleGroupPermissionChange(group)} />
                {perms.map(({ key, value }) => (
                  <Checkbox
                    key={value}
                    checked={selectedPermissions.includes(value)}
                    label={key
                      .substring(key.indexOf('_') + 1)
                      .replaceAll('_', ' ')
                      .toLowerCase()}
                    size={CheckboxSize.Size14}
                    onChange={handlePermissionChange(value)}
                    wrapperClassName={s.permission}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className={gs.controls}>
            <Button style={ButtonStyle.Submit} content={submitButtonText} disabled={isSubmitting} onClick={handleSubmit} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

ApiClientStep.propTypes = {
  id: PropTypes.string,
  secret: PropTypes.string,
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isSubmitting: PropTypes.bool.isRequired,
  error: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  isUpdate: PropTypes.bool,
  title: PropTypes.string.isRequired,
  submitButtonText: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onMessageDismiss: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

ApiClientStep.defaultProps = {
  id: null,
  secret: null,
  error: undefined,
  isUpdate: false,
  onBack: undefined,
};

export default ApiClientStep;
