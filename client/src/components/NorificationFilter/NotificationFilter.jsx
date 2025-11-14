import React, { useCallback, useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useField } from '../../hooks';
import { Button, ButtonStyle, Input, Form, Icon, IconType, IconSize } from '../Utils';

import * as s from './NotificationFilter.module.scss';

const NotificationFilter = React.memo(({ defaultValue, items, filteredItems, className, onChangeFilterQuery, onFilterQueryClear }) => {
  const [t] = useTranslation();
  const field = useRef(null);
  const [value, handleFieldChange, setValue, handleFocus] = useField(defaultValue);
  const targets = useMemo(() => ['aggregated', 'project', 'board', 'user', 'card', 'text'], []);
  const [target, setTarget] = useState('aggregated');

  const submit = useCallback(
    (val, overrideTarget) => {
      const selected = overrideTarget || target;
      onChangeFilterQuery({ query: val, target: selected });
    },
    [target, onChangeFilterQuery],
  );

  const handleSubmit = useCallback(() => {
    submit(value);
  }, [submit, value]);

  const handleCancel = useCallback(() => {
    setValue(defaultValue);
    if (value !== '') {
      submit('');
    }
    onFilterQueryClear();
  }, [setValue, defaultValue, value, onFilterQueryClear, submit]);

  const handleChange = useCallback(
    (e) => {
      handleFieldChange(e);
      submit(e.target.value);
      if (e.target.value === '') {
        onFilterQueryClear();
      }
    },
    [handleFieldChange, onFilterQueryClear, submit],
  );

  const handleToggleClick = useCallback(() => {
    const idx = targets.indexOf(target);
    const next = targets[(idx + 1) % targets.length];
    setTarget(next);
    submit(value, next);
    field.current?.focus();
  }, [targets, target, submit, value]);

  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case 'Enter':
          handleSubmit();
          break;
        case 'Escape':
          handleCancel();
          break;
        case 'Tab':
          e.preventDefault(); // Prevent switching focus
          handleToggleClick();
          break;
        default:
      }
    },
    [handleCancel, handleSubmit, handleToggleClick],
  );

  const getCounterText = () => {
    if (value === '') return '';
    return `${t('common.ofNotifications', { filteredCount: filteredItems.length, count: items.length })} `;
  };

  const upperCasedTarget = target.charAt(0).toUpperCase() + target.slice(1);

  return (
    <div className={className}>
      <Form className={s.form} onKeyDown={handleKeyDown}>
        <Input ref={field} value={value} className={s.field} onChange={handleChange} placeholder={t(`common.filterBy${upperCasedTarget}`)} onFocus={handleFocus} />
        <Button style={ButtonStyle.Icon} title={t('common.toggleNotificationFilter')} onClick={handleToggleClick} className={s.inputButton} tabIndex="-1">
          <div className={s.inputButtonText}>{t(`common.filterId${upperCasedTarget}`)[0].toUpperCase()}</div> <Icon type={IconType.Switch} size={IconSize.Size13} />
        </Button>
      </Form>
      <div className={s.controls}>
        {value !== '' && <div className={s.counterText}> {getCounterText()} </div>}
        {value !== '' && (
          <Button style={ButtonStyle.Icon} title={t('common.clearFilter')} onClick={handleCancel} className={s.clearButton}>
            <Icon type={IconType.Close} size={IconSize.Size10} />
          </Button>
        )}
      </div>
    </div>
  );
});

NotificationFilter.propTypes = {
  defaultValue: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  filteredItems: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  className: PropTypes.string,
  onChangeFilterQuery: PropTypes.func.isRequired,
  onFilterQueryClear: PropTypes.func,
};

NotificationFilter.defaultProps = {
  onFilterQueryClear: () => {},
  className: undefined,
};

export default NotificationFilter;
