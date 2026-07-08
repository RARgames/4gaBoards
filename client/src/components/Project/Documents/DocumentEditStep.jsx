import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useForm } from '../../../hooks';
import { Button, ButtonStyle, Form, Input, InputStyle, Popup, TextArea, TextAreaStyle } from '../../Utils';

import * as gs from '../../../global.module.scss';
import * as s from './DocumentEditStep.module.scss';

const DocumentEditStep = React.memo(({ document, folders, onUpdate, onBack, onClose }) => {
  const [t] = useTranslation();
  const nameFieldRef = useRef(null);

  const [data, handleFieldChange] = useForm(() => ({
    name: document.name,
    description: document.description || '',
    folder: document.folder || '',
  }));

  const handleSubmit = useCallback(() => {
    const cleanName = data.name.trim();

    if (!cleanName) {
      nameFieldRef.current?.focus();
      return;
    }

    onUpdate({
      name: cleanName,
      description: data.description.trim() || null,
      folder: data.folder.trim() || null,
    });

    if (onBack) {
      onBack();
    } else {
      onClose();
    }
  }, [data, onUpdate, onBack, onClose]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <>
      <Popup.Header onBack={onBack}>{t('common.editDocument', { context: 'title' })}</Popup.Header>
      <Popup.Content isMinContent>
        <Form onKeyDown={handleKeyDown}>
          <div className={s.field}>
            <Input ref={nameFieldRef} name="name" value={data.name} style={InputStyle.Default} onChange={handleFieldChange} />
          </div>
          <div className={s.field}>
            <TextArea name="description" value={data.description} style={TextAreaStyle.Default} placeholder={t('common.enterDescription')} maxRows={4} onChange={handleFieldChange} />
          </div>
          <div className={s.field}>
            <Input name="folder" value={data.folder} style={InputStyle.Default} placeholder={t('common.folder', { context: 'title' })} list="document-folder-suggestions" onChange={handleFieldChange} />
            <datalist id="document-folder-suggestions">
              {folders.map((folder) => (
                <option key={folder} value={folder}>
                  {folder}
                </option>
              ))}
            </datalist>
          </div>
          <div className={gs.controls}>
            <Button style={ButtonStyle.Submit} content={t('action.save')} onClick={handleSubmit} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

DocumentEditStep.propTypes = {
  document: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  folders: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

DocumentEditStep.defaultProps = {
  onBack: undefined,
};

export default DocumentEditStep;
