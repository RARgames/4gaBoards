import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import Config from '../../constants/Config';
import { useForm, useSteps } from '../../hooks';
import { useDidUpdate, useToggle } from '../../lib/hooks';
import { Button, ButtonStyle, Icon, IconType, IconSize, Popup, Input, InputStyle, Form, withPopup, Dropdown, DropdownStyle, Checkbox } from '../Utils';
import ImportStep from './ImportStep';

import * as gs from '../../global.module.scss';
import * as s from './BoardAddPopup.module.scss';

const StepTypes = {
  IMPORT: 'IMPORT',
};

const BoardAddStep = React.memo(({ projects, projectId, skipProjectDropdown, isAdmin, onCreate, onBack, onClose }) => {
  const [t] = useTranslation();

  const [isDropdownError, setIsDropdownError] = useState(false);
  const [isInputError, setIsInputError] = useState(false);
  const [importNonExistingUsers, toggleImportNonExistingUsers] = useToggle(false);
  const [importProjectManagers, toggleImportProjectManagers] = useToggle(false);
  const projectDropdownRef = useRef(null);
  const templateDropdownRef = useRef(null);

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

  const formRef = useRef(null);
  const [focusFromState, focusForm] = useToggle();
  const [step, openStep, handleBack] = useSteps();
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
    requestAnimationFrame(() => {
      nameField.current?.focus({ preventScroll: true });
    });
  }, [handleBack]);

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
      lists: template.lists,
      importNonExistingUsers,
      importProjectManagers,
    };

    if (!cleanData.name) {
      nameField.current?.focus();
      setIsInputError(true);
      return;
    }

    if (!selectedProject) {
      setIsDropdownError(true);
      return;
    }

    onCreate(selectedProject.id, cleanData);
    onClose();
  }, [data, template.lists, importNonExistingUsers, importProjectManagers, selectedProject, onCreate, onClose]);

  const handleImportClick = useCallback(() => {
    openStep(StepTypes.IMPORT);
  }, [openStep]);

  const handleFieldKeyDown = useCallback(() => {
    setIsInputError(false);
  }, []);

  useEffect(() => {
    nameField.current?.focus({ preventScroll: true });
  }, []);

  const handleFormKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case 'Enter': {
          handleSubmit();
          break;
        }
        default:
      }
    },
    [handleSubmit],
  );

  useDidUpdate(() => {
    formRef.current?.focus();
  }, [focusFromState]);

  if (step && step.type === StepTypes.IMPORT) {
    return <ImportStep onSelect={handleImportSelect} onBack={handleImportBack} />;
  }

  return (
    <>
      <Popup.Header onBack={onBack}>{t('common.addBoard')}</Popup.Header>
      <Popup.Content>
        <Form ref={formRef} tabIndex="0" onKeyDown={handleFormKeyDown}>
          <div className={s.text}>{t('common.name')}</div>
          <Input
            ref={nameField}
            style={InputStyle.Default}
            name="name"
            value={data.name}
            placeholder={t('common.enterBoardName')}
            onKeyDown={handleFieldKeyDown}
            onChange={handleFieldChange}
            isError={isInputError}
          />
          {!skipProjectDropdown && (
            <div>
              <div className={s.text}>{t('common.project', { context: 'title' })}</div>
              <Dropdown
                ref={projectDropdownRef}
                style={DropdownStyle.Default}
                options={projects}
                placeholder={projects.length < 1 ? t('common.noProjects') : selectedProject ? selectedProject.name : t('common.selectProject')} // eslint-disable-line no-nested-ternary
                defaultItem={selectedProject}
                isSearchable
                isError={isDropdownError}
                selectFirstOnSearch
                onBlur={focusForm}
                onChange={handleProjectChange}
                onErrorClear={() => setIsDropdownError(false)}
                dropdownMenuClassName={s.dropdownMenu}
              />
            </div>
          )}
          {!data.import && (
            <div>
              <div className={s.text}>{t('common.template')}</div>
              <Dropdown
                ref={templateDropdownRef}
                style={DropdownStyle.Default}
                options={templates}
                placeholder={selectedTemplate.name}
                defaultItem={selectedTemplate}
                isSearchable
                selectFirstOnSearch
                onBlur={focusForm}
                onChange={handleTemplateChange}
                dropdownMenuClassName={s.dropdownMenu}
              />
            </div>
          )}
          {data.import && data.import.type === '4gaBoards' && (
            <div className={s.checkboxesWrapper}>
              <div className={s.checkboxWrapper}>
                <Checkbox checked={importProjectManagers} className={s.checkbox} onChange={toggleImportProjectManagers} />
              </div>
              <div className={s.checkboxText}>{t('common.importProjectManagers')}</div>
              <div className={s.checkboxWrapper}>
                <Checkbox checked={importNonExistingUsers} disabled={!isAdmin} className={s.checkbox} onChange={toggleImportNonExistingUsers} />
              </div>
              <div className={s.checkboxText}>
                {t('common.importNonExistingUsers')} {!isAdmin && t('common.requiresAdminRights')}
              </div>
            </div>
          )}
          <div className={gs.controlsSpaceBetween}>
            <Button style={ButtonStyle.NoBackground} title={t('action.import')} onClick={handleImportClick} className={s.importButton}>
              <Icon type={data.import ? IconType.Attach : IconType.ArrowDown} size={IconSize.Size13} />
              {data.import ? data.import.file.name : t('action.import')}
            </Button>
            <Button style={ButtonStyle.Submit} content={data.import ? t('common.importBoard', { context: 'title' }) : t('common.addBoard')} className={s.submitButton} onClick={handleSubmit} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

BoardAddStep.propTypes = {
  projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  projectId: PropTypes.string,
  skipProjectDropdown: PropTypes.bool,
  isAdmin: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

BoardAddStep.defaultProps = {
  projectId: undefined,
  skipProjectDropdown: false,
  onBack: undefined,
};

export default withPopup(BoardAddStep);
export { BoardAddStep };
