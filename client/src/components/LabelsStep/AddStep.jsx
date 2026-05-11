import React, { useCallback, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import LabelColors from '../../constants/LabelColors';
import { useForm } from '../../hooks';
import { Button, ButtonStyle, Popup, Form } from '../Utils';
import Editor from './Editor';

import * as gs from '../../global.module.scss';

const AddStep = React.memo(({ defaultData, onCreate, onBack }) => {
  const [t] = useTranslation();
  const [isError, setIsError] = useState(false);
  const editorRef = useRef(null);

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

    if (!cleanData.name) {
      setIsError(true);
      editorRef.current?.focus();
      return;
    }

    onCreate(cleanData);
    onBack();
  }, [data, onCreate, onBack]);

  const handleKeyDown = useCallback(
    (e) => {
      setIsError(false);
      switch (e.key) {
        case 'Enter': {
          handleSubmit();
          break;
        }
        case 'Escape': {
          e.stopPropagation(); // TODO Prevent closing whole popup - change how popup handles key input
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
      <Popup.Content isMinContent>
        <Form onKeyDown={handleKeyDown}>
          <Editor ref={editorRef} data={data} onFieldChange={handleFieldChange} isError={isError} />
          <div className={gs.controls}>
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
