import React, { useCallback, useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { dequal } from 'dequal';
import { useTranslation } from 'react-i18next';
import { Button, Form, Input, Menu } from 'semantic-ui-react';
import { withPopup } from '../../lib/popup';
import { Popup } from '../../lib/custom-ui';
import { useForm } from '../../hooks';

import styles from './Connections.module.scss';
import gStyles from '../../globalStyles.module.scss';

// TODO replace with actual Github integration
const Connections = React.memo(({ defaultData, onUpdate, onClose }) => {
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
        <Menu secondary vertical>
          <Form onSubmit={handleSubmit}>
            <div>
              <Input ref={inputRef} value={data.githubRepo} name="githubRepo" onKeyDown={handleFieldKeyDown} onChange={handleFieldChange} className={classNames(isError && styles.fieldError)} />
            </div>
            <div className={gStyles.controls}>
              <Button type="button" negative content={t('action.cancel')} className={gStyles.cancelButton} onClick={handleCancel} />
              <Button positive content={t('action.save')} className={gStyles.submitButton} />
            </div>
          </Form>
        </Menu>
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
