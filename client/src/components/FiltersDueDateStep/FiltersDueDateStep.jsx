import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useForm } from '../../hooks';
import { useToggle } from '../../lib/hooks';
import { Button, ButtonStyle, Input, InputStyle, Popup, Form, Checkbox } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './FiltersDueDateStep.module.scss';

const FiltersDueDateStep = React.memo(({ defaultValue, justSelectedDayDefaultValue, title, onUpdate, onBack, onClose }) => {
  const [t] = useTranslation();
  const [isError, setIsError] = useState(false);
  const [justSelectedDay, toggleJustSelectedDay] = useToggle(justSelectedDayDefaultValue);

  const [data, handleFieldChange, setData] = useForm(() => {
    const date = defaultValue || new Date().setHours(12, 0, 0, 0);

    return {
      date: t('format:date', {
        postProcess: 'formatDate',
        value: date,
      }),
      time: t('format:time', {
        postProcess: 'formatDate',
        value: date,
      }),
    };
  });

  const dateField = useRef(null);

  const nullableDate = useMemo(() => {
    const date = t('format:date', {
      postProcess: 'parseDate',
      value: data.date,
    });

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  }, [data.date, t]);

  const handleDatePickerChange = useCallback(
    (date) => {
      setIsError(false);
      setData((prevData) => ({
        ...prevData,
        date: t('format:date', {
          postProcess: 'formatDate',
          value: date,
        }),
      }));
    },
    [setData, t],
  );

  const handleSubmit = useCallback(() => {
    if (!nullableDate) {
      dateField.current?.focus();
      setIsError(true);
      return;
    }

    const value = t('format:dateTime', {
      postProcess: 'parseDate',
      value: `${data.date} ${data.time}`,
    });

    if (!defaultValue || value.getTime() !== defaultValue.getTime() || justSelectedDay !== justSelectedDayDefaultValue) {
      onUpdate(value, justSelectedDay);
    }

    onClose();
  }, [nullableDate, t, data.date, data.time, defaultValue, justSelectedDay, justSelectedDayDefaultValue, onClose, onUpdate]);

  const handleClearClick = useCallback(() => {
    if (defaultValue) {
      onUpdate(null);
    }

    onClose();
  }, [defaultValue, onUpdate, onClose]);

  const handleKeyDown = useCallback(
    (e) => {
      setIsError(false);
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

  useEffect(() => {
    dateField.current?.focus({ preventScroll: true });
  }, []);

  return (
    <>
      <Popup.Header onBack={onBack}>{t(title)}</Popup.Header>
      <Popup.Content isMinContent>
        <Form onKeyDown={handleKeyDown}>
          <Input ref={dateField} style={InputStyle.Default} name="date" value={data.date} placeholder={t('common.enterDueDate')} onChange={handleFieldChange} isError={isError} />
          <DatePicker inline disabledKeyboardNavigation selected={nullableDate} onChange={handleDatePickerChange} />
          <div className={s.checkboxesWrapper}>
            <div className={s.checkboxWrapper}>
              <Checkbox checked={justSelectedDay} className={s.checkbox} onChange={toggleJustSelectedDay} />
            </div>
            <div className={s.checkboxText}>{t('common.justSelectedDay')}</div>
          </div>
          <div className={gs.controlsSpaceBetween}>
            <Button style={ButtonStyle.Cancel} content={t('action.remove')} onClick={handleClearClick} />
            <Button style={ButtonStyle.Submit} content={t('action.save')} onClick={handleSubmit} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

FiltersDueDateStep.propTypes = {
  defaultValue: PropTypes.instanceOf(Date),
  justSelectedDayDefaultValue: PropTypes.bool,
  title: PropTypes.string,
  onUpdate: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

FiltersDueDateStep.defaultProps = {
  defaultValue: undefined,
  justSelectedDayDefaultValue: false,
  title: 'common.dueDate_title',
  onBack: undefined,
};

export default FiltersDueDateStep;
