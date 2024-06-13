import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDidUpdate, useToggle } from '../../../lib/hooks';
import { Button, ButtonStyle, Icon, IconType, IconSize, Popup, Input, Form, withPopup } from '../../Utils';

import { useForm, useSteps } from '../../../hooks';
import ImportStep from './ImportStep';

import styles from './AddPopup.module.scss';
import gStyles from '../../../globalStyles.module.scss';

const StepTypes = {
  IMPORT: 'IMPORT',
};

const AddStep = React.memo(({ onCreate, onClose }) => {
  const [t] = useTranslation();

  const [data, handleFieldChange, setData] = useForm({
    name: '',
    import: null,
    isGithubConnected: false,
    githubRepo: '',
  });

  const [step, openStep, handleBack] = useSteps();
  const [focusNameFieldState, focusNameField] = useToggle();

  const nameField = useRef(null);

  const handleImportSelect = useCallback(
    (nextImport) => {
      setData((prevData) => ({
        ...prevData,
        import: nextImport,
      }));
    },
    [setData],
  );

  const handleImportBack = useCallback(() => {
    handleBack();
    focusNameField();
  }, [handleBack, focusNameField]);

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
    };

    if (!cleanData.name) {
      nameField.current.select();
      return;
    }

    onCreate(cleanData);
    onClose();
  }, [onClose, data, onCreate]);

  const handleImportClick = useCallback(() => {
    openStep(StepTypes.IMPORT);
  }, [openStep]);

  useEffect(() => {
    nameField.current.focus({
      preventScroll: true,
    });
  }, []);

  useDidUpdate(() => {
    nameField.current.focus();
  }, [focusNameFieldState]);

  if (step && step.type === StepTypes.IMPORT) {
    return <ImportStep onSelect={handleImportSelect} onBack={handleImportBack} />;
  }

  return (
    <>
      <Popup.Header>{t('common.createBoard', { context: 'title' })}</Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <Input ref={nameField} name="name" value={data.name} className={styles.field} onChange={handleFieldChange} />
          <div className={gStyles.controlsSpaceBetween}>
            <Button style={ButtonStyle.NoBackground} title={t('action.import')} onClick={handleImportClick} className={styles.importButton}>
              <Icon type={data.import ? IconType.Attach : IconType.ArrowDown} size={IconSize.Size13} />
              {data.import ? data.import.file.name : t('action.import')}
            </Button>
            <Button style={ButtonStyle.Submit} content={t('action.createBoard')} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

AddStep.propTypes = {
  onCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(AddStep);
