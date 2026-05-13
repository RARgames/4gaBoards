import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useForm, useSteps } from '../../hooks';
import { useDidUpdate, useToggle } from '../../lib/hooks';
import BoardTemplateManagerStep from '../BoardTemplateManagerStep';
import { Button, ButtonVariant, Icon, IconType, IconSize, Popup, Input, InputStyle, Form, withPopup, Dropdown, DropdownVariant, Checkbox } from '../Utils';
import ImportStep from './ImportStep';

import * as gs from '../../global.module.scss';
import * as s from './BoardAddPopup.module.scss';

const StepTypes = {
  IMPORT: 'IMPORT',
  TEMPLATE_MANAGER: 'TEMPLATE_MANAGER',
};

const BUILTIN_EMPTY_TEMPLATE = {
  id: 'builtin-empty',
  name: 'common.empty',
  icon: 'Star',
  data: { lists: [], labels: [] },
};

const BoardAddStep = React.memo(({ projects, projectId, skipProjectDropdown, isAdmin, templates, onCreate, onTemplateUpdate, onTemplateDelete, onBack, onClose }) => {
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

  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

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

  const templateOptions = useMemo(
    () => [
      BUILTIN_EMPTY_TEMPLATE,
      ...templates.map((template) => ({
        ...template,
        ...(template.isGlobal ? { icon: 'Star' } : {}),
      })),
    ],
    [templates],
  );
  const selectedTemplate = useMemo(() => templateOptions.find((temp) => temp.id === selectedTemplateId) || BUILTIN_EMPTY_TEMPLATE, [templateOptions, selectedTemplateId]);

  const handleTemplateChange = useCallback((value) => {
    setSelectedTemplateId(value.id);
  }, []);

  const handleTemplateUpdate = useCallback(
    (id, nextData) => {
      onTemplateUpdate(id, nextData);
    },
    [onTemplateUpdate],
  );

  const handleTemplateDelete = useCallback(
    (id) => {
      onTemplateDelete(id);
    },
    [onTemplateDelete],
  );

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
    const mappedLists = (selectedTemplate.data?.lists || []).map((list) => ({
      ...list,
      name: list.name.startsWith('common.') ? t(list.name) : list.name,
    }));

    const cleanData = {
      ...data,
      name: data.name.trim(),
      lists: mappedLists,
      labels: selectedTemplate.data?.labels || [],
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
  }, [data, selectedTemplate, importNonExistingUsers, importProjectManagers, selectedProject, onCreate, onClose, t]);

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

  if (step && step.type === StepTypes.TEMPLATE_MANAGER) {
    return <BoardTemplateManagerStep templates={templates} isAdmin={isAdmin} onUpdate={handleTemplateUpdate} onDelete={handleTemplateDelete} onBack={handleBack} />;
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
                variant={DropdownVariant.Default}
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
              <div className={s.templateLabelRow}>
                <div className={s.text}>{t('common.template')}</div>
                <Button variant={ButtonVariant.Icon} title={t('common.manageTemplates')} className={s.manageTemplatesButton} onClick={() => openStep(StepTypes.TEMPLATE_MANAGER)}>
                  <Icon type={IconType.Settings} size={IconSize.Size13} />
                </Button>
              </div>
              <Dropdown
                ref={templateDropdownRef}
                variant={DropdownVariant.Default}
                options={templateOptions}
                placeholder={selectedTemplate?.name}
                defaultItem={selectedTemplate}
                isSearchable
                translateI18nKeys
                selectFirstOnSearch
                onBlur={focusForm}
                onChange={handleTemplateChange}
                dropdownMenuClassName={s.dropdownMenu}
              />
            </div>
          )}
          {data.import && data.import.type === '4gaBoards' && (
            <div className={s.checkboxesWrapper}>
              <Checkbox checked={importProjectManagers} label={t('common.importProjectManagers')} onChange={toggleImportProjectManagers} wrapperClassName={s.checkboxWrapper} />
              <Checkbox
                checked={importNonExistingUsers}
                disabled={!isAdmin}
                label={`${t('common.importNonExistingUsers')}${!isAdmin ? ` ${t('common.requiresAdminRights')}` : ''}`}
                onChange={toggleImportNonExistingUsers}
                wrapperClassName={s.checkboxWrapper}
              />
            </div>
          )}
          <div className={gs.controlsSpaceBetween}>
            <Button variant={ButtonVariant.NoBackground} title={t('action.import')} onClick={handleImportClick} className={s.importButton}>
              <Icon type={data.import ? IconType.Attach : IconType.ArrowDown} size={IconSize.Size13} />
              {data.import ? data.import.file.name : t('action.import')}
            </Button>
            <Button variant={ButtonVariant.Submit} content={data.import ? t('common.importBoard', { context: 'title' }) : t('common.addBoard')} className={s.submitButton} onClick={handleSubmit} />
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
  templates: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onCreate: PropTypes.func.isRequired,
  onTemplateUpdate: PropTypes.func.isRequired,
  onTemplateDelete: PropTypes.func.isRequired,
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
