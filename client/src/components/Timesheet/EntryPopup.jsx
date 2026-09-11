import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { format } from 'date-fns';
import PropTypes from 'prop-types';

import { useForm } from '../../hooks';
import formatDuration from '../../utils/format-duration';
import parseTimeEntryRange from '../../utils/time-entry-range';
import { Button, ButtonStyle, Dropdown, DropdownStyle, Icon, IconType, IconSize, Input, InputStyle, TextArea, TextAreaStyle, Popup, Form } from '../Utils';
import ProjectTicketPicker from './ProjectTicketPicker';

import * as gs from '../../global.module.scss';
import * as s from './EntryPopup.module.scss';

const VIEWPORT_MARGIN = 10;

const createData = (initialValues) => ({
  title: (initialValues && initialValues.title) || '',
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

const LAST_PROJECT_BOARD_KEY_PREFIX = 'timesheetLastProjectBoard:';

const readLastProjectBoard = (userId) => {
  if (!userId) {
    return null;
  }
  try {
    const raw = localStorage.getItem(`${LAST_PROJECT_BOARD_KEY_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeLastProjectBoard = (userId, nextProjectId, nextBoardId) => {
  if (!userId || !nextProjectId) {
    return;
  }
  try {
    localStorage.setItem(`${LAST_PROJECT_BOARD_KEY_PREFIX}${userId}`, JSON.stringify({ projectId: nextProjectId, boardId: nextBoardId || null }));
  } catch {
    // Ignore storage errors (quota exceeded, privacy mode, etc.)
  }
};

// Only auto-fill blank new entries — an entry with a preset project (editing, or created via the
// "+" jump from a card's details) should keep showing its own project untouched.
const getInitialProjectId = (mode, initialValues, currentUserId) => {
  if (initialValues.projectId) {
    return initialValues.projectId;
  }
  if (mode === 'create') {
    const remembered = readLastProjectBoard(currentUserId);
    if (remembered) {
      return remembered.projectId;
    }
  }
  return null;
};

const getInitialBoardId = (mode, initialValues, currentUserId) => {
  if (initialValues.projectId) {
    return initialValues.boardId || null;
  }
  if (mode === 'create') {
    const remembered = readLastProjectBoard(currentUserId);
    if (remembered) {
      return remembered.boardId || null;
    }
  }
  return null;
};

const EntryPopup = React.memo(
  ({ mode, anchorRect, initialValues, projectOptions, assignedCards, allCards, categoryTags, isAdmin, currentUserId, loggedByName, onSave, onDelete, onDuplicate, onClose, onCreateCategoryTag }) => {
    const [t] = useTranslation();
    const [data, handleFieldChange, setData] = useForm(() => createData(initialValues));
    const [projectId, setProjectId] = useState(() => getInitialProjectId(mode, initialValues, currentUserId));
    const [boardId, setBoardId] = useState(() => getInitialBoardId(mode, initialValues, currentUserId));
    const [listId, setListId] = useState(initialValues.listId || null);
    const [cardId, setCardId] = useState(initialValues.cardId || null);
    // When a board card is linked, the card's own name is the entry's title, so the field becomes a
    // read-only mirror of it. Seeded from the grid entry on edit, and refreshed by the picker when a
    // card is picked or created (the picker can resolve names the grid's cache can't).
    const [linkedCardName, setLinkedCardName] = useState(initialValues.cardName || null);
    const [categoryTagId, setCategoryTagId] = useState(() => getDefaultCategoryTagId(mode, initialValues, categoryTags));
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [pendingCategoryName, setPendingCategoryName] = useState(null);
    const [isError, setIsError] = useState(false);
    // The range arrives already decided (dragged out on the grid, or the entry being edited), so
    // the inputs stay folded away behind the stated summary until the user asks to change it.
    const [isEditingTimes, setIsEditingTimes] = useState(false);
    const [style, setStyle] = useState({ top: anchorRect.top, left: anchorRect.left, visibility: 'hidden' });

    const popupRef = useRef(null);
    const descriptionField = useRef(null);

    useEffect(() => {
      setData(createData(initialValues));
      setProjectId(getInitialProjectId(mode, initialValues, currentUserId));
      setBoardId(getInitialBoardId(mode, initialValues, currentUserId));
      setListId(initialValues.listId || null);
      setCardId(initialValues.cardId || null);
      setLinkedCardName(initialValues.cardName || null);
      setCategoryTagId(getDefaultCategoryTagId(mode, initialValues, categoryTags));
      setIsEditingTimes(false);
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
      const range = parseTimeEntryRange(initialValues.startedAt, initialValues.endedAt, data.startTime, data.endTime);

      if (!range) {
        setIsError(true);
        // The fields are folded away by default, so unfold them — otherwise the error marks a
        // summary the user has no way to correct.
        setIsEditingTimes(true);
        return;
      }

      writeLastProjectBoard(currentUserId, projectId, boardId);

      onSave({
        title: data.title.trim(),
        description: data.description.trim(),
        categoryTagId,
        startedAt: range.startedAt,
        endedAt: range.endedAt,
        projectId,
        cardId,
      });
    }, [data, initialValues.startedAt, initialValues.endedAt, categoryTagId, projectId, boardId, cardId, currentUserId, onSave]);

    const handleDuplicate = useCallback(() => {
      if (!onDuplicate) {
        return;
      }
      onDuplicate({
        title: data.title.trim(),
        description: data.description.trim(),
        categoryTagId,
        projectId,
        cardId,
        startedAt: initialValues.startedAt,
        endedAt: initialValues.endedAt,
      });
    }, [onDuplicate, data.title, data.description, categoryTagId, projectId, cardId, initialValues.startedAt, initialValues.endedAt]);

    const handleKeyDown = useCallback(
      (e) => {
        setIsError(false);
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          handleSubmit();
        }
      },
      [handleSubmit],
    );

    const handlePickerChange = useCallback(({ projectId: nextProjectId, boardId: nextBoardId, listId: nextListId, cardId: nextCardId, cardName: nextCardName }) => {
      setProjectId(nextProjectId);
      setBoardId(nextBoardId || null);
      setListId(nextListId || null);
      setCardId(nextCardId);
      setLinkedCardName(nextCardId ? nextCardName || null : null);
    }, []);

    const categoryOptions = useMemo(() => categoryTags.filter((tag) => !tag.projectId || tag.projectId === projectId).map((tag) => ({ id: tag.id, name: tag.name })), [categoryTags, projectId]);

    const handleAddCategory = useCallback(() => {
      const trimmedName = newCategoryName.trim();
      if (!trimmedName || !projectId) {
        return;
      }
      onCreateCategoryTag({ name: trimmedName, projectId });
      setPendingCategoryName(trimmedName);
    }, [newCategoryName, projectId, onCreateCategoryTag]);

    const handleToggleTimes = useCallback(() => {
      setIsEditingTimes((prev) => !prev);
    }, []);

    // Reads back the range the user is actually about to save (edits to the fields included), so
    // the summary is never stale. Null while the fields don't parse — the raw text is shown instead.
    const whenSummary = useMemo(() => {
      const range = parseTimeEntryRange(initialValues.startedAt, initialValues.endedAt, data.startTime, data.endTime);
      if (!range) {
        return null;
      }
      const minutes = Math.round((range.endedAt.getTime() - range.startedAt.getTime()) / 60000);
      return `${format(range.startedAt, 'EEE d MMM')} · ${format(range.startedAt, 'HH:mm')}–${format(range.endedAt, 'HH:mm')} · ${formatDuration(minutes)}`;
    }, [initialValues.startedAt, initialValues.endedAt, data.startTime, data.endTime]);

    const handleStartAddCategory = useCallback(() => {
      setIsAddingCategory(true);
    }, []);

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
          {/* When → what → where. The range was already set by the drag (or by the entry being
              edited), so it is stated rather than asked for; the fields below are what's left to
              fill in. Editing it is one click away, but it no longer leads the form. */}
          <div className={clsx(s.whenBar, isError && s.whenBarError)}>
            <span className={s.whenSummary}>{whenSummary || `${data.startTime} – ${data.endTime}`}</span>
            <button type="button" className={s.whenEdit} onClick={handleToggleTimes} title={t('common.editTimes')}>
              {isEditingTimes ? t('common.done') : t('action.edit')}
            </button>
          </div>
          {isEditingTimes && (
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
          )}
          {loggedByName && <div className={s.loggedBy}>{t('common.loggedBy', { name: loggedByName })}</div>}
          <Form>
            <div className={s.fieldLabel}>{t('common.title')}</div>
            <Input
              style={InputStyle.Default}
              name="title"
              value={data.title}
              // A card-linked entry with no title of its own already falls back to the card's name
              // wherever it's displayed (see WeekGrid's entry label), so the card name belongs here
              // as the placeholder, not the value — typing overrides it, clearing restores it.
              placeholder={(cardId && linkedCardName) || t('common.titlePlaceholder')}
              onChange={handleFieldChange}
              title={cardId ? t('common.titleOverridesCardName') : undefined}
              className={s.titleField}
            />
            <div className={s.fieldLabel}>{t('common.whatWasDone')}</div>
            <TextArea
              ref={descriptionField}
              style={TextAreaStyle.Default}
              name="description"
              value={data.description}
              placeholder={t('common.whatWasDone')}
              onChange={handleFieldChange}
              className={s.descriptionField}
            />
            <div className={s.fieldLabel}>{t('common.category')}</div>
            <Dropdown
              style={DropdownStyle.Default}
              options={categoryOptions}
              defaultItem={categoryOptions.find((option) => option.id === categoryTagId)}
              placeholder={t('common.category')}
              onChange={(item) => setCategoryTagId(item.id)}
              className={s.categoryField}
              dropdownMenuClassName={s.dropdownMenu}
              footer={
                // Admin-only: adding a category here creates one for everyone on the project, so it
                // lives in the menu as an action rather than a selectable value.
                isAdmin && projectId ? (
                  // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
                  <div className={s.addCategoryOption} onClick={handleStartAddCategory} onMouseDown={(e) => e.preventDefault()} data-prevent-card-switch>
                    <Icon type={IconType.Plus} size={IconSize.Size10} />
                    {t('common.addCategory')}
                  </div>
                ) : null
              }
            />
            {isAdmin && projectId && isAddingCategory && (
              <div className={s.addCategoryRow}>
                <Input style={InputStyle.Default} value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder={t('common.newCategoryName')} className={s.addCategoryInput} />
                <Button style={ButtonStyle.Submit} content={t('action.add')} onClick={handleAddCategory} />
                <Button style={ButtonStyle.Cancel} content={t('action.cancel')} onClick={handleCancelAddCategory} />
              </div>
            )}
            <div className={s.fieldLabel}>{t('common.linkedWork')}</div>
            <ProjectTicketPicker
              projectId={projectId}
              boardId={boardId}
              listId={listId}
              cardId={cardId}
              projects={projectOptions}
              assignedCards={assignedCards}
              allCards={allCards}
              defaultCardName={data.title}
              onChange={handlePickerChange}
            />
            <div className={gs.controlsSpaceBetween}>
              {mode === 'edit' ? (
                <div className={s.footerLeftActions}>
                  <Button style={ButtonStyle.Cancel} content={t('action.delete')} onClick={onDelete} />
                  <Button style={ButtonStyle.Icon} title={t('common.duplicateTimeEntry', { context: 'title' })} onClick={handleDuplicate}>
                    <Icon type={IconType.Duplicate} size={IconSize.Size13} />
                  </Button>
                </div>
              ) : (
                <span />
              )}
              <Button style={ButtonStyle.Submit} content={t('action.save')} onClick={handleSubmit} />
            </div>
          </Form>
        </Popup.Content>
      </div>
    );
  },
);

EntryPopup.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
  anchorRect: PropTypes.shape({
    top: PropTypes.number,
    left: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
  }).isRequired,
  initialValues: PropTypes.shape({
    title: PropTypes.string,
    cardName: PropTypes.string,
    description: PropTypes.string,
    startedAt: PropTypes.instanceOf(Date).isRequired,
    endedAt: PropTypes.instanceOf(Date).isRequired,
    projectId: PropTypes.string,
    boardId: PropTypes.string,
    listId: PropTypes.string,
    cardId: PropTypes.string,
    categoryTagId: PropTypes.string,
  }).isRequired,
  projectOptions: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  assignedCards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allCards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  categoryTags: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isAdmin: PropTypes.bool.isRequired,
  currentUserId: PropTypes.string,
  loggedByName: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  onDuplicate: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  onCreateCategoryTag: PropTypes.func.isRequired,
};

EntryPopup.defaultProps = {
  currentUserId: undefined,
  loggedByName: null,
  onDelete: undefined,
  onDuplicate: undefined,
};

export default EntryPopup;
