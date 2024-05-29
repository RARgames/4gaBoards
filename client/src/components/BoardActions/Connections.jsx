import React, { useCallback, useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { dequal } from 'dequal';
import { useTranslation } from 'react-i18next';
import { useForm2 } from '../../hooks';
import { Button, ButtonStyle, Popup, Input, Form, withPopup } from '../Utils';

import styles from './Connections.module.scss';
import gStyles from '../../globalStyles.module.scss';

// TODO replace with actual Github integration
const Connections = React.memo(({ defaultData, onUpdate, onClose }) => {
  const [t] = useTranslation();
  const inputRef = useRef(null);
  const [isError, setIsError] = useState(false);

  const [data, handleFieldChange] = useForm2(() => ({
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
      inputRef.current.select();
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
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [defaultData]);

  return (
    <>
      <Popup.Header>{t('common.connectToGithub')} [Not fully implemented]</Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <Input
            ref={inputRef}
            value={data.githubRepo}
            name="githubRepo"
            onKeyDown={handleFieldKeyDown}
            onChange={handleFieldChange}
            className={classNames(styles.field, isError && styles.fieldError)}
          />
          <div className={gStyles.controlsSpaceBetween}>
            <Button style={ButtonStyle.Cancel} content={t('action.cancel')} onClick={handleCancel} />
            <Button style={ButtonStyle.Submit} content={t('action.save')} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

Connections.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(Connections);
