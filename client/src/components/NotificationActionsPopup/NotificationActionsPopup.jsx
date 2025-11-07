import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { Button, ButtonStyle, withPopup } from '../Utils';

const NotificationActionsStep = React.memo(({ onMarkAllAsRead, onDeleteAll, onClose }) => {
  const [t] = useTranslation();

  const handleMarkAllAsRead = useCallback(() => {
    onMarkAllAsRead();
    onClose();
  }, [onClose, onMarkAllAsRead]);

  const handleDeleteAll = useCallback(() => {
    onDeleteAll();
    onClose();
  }, [onClose, onDeleteAll]);

  return (
    <>
      <Button style={ButtonStyle.PopupContext} title={t('common.markAllAsRead')} onClick={handleMarkAllAsRead}>
        {t('common.markAllAsRead')}
      </Button>
      <Button style={ButtonStyle.PopupContext} title={t('common.deleteAll')} onClick={handleDeleteAll}>
        {t('common.deleteAll')}
      </Button>
    </>
  );
});

NotificationActionsStep.propTypes = {
  onMarkAllAsRead: PropTypes.func.isRequired,
  onDeleteAll: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(NotificationActionsStep);
