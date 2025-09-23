import React, { useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useModal } from '../../../hooks';
import TextFileAddModal from './TextFileAddModal';

import * as s from './AttachmentAddZone.module.scss';

const AttachmentAddZone = React.memo(({ children, onCreate }) => {
  const [t] = useTranslation();
  const [modal, openModal, handleModalClose] = useModal();
  const modalRef = useRef(null);

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
    const handlePaste = (e) => {
      if (!e.clipboardData) {
        return;
      }

      const { files, items } = e.clipboardData; // BUG Firefox does not provide multiple files: https://bugzilla.mozilla.org/show_bug.cgi?id=864052

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
        if (['input', 'textarea'].includes(e.target.tagName.toLowerCase()) && e.target === document.activeElement) {
          // Allows input to be pasted into input fields
          return;
        }

        openModal({ content: e.clipboardData.getData('Text') });
        modalRef.current?.setIsOpen(true);
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
      <TextFileAddModal ref={modalRef} content={modal?.content} onCreate={handleFileCreate} onClose={handleModalClose} />
    </>
  );
});

AttachmentAddZone.propTypes = {
  children: PropTypes.node.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default AttachmentAddZone;
