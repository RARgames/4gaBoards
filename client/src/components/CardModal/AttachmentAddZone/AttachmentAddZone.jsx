import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';

import { useModal } from '../../../hooks';
import TextFileAddModal from './TextFileAddModal';

import * as s from './AttachmentAddZone.module.scss';

const AttachmentAddZone = React.memo(({ children, onCreate }) => {
  const [t] = useTranslation();
  const [modal, openModal, handleModalClose] = useModal();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const submit = useCallback(
    (file) => {
      onCreate({
        file,
      });
    },
    [onCreate],
  );

  const handleDropAccepted = useCallback(
    (files) => {
      files.forEach((file) => {
        submit(file);
      });
    },
    [submit],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    noClick: true,
    noKeyboard: true,
    onDropAccepted: handleDropAccepted,
  });

  const handleFileCreate = useCallback(
    (file) => {
      submit(file);
    },
    [submit],
  );

  useEffect(() => {
    const handlePaste = (event) => {
      if (!event.clipboardData) {
        return;
      }

      const { files, items } = event.clipboardData; // BUG Firefox does not provide multiple files: https://bugzilla.mozilla.org/show_bug.cgi?id=864052

      if (files.length > 0) {
        [...files].forEach((file) => {
          submit(file);
        });
        return;
      }

      if (items.length === 0) {
        return;
      }

      const item = items[0];

      if (item.kind === 'string') {
        if (['input', 'textarea'].includes(event.target.tagName.toLowerCase()) && event.target === document.activeElement) {
          // Allows input to be pasted into input fields
          return;
        }

        openModal({ content: event.clipboardData.getData('Text') });
        setIsModalOpen(true);
      }

      // Not used actively - fallback for browsers that do not support clipboardData.files
      [...items].forEach((it) => {
        if (it.kind === 'file') {
          submit(it.getAsFile());
        }
      });
    };

    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [openModal, submit]);

  return (
    <>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <div {...getRootProps()} className={s.wrapper}>
        {isDragActive && (
          <div className={s.dropzone}>
            <div className={s.dropzoneText}>{t('common.dropFileToUpload')}</div>
          </div>
        )}
        {children}
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <input {...getInputProps()} />
      </div>
      {modal && <TextFileAddModal content={modal.content} onCreate={handleFileCreate} onClose={handleModalClose} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />}
    </>
  );
});

AttachmentAddZone.propTypes = {
  children: PropTypes.node.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default AttachmentAddZone;
