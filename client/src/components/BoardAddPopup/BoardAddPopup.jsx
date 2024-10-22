import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDidUpdate, useToggle } from '../../lib/hooks';
import { Button, ButtonStyle, Icon, IconType, IconSize, Popup, Input, Form, withPopup, Dropdown } from '../Utils';
import Config from '../../constants/Config';

import { useForm, useSteps } from '../../hooks';
import ImportStep from './ImportStep';

import styles from './BoardAddPopup.module.scss';
import gStyles from '../../globalStyles.module.scss';

const StepTypes = {
  IMPORT: 'IMPORT',
};

const AddStep = React.memo(({ projects, projectId, skipProjectDropdown, onCreate, onBack, onClose }) => {
  const [t] = useTranslation();

  const [isError, setIsError] = useState(false);

  const [selectedProject, setSelectedProject] = useState(() => {
    if (projectId) {
      const project = projects.find((p) => p.id === projectId);
      return project ? { id: project.id, name: project.name } : null;
    }
    return null;
  });

  const [template, setTemplate] = useState({
    id: 'empty',
    name: t('common.empty'),
  });

  const [data, handleFieldChange, setData] = useForm({
    name: '',
    import: null,
    isGithubConnected: false,
    githubRepo: '',
  });

  const [step, openStep, handleBack] = useSteps();
  const [focusNameFieldState, focusNameField] = useToggle();

  const nameField = useRef(null);

  const handleProjectChange = useCallback((value) => {
    setSelectedProject(value);
  }, []);

  // TODO move to the templates file
  const templates = useMemo(
    () => [
      {
        id: 'empty',
        name: t('common.empty'),
      },
      {
        id: 'simple',
        name: t('common.simple'),
        lists: Array.from({ length: 4 }, (_, i) => ({
          position: (i + 1) * Config.POSITION_GAP,
          name: t(`common.${['ideas', 'todo', 'inProgress', 'done'][i]}`),
          isCollapsed: false,
        })),
      },
      {
        id: 'kanban',
        name: t('common.kanban'),
        lists: Array.from({ length: 5 }, (_, i) => ({
          position: (i + 1) * Config.POSITION_GAP,
          name: t(`common.${['ideas', 'todo', 'inProgress', 'toTest', 'done'][i]}`),
          isCollapsed: false,
        })),
      },
    ],
    [t],
  );
  const selectedTemplate = useMemo(() => templates.find((temp) => temp.id === template.id), [templates, template]);

  const handleTemplateChange = useCallback((value) => {
    setTemplate(value);
  }, []);

  const handleImportSelect = useCallback(
    (nextImport) => {
      setData((prevData) => ({
        ...prevData,
        import: nextImport,
      }));
    },
    [setData],
  );

  const handleImportBack = useCallback(() => {
    handleBack();
    focusNameField();
  }, [handleBack, focusNameField]);

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
      lists: template.lists,
    };

    if (!cleanData.name) {
      nameField.current.select();
      return;
    }

    if (!selectedProject) {
      setIsError(true);
      return;
    }

    onCreate(selectedProject.id, cleanData);
    onClose();
  }, [data, template.lists, selectedProject, onCreate, onClose]);

  const handleImportClick = useCallback(() => {
    openStep(StepTypes.IMPORT);
  }, [openStep]);

  useEffect(() => {
    nameField.current.focus({
      preventScroll: true,
    });
  }, []);

  useDidUpdate(() => {
    nameField.current.focus();
  }, [focusNameFieldState]);

  if (step && step.type === StepTypes.IMPORT) {
    return <ImportStep onSelect={handleImportSelect} onBack={handleImportBack} />;
  }

  return (
    <>
      <Popup.Header onBack={onBack}>{t('common.addBoard')}</Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <Input ref={nameField} name="name" value={data.name} className={styles.field} onChange={handleFieldChange} />
          {!skipProjectDropdown && (
            <div>
              <div className={styles.text}>{t('common.project', { context: 'title' })}</div>
              <Dropdown
                options={projects}
                placeholder={projects.length < 1 ? t('common.noProjects') : selectedProject ? selectedProject.name : t('common.selectProject')} // eslint-disable-line no-nested-ternary
                defaultItem={selectedProject}
                isSearchable
                isError={isError}
                selectFirstOnSearch
                onChange={handleProjectChange}
                onErrorClear={() => setIsError(false)}
                className={styles.dropdown}
                dropdownMenuClassName={styles.dropdownMenu}
              />
            </div>
          )}
          {!data.import && (
            <div>
              <div className={styles.text}>{t('common.template')}</div>
              <Dropdown
                options={templates}
                placeholder={selectedTemplate.name}
                defaultItem={selectedTemplate}
                isSearchable
                selectFirstOnSearch
                onChange={handleTemplateChange}
                className={styles.dropdown}
                dropdownMenuClassName={styles.dropdownMenu}
              />
            </div>
          )}
          <div className={gStyles.controlsSpaceBetween}>
            <Button style={ButtonStyle.NoBackground} title={t('action.import')} onClick={handleImportClick} className={styles.importButton}>
              <Icon type={data.import ? IconType.Attach : IconType.ArrowDown} size={IconSize.Size13} />
              {data.import ? data.import.file.name : t('action.import')}
            </Button>
            <Button style={ButtonStyle.Submit} content={t('common.addBoard')} className={styles.submitButton} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

AddStep.propTypes = {
  projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  projectId: PropTypes.string,
  skipProjectDropdown: PropTypes.bool,
  onCreate: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

AddStep.defaultProps = {
  projectId: undefined,
  skipProjectDropdown: false,
  onBack: undefined,
};

export default withPopup(AddStep);
export { AddStep as BoardAddStep };
