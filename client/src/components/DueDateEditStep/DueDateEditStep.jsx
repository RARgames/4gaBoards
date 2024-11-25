import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import { Button, ButtonStyle, Input, InputStyle, Popup, Form } from '../Utils';

import { useForm } from '../../hooks';

import * as styles from './DueDateEditStep.module.scss';
import * as gStyles from '../../globalStyles.module.scss';

const DueDateEditStep = React.memo(({ defaultValue, onUpdate, onBack, onClose }) => {
  const [t] = useTranslation();
  const [isError, setIsError] = useState(false);

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
      dateField.current.focus();
      setIsError(true);
      return;
    }

    const value = t('format:dateTime', {
      postProcess: 'parseDate',
      value: `${data.date} ${data.time}`,
    });

    if (!defaultValue || value.getTime() !== defaultValue.getTime()) {
      onUpdate(value);
    }

    onClose();
  }, [defaultValue, onUpdate, onClose, data, nullableDate, t]);

  const handleClearClick = useCallback(() => {
    if (defaultValue) {
      onUpdate(null);
    }

    onClose();
  }, [defaultValue, onUpdate, onClose]);

  const handleKeyDown = useCallback(
    (event) => {
      setIsError(false);
      switch (event.key) {
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
    dateField.current.focus();
  }, []);

  return (
    <>
      <Popup.Header onBack={onBack}>{t('common.dueDate', { context: 'title' })}</Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          <div className={styles.text}>{t('common.date')}</div>
          <Input ref={dateField} style={InputStyle.Default} name="date" value={data.date} onChange={handleFieldChange} isError={isError} />
          <DatePicker inline disabledKeyboardNavigation selected={nullableDate} onChange={handleDatePickerChange} />
          <div className={gStyles.controlsSpaceBetween}>
            <Button style={ButtonStyle.Cancel} content={t('action.remove')} onClick={handleClearClick} />
            <Button style={ButtonStyle.Submit} content={t('action.save')} onClick={handleSubmit} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

DueDateEditStep.propTypes = {
  defaultValue: PropTypes.instanceOf(Date),
  onUpdate: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

DueDateEditStep.defaultProps = {
  defaultValue: undefined,
  onBack: undefined,
};

export default DueDateEditStep;
