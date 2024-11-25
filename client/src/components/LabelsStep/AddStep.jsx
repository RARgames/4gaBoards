import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle, Popup, Form } from '../Utils';

import { useForm } from '../../hooks';
import LabelColors from '../../constants/LabelColors';
import Editor from './Editor';

import * as gStyles from '../../globalStyles.module.scss';

const AddStep = React.memo(({ defaultData, onCreate, onBack }) => {
  const [t] = useTranslation();

  const [data, handleFieldChange] = useForm(() => ({
    name: '',
    color: LabelColors[0],
    ...defaultData,
  }));

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
    };
    if (cleanData.name) {
      onCreate(cleanData);
      onBack();
    }
  }, [data, onCreate, onBack]);

  const handleKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case 'Enter': {
          handleSubmit();
          break;
        }
        case 'Escape': {
          event.stopPropagation();
          onBack();
          break;
        }
        default:
      }
    },
    [handleSubmit, onBack],
  );

  return (
    <>
      <Popup.Header onBack={onBack}>{t('common.createLabel', { context: 'title' })}</Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          <Editor data={data} onFieldChange={handleFieldChange} />
          <div className={gStyles.controls}>
            <Button style={ButtonStyle.Submit} content={t('action.createLabel')} onClick={handleSubmit} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

AddStep.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onCreate: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default AddStep;
