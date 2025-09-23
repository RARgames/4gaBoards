import React, { useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import Paths from '../../constants/Paths';
import { useField } from '../../hooks';
import { useToggle } from '../../lib/hooks';
import { Button, ButtonStyle, Input, Form, Icon, IconType, IconSize } from '../Utils';

import * as s from './Filter.module.scss';

const Filter = React.memo(({ defaultValue, projects, filteredProjects, path, onChangeFilterQuery, onFilterQueryClear }) => {
  const [t] = useTranslation();
  const field = useRef(null);
  const [value, handleFieldChange, setValue, handleFocus] = useField(defaultValue);
  const [isTargetBoard, toggleFilterTarget] = useToggle();
  const prevPathRef = useRef();

  const submit = useCallback(
    (val, overrideTarget = false) => {
      if ((!overrideTarget && isTargetBoard) || (overrideTarget && !isTargetBoard)) {
        onChangeFilterQuery({ query: val, target: 'board' });
      } else {
        onChangeFilterQuery({ query: val, target: 'project' });
      }
    },
    [isTargetBoard, onChangeFilterQuery],
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
    toggleFilterTarget();
    submit(value, true);
    field.current?.focus();
  }, [submit, toggleFilterTarget, value]);

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
        if (isTargetBoard) {
          toggleFilterTarget();
        }
        handleCancel();
        field.current?.focus();
      } else if (path === Paths.PROJECTS) {
        if (!isTargetBoard) {
          toggleFilterTarget();
        }
        handleCancel();
        field.current?.focus();
      }
    }
    prevPathRef.current = path;
  }, [handleCancel, isTargetBoard, onFilterQueryClear, path, toggleFilterTarget]);

  const getCounterText = () => {
    if (value !== '') {
      if (isTargetBoard) {
        const boardsCount = filteredProjects.reduce((sum, project) => sum + (project.boards ? project.boards.length : 0), 0);
        return `${t('common.boards', { count: boardsCount })} (${filteredProjects.length}/${t('common.projects', { count: projects.length })})`;
      }
      return `${filteredProjects.length} ${t('common.ofProjects', { count: projects.length })}`;
    }
    return '';
  };

  return (
    <div>
      <Form className={s.form} onKeyDown={handleKeyDown}>
        <Input ref={field} value={value} className={s.field} onChange={handleChange} placeholder={isTargetBoard ? t('common.filterBoards') : t('common.filterProjects')} onFocus={handleFocus} />
        <Button style={ButtonStyle.Icon} title={t('common.toggleFilter')} onClick={handleToggleClick} className={s.inputButton} tabIndex="-1">
          <div className={s.inputButtonText}>{isTargetBoard ? 'B' : 'P'}</div> <Icon type={IconType.Switch} size={IconSize.Size13} />
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
