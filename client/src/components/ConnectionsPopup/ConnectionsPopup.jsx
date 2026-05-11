import React, { useCallback, useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { dequal } from 'dequal';
import PropTypes from 'prop-types';

import { useForm } from '../../hooks';
import { Button, ButtonStyle, Popup, Input, InputStyle, Form, withPopup } from '../Utils';

import * as gs from '../../global.module.scss';

// TODO replace with actual Github integration
const ConnectionsStep = React.memo(({ defaultData, onUpdate, onBack, onClose }) => {
  const [t] = useTranslation();
  const inputRef = useRef(null);
  const [isError, setIsError] = useState(false);

  const [data, handleFieldChange] = useForm(() => ({
    isGithubConnected: false,
    githubRepo: '',
    ...defaultData,
  }));

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      githubRepo: data.githubRepo.trim(),
    };
    cleanData.isGithubConnected = !!cleanData.githubRepo;
    if (!/^$|^\w+\/\w+$/.test(cleanData.githubRepo)) {
      inputRef.current?.focus();
      setIsError(true);
      return;
    }

    if (!dequal(cleanData, defaultData)) {
      onUpdate(cleanData);
    }
    onClose();
  }, [data, defaultData, onClose, onUpdate]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleFieldKeyDown = useCallback(
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
    inputRef.current?.focus();
  }, []);

  return (
    <>
      <Popup.Header onBack={onBack}>{t('common.connectToGithub')} [Not fully implemented]</Popup.Header>
      <Popup.Content>
        <Form>
          <Input
            ref={inputRef}
            style={InputStyle.Default}
            value={data.githubRepo}
            name="githubRepo"
            placeholder={t('common.enterGithubRepository')}
            onKeyDown={handleFieldKeyDown}
            onChange={handleFieldChange}
            isError={isError}
          />
          <div className={gs.controlsSpaceBetween}>
            <Button style={ButtonStyle.Cancel} content={t('action.cancel')} onClick={handleCancel} />
            <Button style={ButtonStyle.Submit} content={t('action.save')} onClick={handleSubmit} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

ConnectionsStep.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

ConnectionsStep.defaultProps = {
  onBack: undefined,
};

export default withPopup(ConnectionsStep);
export { ConnectionsStep };
