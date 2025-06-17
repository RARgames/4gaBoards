import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
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
    const visibleMembersCount = 5;

    return (
      <div className={s.users}>
        {items.slice(0, visibleMembersCount).map((item) => (
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
        {!canEdit && items.length > visibleMembersCount && (
          <Button
            style={ButtonStyle.Icon}
            className={clsx(s.addUser, s.moreMembersButton, s.cannotEdit)}
            title={items
              .slice(visibleMembersCount)
              .map((item) => item.user.name)
              .join(',\n')}
          >
            +{items.length - visibleMembersCount}
          </Button>
        )}
        {canEdit && (
          <AddPopup
            memberships={items}
            users={allUsers}
            currentUserIds={items.map((item) => item.user.id)}
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
            canLeaveIfLast={canLeaveIfLast}
            permissionsSelectStep={permissionsSelectStep}
            title={addTitle}
            onCreate={onCreate}
            onUpdate={onUpdate}
            onDelete={onDelete}
          >
            {items.length > visibleMembersCount && (
              <Button
                style={ButtonStyle.Icon}
                className={clsx(s.addUser, s.moreMembersButton)}
                title={items
                  .slice(visibleMembersCount)
                  .map((item) => item.user.name)
                  .join(',\n')}
              >
                +{items.length - visibleMembersCount}
              </Button>
            )}
          </AddPopup>
        )}
        {canEdit && (
          <AddPopup
            memberships={items}
            users={allUsers}
            currentUserIds={items.map((item) => item.user.id)}
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
            canLeaveIfLast={canLeaveIfLast}
            permissionsSelectStep={permissionsSelectStep}
            title={addTitle}
            onCreate={onCreate}
            onUpdate={onUpdate}
            onDelete={onDelete}
          >
            <Button style={ButtonStyle.Icon} title={t('action.addUser')} className={s.addUser}>
              <Icon type={IconType.UserAdd} size={IconSize.Size20} />
            </Button>
          </AddPopup>
        )}
      </div>
    );
  },
);

Memberships.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allUsers: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
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
  canEdit: PropTypes.bool.isRequired,
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
  canLeaveIfLast: true,
  onUpdate: undefined,
};

export default Memberships;
