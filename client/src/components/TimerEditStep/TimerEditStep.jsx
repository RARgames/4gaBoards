import { dequal } from 'dequal';
import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useToggle } from '../../lib/hooks';
import { Button, ButtonStyle, Icon, IconType, IconSize, Input, Popup, Form } from '../Utils';

import { useForm2 } from '../../hooks';
import { createTimer, getTimerParts, startTimer, stopTimer, updateTimer } from '../../utils/timer';

import styles from './TimerEditStep.module.scss';
import gStyles from '../../globalStyles.module.scss';

const createData = (timer) => {
  if (!timer) {
    return {
      hours: '0',
      minutes: '0',
      seconds: '0',
    };
  }

  const { hours, minutes, seconds } = getTimerParts(timer);

  return {
    hours: `${hours}`,
    minutes: `${minutes}`,
    seconds: `${seconds}`,
  };
};

const TimerEditStep = React.memo(({ defaultValue, onUpdate, onBack, onClose }) => {
  const [t] = useTranslation();
  const [data, handleFieldChange, setData] = useForm2(() => createData(defaultValue));
  const [isEditing, toggleEditing] = useToggle();

  const hoursField = useRef(null);
  const minutesField = useRef(null);
  const secondsField = useRef(null);

  const handleStartClick = useCallback(() => {
    onUpdate(startTimer(defaultValue));
    onClose();
  }, [defaultValue, onUpdate, onClose]);

  const handleStopClick = useCallback(() => {
    onUpdate(stopTimer(defaultValue));
  }, [defaultValue, onUpdate]);

  const handleClearClick = useCallback(() => {
    if (defaultValue) {
      onUpdate(null);
    }

    onClose();
  }, [defaultValue, onUpdate, onClose]);

  const handleToggleEditingClick = useCallback(() => {
    setData(createData(defaultValue));
    toggleEditing();
  }, [defaultValue, setData, toggleEditing]);

  const handleSubmit = useCallback(() => {
    const parts = {
      hours: parseInt(data.hours, 10),
      minutes: parseInt(data.minutes, 10),
      seconds: parseInt(data.seconds, 10),
    };

    if (Number.isNaN(parts.hours)) {
      hoursField.current.select();
      return;
    }

    if (Number.isNaN(parts.minutes) || parts.minutes > 60) {
      minutesField.current.select();
      return;
    }

    if (Number.isNaN(parts.seconds) || parts.seconds > 60) {
      secondsField.current.select();
      return;
    }

    if (defaultValue) {
      if (!dequal(parts, getTimerParts(defaultValue))) {
        onUpdate(updateTimer(defaultValue, parts));
      }
    } else {
      onUpdate(createTimer(parts));
    }

    onClose();
  }, [defaultValue, onUpdate, onClose, data]);

  useEffect(() => {
    if (isEditing) {
      hoursField.current.select();
    }
  }, [isEditing]);

  return (
    <>
      <Popup.Header onBack={onBack}>{t('common.editTimer', { context: 'title' })}</Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <div className={styles.fieldWrapper}>
            <div className={styles.fieldBox}>
              <div className={styles.text}>{t('common.hours')}</div>
              <Input.Mask ref={hoursField} name="hours" value={data.hours} mask="9999" maskChar={null} disabled={!isEditing} onChange={handleFieldChange} className={styles.inputField} />
            </div>
            <div className={styles.fieldBox}>
              <div className={styles.text}>{t('common.minutes')}</div>
              <Input.Mask ref={minutesField} name="minutes" value={data.minutes} mask="99" maskChar={null} disabled={!isEditing} onChange={handleFieldChange} className={styles.inputField} />
            </div>
            <div className={styles.fieldBox}>
              <div className={styles.text}>{t('common.seconds')}</div>
              <Input.Mask ref={secondsField} name="seconds" value={data.seconds} mask="99" maskChar={null} disabled={!isEditing} onChange={handleFieldChange} className={styles.inputField} />
            </div>
            <Button style={ButtonStyle.Icon} title={isEditing ? t('common.close') : t('common.editTimer')} onClick={handleToggleEditingClick} className={styles.iconButton}>
              <Icon type={isEditing ? IconType.Close : IconType.Pencil} size={IconSize.Size13} />
            </Button>
          </div>
          <div className={gStyles.controlsSpaceBetween}>
            <Button style={ButtonStyle.Cancel} content={t('action.remove')} onClick={handleClearClick} />
            {isEditing && <Button style={ButtonStyle.Submit} content={t('action.save')} />}
            {!isEditing &&
              (defaultValue && defaultValue.startedAt ? (
                <Button style={ButtonStyle.Submit} type="button" title={t('action.stop')} onClick={handleStopClick}>
                  <Icon type={IconType.Pause} size={IconSize.Size10} className={styles.startStopIcon} />
                  {t('action.stop')}
                </Button>
              ) : (
                <Button style={ButtonStyle.Submit} type="button" title={t('action.start')} onClick={handleStartClick}>
                  <Icon type={IconType.Play} size={IconSize.Size10} className={styles.startStopIcon} />
                  {t('action.stop')}
                </Button>
              ))}
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

TimerEditStep.propTypes = {
  defaultValue: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

TimerEditStep.defaultProps = {
  defaultValue: undefined,
  onBack: undefined,
};

export default TimerEditStep;
