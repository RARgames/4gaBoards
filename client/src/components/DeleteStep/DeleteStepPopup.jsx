import React from 'react';
import PropTypes from 'prop-types';

import { withPopup } from '../Utils';
import DeleteStep from './DeleteStep';

const DeleteStepPopupContent = React.memo(({ title, content, buttonContent, onConfirm, onClose }) => (
  <DeleteStep
    title={title}
    content={content}
    buttonContent={buttonContent}
    onConfirm={() => {
      onConfirm();
      onClose();
    }}
  />
));

DeleteStepPopupContent.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  buttonContent: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(DeleteStepPopupContent);
