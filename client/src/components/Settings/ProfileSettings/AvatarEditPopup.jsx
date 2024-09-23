import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Popup, withPopup, Button, ButtonStyle, FilePicker } from '../../Utils';

// import styles from './AvatarEditPopup.module.scss';

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
    field.current.focus();
  }, []);

  return (
    <>
      <FilePicker accept="image/*" onSelect={handleFileSelect}>
        <Button ref={field} style={ButtonStyle.PopupContext} content={t('action.uploadNewAvatar')} />
      </FilePicker>
      <Popup.Separator />
      {defaultValue && <Button style={ButtonStyle.PopupContext} content={t('action.deleteAvatar')} onClick={handleDeleteClick} />}
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
