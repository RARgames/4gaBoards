import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import User from '../User';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';
import ActionsPopup from './ActionsPopup';
import AddPopup from './AddPopup';

import * as s from './Memberships.module.scss';

const Memberships = React.memo(
  ({
    items,
    allUsers,
    permissionsSelectStep,
    addTitle,
    leaveButtonContent,
    leaveConfirmationTitle,
    leaveConfirmationContent,
    leaveConfirmationButtonContent,
    deleteButtonContent,
    deleteConfirmationTitle,
    deleteConfirmationContent,
    deleteConfirmationButtonContent,
    canEdit,
    canLeaveIfLast,
    onCreate,
    onUpdate,
    onDelete,
  }) => {
    const [t] = useTranslation();

    return (
      <>
        <span className={s.users}>
          {items.map((item) => (
            <span key={item.id} className={s.user}>
              <ActionsPopup
                membership={item}
                permissionsSelectStep={permissionsSelectStep}
                leaveButtonContent={leaveButtonContent}
                leaveConfirmationTitle={leaveConfirmationTitle}
                leaveConfirmationContent={leaveConfirmationContent}
                leaveConfirmationButtonContent={leaveConfirmationButtonContent}
                deleteButtonContent={deleteButtonContent}
                deleteConfirmationTitle={deleteConfirmationTitle}
                deleteConfirmationContent={deleteConfirmationContent}
                deleteConfirmationButtonContent={deleteConfirmationButtonContent}
                canEdit={canEdit}
                canLeave={items.length > 1 || canLeaveIfLast}
                onUpdate={(data) => onUpdate(item.id, data)}
                onDelete={() => onDelete(item.id)}
              >
                <User name={item.user.name} avatarUrl={item.user.avatarUrl} size="large" isDisabled={!item.isPersisted} />
              </ActionsPopup>
            </span>
          ))}
        </span>
        {canEdit && (
          <div className={s.addPopupWrapper}>
            <AddPopup users={allUsers} currentUserIds={items.map((item) => item.user.id)} permissionsSelectStep={permissionsSelectStep} title={addTitle} onCreate={onCreate}>
              <Button style={ButtonStyle.Icon} title={t('action.addUser')} className={s.addUser}>
                <Icon type={IconType.UserAdd} size={IconSize.Size20} />
              </Button>
            </AddPopup>
          </div>
        )}
      </>
    );
  },
);

Memberships.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  items: PropTypes.array.isRequired,
  allUsers: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  permissionsSelectStep: PropTypes.elementType,
  addTitle: PropTypes.string,
  leaveButtonContent: PropTypes.string,
  leaveConfirmationTitle: PropTypes.string,
  leaveConfirmationContent: PropTypes.string,
  leaveConfirmationButtonContent: PropTypes.string,
  deleteButtonContent: PropTypes.string,
  deleteConfirmationTitle: PropTypes.string,
  deleteConfirmationContent: PropTypes.string,
  deleteConfirmationButtonContent: PropTypes.string,
  canEdit: PropTypes.bool,
  canLeaveIfLast: PropTypes.bool,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func.isRequired,
};

Memberships.defaultProps = {
  permissionsSelectStep: undefined,
  addTitle: undefined,
  leaveButtonContent: undefined,
  leaveConfirmationTitle: undefined,
  leaveConfirmationContent: undefined,
  leaveConfirmationButtonContent: undefined,
  deleteButtonContent: undefined,
  deleteConfirmationTitle: undefined,
  deleteConfirmationContent: undefined,
  deleteConfirmationButtonContent: undefined,
  canEdit: true,
  canLeaveIfLast: true,
  onUpdate: undefined,
};

export default Memberships;
