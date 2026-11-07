import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { Button, ButtonVariant, Popup, Form, withPopup, MentionTextArea, TextAreaVariant } from '../Utils';
import { useMentionTriggers, useMentionValue, getCleanName, toExtras } from '../Utils/Mention';

import * as gs from '../../global.module.scss';
import * as s from './TaskAddPopup.module.scss';

const TaskAddStep = React.memo(({ boardMemberships, onCreate, onBack, onClose }) => {
  const [t] = useTranslation();
  const [value, submitData, handleChange, resetValue] = useMentionValue();
  const [isError, setIsError] = useState(false);
  const nameField = useRef(null);
  const mentionTriggers = useMentionTriggers({ memberships: boardMemberships, withLabels: false });

  const handleSubmit = useCallback(() => {
    const name = getCleanName(value, submitData);

    if (!name) {
      resetValue();
      nameField.current?.focus();
      setIsError(true);
      return;
    }

    onCreate({ name, isCollapsed: false, ...toExtras(submitData, { labels: false }) });
    resetValue();
    setIsError(false);
    onClose();
  }, [value, submitData, resetValue, onCreate, onClose]);

  const handleKeyDown = useCallback(
    (e) => {
      setIsError(false);
      if (e.key === 'Enter') {
        e.preventDefault(); // Prevent adding new line in TextArea
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  useEffect(() => {
    nameField.current?.focus();
  }, []);

  return (
    <>
      <Popup.Header onBack={onBack}>{t('common.addTask')}</Popup.Header>
      <Popup.Content className={s.content}>
        <Form onKeyDown={handleKeyDown}>
          <MentionTextArea
            ref={nameField}
            variant={TextAreaVariant.Default}
            value={value}
            placeholder={t('common.enterTaskDescription')}
            maxRows={2}
            onChange={handleChange}
            isError={isError}
            mentionTriggers={mentionTriggers}
          />
          <div className={gs.controls}>
            <Button variant={ButtonVariant.Submit} content={t('common.addTask')} onClick={handleSubmit} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

TaskAddStep.propTypes = {
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onCreate: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

TaskAddStep.defaultProps = {
  onBack: undefined,
};

export default withPopup(TaskAddStep);
export { TaskAddStep };
