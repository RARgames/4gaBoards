import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';

import { useModal } from '../../../hooks';
import TextFileAddModal from './TextFileAddModal';

import styles from './AttachmentAddZone.module.scss';

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

      const file = event.clipboardData.files[0];

      if (file) {
        submit(file);
        return;
      }

      const item = event.clipboardData.items[0];

      if (!item) {
        return;
      }

      if (item.kind === 'file') {
        submit(item.getAsFile());
        return;
      }

      if (['input', 'textarea'].includes(event.target.tagName.toLowerCase()) && event.target === document.activeElement) {
        return;
      }

      event.preventDefault();

      openModal({
        content: event.clipboardData.getData('Text'),
      });
      setIsModalOpen(true);
    };

    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [openModal, submit]);

  return (
    <>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <div {...getRootProps()} className={styles.wrapper}>
        {isDragActive && (
          <div className={styles.dropzone}>
            <div className={styles.dropzoneText}>{t('common.dropFileToUpload')}</div>
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
