import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format, setHours, setMinutes, startOfDay } from 'date-fns';
import PropTypes from 'prop-types';

import { useForm } from '../../hooks';
import { Button, ButtonStyle, Dropdown, DropdownStyle, Icon, IconType, IconSize, Input, InputStyle, TextArea, TextAreaStyle, Popup, Form } from '../Utils';
import ProjectTicketPicker from './ProjectTicketPicker';

import * as gs from '../../global.module.scss';
import * as s from './EntryPopup.module.scss';

const VIEWPORT_MARGIN = 10;

const createData = (initialValues) => ({
  description: (initialValues && initialValues.description) || '',
  startTime: format(initialValues.startedAt, 'HH:mm'),
  endTime: format(initialValues.endedAt, 'HH:mm'),
});

const getDefaultCategoryTagId = (mode, initialValues, categoryTags) => {
  if (mode === 'create') {
    const developmentTag = categoryTags.find((tag) => !tag.projectId && tag.name.toLowerCase() === 'development');
    return developmentTag ? developmentTag.id : null;
  }
  return (initialValues && initialValues.categoryTagId) || null;
};

const parseTimeToDate = (baseDate, value) => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    return null;
  }
  return setMinutes(setHours(startOfDay(baseDate), hours), minutes);
};

const EntryPopup = React.memo(({ mode, anchorRect, initialValues, projectOptions, assignedCards, allCards, categoryTags, isAdmin, loggedByName, onSave, onDelete, onClose, onCreateCategoryTag }) => {
  const [t] = useTranslation();
  const [data, handleFieldChange, setData] = useForm(() => createData(initialValues));
  const [projectId, setProjectId] = useState(initialValues.projectId || null);
  const [cardId, setCardId] = useState(initialValues.cardId || null);
  const [categoryTagId, setCategoryTagId] = useState(() => getDefaultCategoryTagId(mode, initialValues, categoryTags));
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [pendingCategoryName, setPendingCategoryName] = useState(null);
  const [isError, setIsError] = useState(false);
  const [style, setStyle] = useState({ top: anchorRect.top, left: anchorRect.left, visibility: 'hidden' });

  const popupRef = useRef(null);
  const descriptionField = useRef(null);

  useEffect(() => {
    setData(createData(initialValues));
    setProjectId(initialValues.projectId || null);
    setCardId(initialValues.cardId || null);
    setCategoryTagId(getDefaultCategoryTagId(mode, initialValues, categoryTags));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  useLayoutEffect(() => {
    const popupEl = popupRef.current;
    if (!popupEl) {
      return;
    }

    const { offsetWidth, offsetHeight } = popupEl;

    let left = anchorRect.left + (anchorRect.width || 0) + 12;
    if (left + offsetWidth + VIEWPORT_MARGIN > window.innerWidth) {
      left = anchorRect.left - offsetWidth - 12;
    }
    if (left < VIEWPORT_MARGIN) {
      left = Math.min(Math.max(anchorRect.left, VIEWPORT_MARGIN), window.innerWidth - offsetWidth - VIEWPORT_MARGIN);
    }

    let { top } = anchorRect;
    if (top + offsetHeight + VIEWPORT_MARGIN > window.innerHeight) {
      top = window.innerHeight - offsetHeight - VIEWPORT_MARGIN;
    }
    if (top < VIEWPORT_MARGIN) {
      top = VIEWPORT_MARGIN;
    }

    setStyle({ top, left, visibility: 'visible' });
  }, [anchorRect]);

  useEffect(() => {
    descriptionField.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const handlePointerDown = (e) => {
      // The category Dropdown's open menu renders through a portal at the end of <body>, outside
      // popupRef's DOM subtree, so a click on an option would otherwise look like an outside click
      // and close the whole popup (discarding unsaved changes) before the option's own click fires.
      if (popupRef.current && !popupRef.current.contains(e.target) && !e.target.closest(`.${s.dropdownMenu}`)) {
        onClose();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // If the linked project changes, drop a category selection that no longer applies
  // (a custom tag scoped to the previous project isn't valid for the new one).
  useEffect(() => {
    const isStillValid = categoryTags.some((tag) => tag.id === categoryTagId && (!tag.projectId || tag.projectId === projectId));
    if (categoryTagId && !isStillValid) {
      setCategoryTagId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (!pendingCategoryName) {
      return;
    }

    const match = categoryTags.find((tag) => tag.projectId === projectId && tag.name.toLowerCase() === pendingCategoryName.toLowerCase());

    if (match) {
      setCategoryTagId(match.id);
      setPendingCategoryName(null);
      setIsAddingCategory(false);
      setNewCategoryName('');
    }
  }, [categoryTags, pendingCategoryName, projectId]);

  const handleSubmit = useCallback(() => {
    const startedAt = parseTimeToDate(initialValues.startedAt, data.startTime);
    const endedAt = parseTimeToDate(initialValues.startedAt, data.endTime);

    if (!startedAt || !endedAt || endedAt <= startedAt) {
      setIsError(true);
      return;
    }

    onSave({
      description: data.description.trim(),
      categoryTagId,
      startedAt,
      endedAt,
      projectId,
      cardId,
    });
  }, [data, initialValues.startedAt, categoryTagId, projectId, cardId, onSave]);

  const handleKeyDown = useCallback(
    (e) => {
      setIsError(false);
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handlePickerChange = useCallback(
    ({ projectId: nextProjectId, cardId: nextCardId, cardName: nextCardName }) => {
      setProjectId(nextProjectId);
      setCardId(nextCardId);

      if (nextCardId && nextCardName) {
        setData((prevData) => (prevData.description ? prevData : { ...prevData, description: nextCardName }));
      }
    },
    [setData],
  );

  const categoryOptions = useMemo(() => categoryTags.filter((tag) => !tag.projectId || tag.projectId === projectId).map((tag) => ({ id: tag.id, name: tag.name })), [categoryTags, projectId]);

  const handleAddCategory = useCallback(() => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName || !projectId) {
      return;
    }
    onCreateCategoryTag({ name: trimmedName, projectId });
    setPendingCategoryName(trimmedName);
  }, [newCategoryName, projectId, onCreateCategoryTag]);

  const handleCancelAddCategory = useCallback(() => {
    setIsAddingCategory(false);
    setNewCategoryName('');
  }, []);

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div className={s.popup} ref={popupRef} style={style} onKeyDown={handleKeyDown} data-prevent-card-switch>
      <Button style={ButtonStyle.Icon} title={t('common.close')} onClick={onClose} className={s.closeButton}>
        <Icon type={IconType.Close} size={IconSize.Size14} />
      </Button>
      <Popup.Header>{mode === 'edit' ? t('common.editTimeEntry', { context: 'title' }) : t('common.addTimeEntry', { context: 'title' })}</Popup.Header>
      <Popup.Content isMinContent className={s.content}>
        {loggedByName && <div className={s.loggedBy}>{t('common.loggedBy', { name: loggedByName })}</div>}
        <Form>
          <div className={s.fieldLabel}>{t('common.category')}</div>
          <Dropdown
            style={DropdownStyle.Default}
            options={categoryOptions}
            defaultItem={categoryOptions.find((option) => option.id === categoryTagId)}
            placeholder={t('common.category')}
            onChange={(item) => setCategoryTagId(item.id)}
            className={s.categoryField}
            dropdownMenuClassName={s.dropdownMenu}
          />
          {isAdmin &&
            projectId &&
            (isAddingCategory ? (
              <div className={s.addCategoryRow}>
                <Input style={InputStyle.Default} value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder={t('common.newCategoryName')} className={s.addCategoryInput} />
                <Button style={ButtonStyle.Submit} content={t('action.add')} onClick={handleAddCategory} />
                <Button style={ButtonStyle.Cancel} content={t('action.cancel')} onClick={handleCancelAddCategory} />
              </div>
            ) : (
              // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
              <div className={s.addCategoryAffordance} onClick={() => setIsAddingCategory(true)}>
                <Icon type={IconType.Plus} size={IconSize.Size10} />
                {t('common.addCategory')}
              </div>
            ))}
          <ProjectTicketPicker projectId={projectId} cardId={cardId} projects={projectOptions} assignedCards={assignedCards} allCards={allCards} onChange={handlePickerChange} />
          <TextArea
            ref={descriptionField}
            style={TextAreaStyle.Default}
            name="description"
            value={data.description}
            placeholder={t('common.description')}
            onChange={handleFieldChange}
            className={s.descriptionField}
          />
          <div className={s.timeRow}>
            <div className={s.timeField}>
              <div className={s.fieldLabel}>{t('common.start')}</div>
              <Input style={InputStyle.Default} name="startTime" value={data.startTime} onChange={handleFieldChange} isError={isError} />
            </div>
            <div className={s.timeField}>
              <div className={s.fieldLabel}>{t('common.end')}</div>
              <Input style={InputStyle.Default} name="endTime" value={data.endTime} onChange={handleFieldChange} isError={isError} />
            </div>
          </div>
          <div className={gs.controlsSpaceBetween}>
            {mode === 'edit' ? <Button style={ButtonStyle.Cancel} content={t('action.delete')} onClick={onDelete} /> : <span />}
            <Button style={ButtonStyle.Submit} content={t('action.save')} onClick={handleSubmit} />
          </div>
        </Form>
      </Popup.Content>
    </div>
  );
});

EntryPopup.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
  anchorRect: PropTypes.shape({
    top: PropTypes.number,
    left: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
  }).isRequired,
  initialValues: PropTypes.shape({
    description: PropTypes.string,
    startedAt: PropTypes.instanceOf(Date).isRequired,
    endedAt: PropTypes.instanceOf(Date).isRequired,
    projectId: PropTypes.string,
    cardId: PropTypes.string,
    categoryTagId: PropTypes.string,
  }).isRequired,
  projectOptions: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  assignedCards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allCards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  categoryTags: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isAdmin: PropTypes.bool.isRequired,
  loggedByName: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  onCreateCategoryTag: PropTypes.func.isRequired,
};

EntryPopup.defaultProps = {
  loggedByName: null,
  onDelete: undefined,
};

export default EntryPopup;
