import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format, setHours, setMinutes, startOfDay } from 'date-fns';
import PropTypes from 'prop-types';

import { useForm } from '../../hooks';
import { Button, ButtonStyle, Icon, IconType, IconSize, Input, InputStyle, TextArea, TextAreaStyle, Popup, Form } from '../Utils';
import ProjectTicketPicker from './ProjectTicketPicker';

import * as gs from '../../global.module.scss';
import * as s from './EntryPopup.module.scss';

const VIEWPORT_MARGIN = 10;

const createData = (initialValues) => ({
  description: (initialValues && initialValues.description) || '',
  startTime: format(initialValues.startedAt, 'HH:mm'),
  endTime: format(initialValues.endedAt, 'HH:mm'),
});

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

const EntryPopup = React.memo(({ mode, anchorRect, initialValues, projectOptions, assignedCards, allCards, loggedByName, onSave, onDelete, onClose }) => {
  const [t] = useTranslation();
  const [data, handleFieldChange, setData] = useForm(() => createData(initialValues));
  const [projectId, setProjectId] = useState(initialValues.projectId || null);
  const [cardId, setCardId] = useState(initialValues.cardId || null);
  const [isError, setIsError] = useState(false);
  const [style, setStyle] = useState({ top: anchorRect.top, left: anchorRect.left, visibility: 'hidden' });

  const popupRef = useRef(null);
  const descriptionField = useRef(null);

  useEffect(() => {
    setData(createData(initialValues));
    setProjectId(initialValues.projectId || null);
    setCardId(initialValues.cardId || null);
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
      if (popupRef.current && !popupRef.current.contains(e.target)) {
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

  const handleSubmit = useCallback(() => {
    const startedAt = parseTimeToDate(initialValues.startedAt, data.startTime);
    const endedAt = parseTimeToDate(initialValues.startedAt, data.endTime);

    if (!startedAt || !endedAt || endedAt <= startedAt) {
      setIsError(true);
      return;
    }

    onSave({
      description: data.description.trim(),
      startedAt,
      endedAt,
      projectId,
      cardId,
    });
  }, [data, initialValues.startedAt, projectId, cardId, onSave]);

  const handleKeyDown = useCallback(
    (e) => {
      setIsError(false);
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handlePickerChange = useCallback(({ projectId: nextProjectId, cardId: nextCardId }) => {
    setProjectId(nextProjectId);
    setCardId(nextCardId);
  }, []);

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div className={s.popup} ref={popupRef} style={style} onKeyDown={handleKeyDown} data-prevent-card-switch>
      <Button style={ButtonStyle.Icon} title={t('common.close')} onClick={onClose} className={s.closeButton}>
        <Icon type={IconType.Close} size={IconSize.Size14} />
      </Button>
      <Popup.Header>{mode === 'edit' ? t('common.editTimeEntry', { context: 'title' }) : t('common.addTimeEntry', { context: 'title' })}</Popup.Header>
      <Popup.Content isMinContent>
        {loggedByName && <div className={s.loggedBy}>{t('common.loggedBy', { name: loggedByName })}</div>}
        <Form>
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
          <ProjectTicketPicker projectId={projectId} cardId={cardId} projects={projectOptions} assignedCards={assignedCards} allCards={allCards} onChange={handlePickerChange} />
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
  }).isRequired,
  projectOptions: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  assignedCards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allCards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  loggedByName: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

EntryPopup.defaultProps = {
  loggedByName: null,
  onDelete: undefined,
};

export default EntryPopup;
