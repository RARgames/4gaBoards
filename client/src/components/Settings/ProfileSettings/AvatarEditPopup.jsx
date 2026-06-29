import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { Popup, withPopup, Button, ButtonVariant, FilePicker } from '../../Utils';

const AvatarEditStep = React.memo(({ defaultValue, onUpdate, onDelete, onClose }) => {
  const [t] = useTranslation();

  const field = useRef(null);

  const handleFileSelect = useCallback(
    (file) => {
      onUpdate({
        file,
      });

      onClose();
    },
    [onUpdate, onClose],
  );

  const handleDeleteClick = useCallback(() => {
    onDelete();
    onClose();
  }, [onDelete, onClose]);

  useEffect(() => {
    field.current?.focus();
  }, []);

  return (
    <>
      <FilePicker accept="image/*" onSelect={handleFileSelect}>
        <Button ref={field} variant={ButtonVariant.PopupContext} content={t('common.uploadNewAvatar')} />
      </FilePicker>
      <Popup.Separator />
      {defaultValue && <Button variant={ButtonVariant.PopupContext} content={t('common.deleteAvatar')} onClick={handleDeleteClick} />}
    </>
  );
});

AvatarEditStep.propTypes = {
  defaultValue: PropTypes.string,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

AvatarEditStep.defaultProps = {
  defaultValue: undefined,
};

export default withPopup(AvatarEditStep);
