import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { FilePicker } from '../Utils';

const AttachmentAdd = React.memo(({ children, onCreate }) => {
  const handleFileSelect = useCallback(
    (file) => {
      onCreate({
        file,
      });
    },
    [onCreate],
  );

  return (
    <FilePicker onSelect={handleFileSelect} multiple>
      {children}
    </FilePicker>
  );
});

AttachmentAdd.propTypes = {
  children: PropTypes.node.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default AttachmentAdd;
