import React, { useCallback, useRef, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import Paths from '../../constants/Paths';
import { useField } from '../../hooks';
import { Button, ButtonStyle, Input, Form, Icon, IconType, IconSize } from '../Utils';

import * as s from './Filter.module.scss';

const Filter = React.memo(({ defaultValue, projects, filteredProjects, path, onChangeFilterQuery, onFilterQueryClear }) => {
  const [t] = useTranslation();
  const field = useRef(null);
  const [value, handleFieldChange, setValue, handleFocus] = useField(defaultValue);
  const targets = useMemo(() => ['project', 'board'], []);
  const [target, setTarget] = useState('project');

  const prevPathRef = useRef();

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

  useEffect(() => {
    if (prevPathRef.current !== path) {
      if (path === Paths.ROOT) {
        if (target === 'board') {
          setTarget('project');
        }
        handleCancel();
        field.current?.focus();
      } else if (path === Paths.PROJECTS) {
        if (target !== 'board') {
          setTarget('board');
        }
        handleCancel();
        field.current?.focus();
      }
    }
    prevPathRef.current = path;
  }, [handleCancel, target, onFilterQueryClear, path, setTarget]);

  const getCounterText = () => {
    if (value !== '') {
      if (target === 'board') {
        const boardsCount = filteredProjects.reduce((sum, project) => sum + (project.boards ? project.boards.length : 0), 0);
        return `${t('common.boards', { count: boardsCount })} (${filteredProjects.length}/${t('common.projects', { count: projects.length })})`;
      }
      return t('common.ofProjects', { filteredCount: filteredProjects.length, count: projects.length });
    }
    return '';
  };

  const upperCasedTarget = target.charAt(0).toUpperCase() + target.slice(1);

  return (
    <div>
      <Form className={s.form} onKeyDown={handleKeyDown}>
        <Input ref={field} value={value} className={s.field} onChange={handleChange} placeholder={t(`common.filter${upperCasedTarget}s`)} onFocus={handleFocus} />
        <Button style={ButtonStyle.Icon} title={t('common.toggleFilter')} onClick={handleToggleClick} className={s.inputButton} tabIndex="-1">
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

Filter.propTypes = {
  defaultValue: PropTypes.string.isRequired,
  projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  filteredProjects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  path: PropTypes.string.isRequired,
  onChangeFilterQuery: PropTypes.func.isRequired,
  onFilterQueryClear: PropTypes.func.isRequired,
};

export default Filter;
