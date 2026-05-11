import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import UserInformationEdit from './UserInformationEdit';
import { Popup } from './Utils';

const UserInformationEditStep = React.memo(({ defaultData, onUpdate, onBack, onClose }) => {
  const [t] = useTranslation();

  const handleUpdate = useCallback(
    (data) => {
      onUpdate(data);
      onClose();
    },
    [onUpdate, onClose],
  );

  return (
    <>
      <Popup.Header onBack={onBack}>{t('common.editInformation', { context: 'title' })}</Popup.Header>
      <Popup.Content>
        <UserInformationEdit defaultData={defaultData} onUpdate={handleUpdate} />
      </Popup.Content>
    </>
  );
});

UserInformationEditStep.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

UserInformationEditStep.defaultProps = {
  onBack: undefined,
};

export default UserInformationEditStep;
