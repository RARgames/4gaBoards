import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle, Input, Form, Icon, IconType, IconSize } from '../Utils';
import { useField } from '../../hooks';
import { useToggle } from '../../lib/hooks';

import styles from './Filter.module.scss';

const Filter = React.memo(({ defaultValue, projects, filteredProjects, onChangeFilterQuery }) => {
  const [t] = useTranslation();
  const field = useRef(null);
  const [value, handleFieldChange, setValue, handleFocus] = useField(defaultValue);
  const [isTargetBoard, toggleFilterTarget] = useToggle();

  const submit = useCallback(
    (val, overrideTarget = false) => {
      const cleanValue = val.trim();

      if ((!overrideTarget && isTargetBoard) || (overrideTarget && !isTargetBoard)) {
        onChangeFilterQuery({ query: cleanValue, target: 'board' });
      } else {
        onChangeFilterQuery({ query: cleanValue, target: 'project' });
      }
    },
    [isTargetBoard, onChangeFilterQuery],
  );

  const handleSubmit = useCallback(() => {
    submit(value);
  }, [submit, value]);

  const handleCancel = useCallback(() => {
    setValue(defaultValue);
    submit('');
  }, [setValue, defaultValue, submit]);

  const handleChange = useCallback(
    (event) => {
      handleFieldChange(event);
      submit(event.target.value);
    },
    [handleFieldChange, submit],
  );

  const handleToggleClick = useCallback(() => {
    toggleFilterTarget();
    submit(value, true);
    field.current.focus();
  }, [submit, toggleFilterTarget, value]);

  const handleKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case 'Enter':
          event.preventDefault();
          handleSubmit();
          break;
        case 'Escape':
          event.preventDefault();
          handleCancel();
          break;
        case 'Tab':
          event.preventDefault();
          handleToggleClick();
          break;
        default:
      }
    },
    [handleCancel, handleSubmit, handleToggleClick],
  );

  const getCounterText = () => {
    if (value !== '') {
      if (isTargetBoard) {
        const boardsCount = filteredProjects.reduce((sum, project) => sum + (project.boards ? project.boards.length : 0), 0);
        const boardsText = boardsCount !== 1 ? `${boardsCount} ${t('common.boards')}` : `${boardsCount} ${t('common.board')}`;
        return `${[`${boardsText} (${filteredProjects.length}/${projects.length} `] + [projects.length !== 1 ? t('common.projects') : t('common.project')]})`;
      }
      return [`${filteredProjects.length} ${t('common.of')} ${projects.length} `] + [projects.length !== 1 ? t('common.projects') : t('common.project')];
    }
    return '';
  };

  return (
    <div className={styles.wrapper}>
      <Form onSubmit={handleSubmit} className={styles.form} onKeyDown={handleKeyDown}>
        <Input ref={field} value={value} className={styles.field} onChange={handleChange} placeholder={isTargetBoard ? t('common.filterBoards') : t('common.filterProjects')} onFocus={handleFocus} />
        <Button style={ButtonStyle.Icon} title={t('common.toggleFilter')} onClick={handleToggleClick} className={styles.inputButton} tabIndex="-1">
          <div className={styles.inputButtonText}>{isTargetBoard ? 'B' : 'P'}</div> <Icon type={IconType.Switch} size={IconSize.Size13} className={styles.inputButtonIcon} />
        </Button>
      </Form>
      <div className={styles.controls}>
        {value !== '' && <div className={styles.counterText}> {getCounterText()} </div>}
        {value !== '' && (
          <Button style={ButtonStyle.Icon} title={t('common.clearFilter')} onClick={handleCancel} className={styles.clearButton}>
            <Icon type={IconType.Close} size={IconSize.Size10} />
          </Button>
        )}
      </div>
    </div>
  );
});

Filter.propTypes = {
  defaultValue: PropTypes.string.isRequired, // eslint-disable-line react/forbid-prop-types
  projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  filteredProjects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onChangeFilterQuery: PropTypes.func.isRequired,
};

export default Filter;
