import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { Button, ButtonStyle, withPopup } from '../Utils';

const NotificationActionsStep = React.memo(({ onMarkAllAs, onDeleteAll, onClose }) => {
  const [t] = useTranslation();

  const handleMarkAllAsRead = useCallback(() => {
    onMarkAllAs({ isRead: true });
    onClose();
  }, [onClose, onMarkAllAs]);

  const handleMarkAllAsUnread = useCallback(() => {
    onMarkAllAs({ isRead: false });
    onClose();
  }, [onClose, onMarkAllAs]);

  const handleDeleteAll = useCallback(() => {
    onDeleteAll();
    onClose();
  }, [onClose, onDeleteAll]);

  const handleDeleteAllRead = useCallback(() => {
    onDeleteAll({ deleteIsReadOnly: true });
    onClose();
  }, [onClose, onDeleteAll]);

  return (
    <>
      <Button style={ButtonStyle.PopupContext} title={t('common.markAllAsRead')} onClick={handleMarkAllAsRead}>
        {t('common.markAllAsRead')}
      </Button>
      <Button style={ButtonStyle.PopupContext} title={t('common.markAllAsUnread')} onClick={handleMarkAllAsUnread}>
        {t('common.markAllAsUnread')}
      </Button>
      <Button style={ButtonStyle.PopupContext} title={t('common.deleteAll')} onClick={handleDeleteAll}>
        {t('common.deleteAll')}
      </Button>
      <Button style={ButtonStyle.PopupContext} title={t('common.deleteAllRead')} onClick={handleDeleteAllRead}>
        {t('common.deleteAllRead')}
      </Button>
    </>
  );
});

NotificationActionsStep.propTypes = {
  onMarkAllAs: PropTypes.func.isRequired,
  onDeleteAll: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(NotificationActionsStep);
