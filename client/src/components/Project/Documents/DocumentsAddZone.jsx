import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import * as s from './DocumentsAddZone.module.scss';

const DocumentsAddZone = React.memo(({ children, disabled, onCreate }) => {
  const [t] = useTranslation();

  const handleDropAccepted = useCallback(
    (files) => {
      files.forEach((file) => {
        onCreate(file);
      });
    },
    [onCreate],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    noClick: true,
    noKeyboard: true,
    disabled,
    onDropAccepted: handleDropAccepted,
  });

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
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
  );
});

DocumentsAddZone.propTypes = {
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
  onCreate: PropTypes.func.isRequired,
};

DocumentsAddZone.defaultProps = {
  disabled: false,
};

export default DocumentsAddZone;
