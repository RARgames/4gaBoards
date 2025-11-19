import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import ActionsPopup from '../../../Card/ActionsPopup';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../../../Utils';

import * as s from './ActionsCell.module.scss';

const ActionsCell = React.memo(
  ({
    id,
    name,
    projectId,
    allProjectsToLists,
    allBoardMemberships,
    boardMemberships,
    allLabels,
    url,
    dueDate,
    timer,
    boardId,
    listId,
    isPersisted,
    users,
    labels,
    activities,
    isActivitiesFetching,
    isAllActivitiesFetched,
    canEdit,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
    onUpdate,
    onMove,
    onTransfer,
    onDuplicate,
    onDelete,
    onUserAdd,
    onUserRemove,
    onBoardFetch,
    onLabelAdd,
    onLabelRemove,
    onLabelCreate,
    onLabelUpdate,
    onLabelDelete,
    onOpenNameEdit,
    onActivitiesFetch,
  }) => {
    const [t] = useTranslation();

    const handleNameEdit = useCallback(() => {
      onOpenNameEdit(id);
    }, [onOpenNameEdit, id]);

    if (canEdit && isPersisted) {
      return (
        <ActionsPopup
          card={{
            id,
            name,
            dueDate,
            timer,
            boardId,
            listId,
            projectId,
          }}
          projectsToLists={allProjectsToLists}
          allBoardMemberships={allBoardMemberships}
          boardMemberships={boardMemberships}
          currentUserIds={users.map((user) => user.id)}
          labels={allLabels}
          currentLabelIds={labels.map((label) => label.id)}
          url={url}
          canEdit={canEdit}
          createdAt={createdAt}
          createdBy={createdBy}
          updatedAt={updatedAt}
          updatedBy={updatedBy}
          activities={activities}
          isActivitiesFetching={isActivitiesFetching}
          isAllActivitiesFetched={isAllActivitiesFetched}
          onActivitiesFetch={onActivitiesFetch}
          onNameEdit={handleNameEdit}
          onUpdate={onUpdate}
          onMove={onMove}
          onTransfer={onTransfer}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onUserAdd={onUserAdd}
          onUserRemove={onUserRemove}
          onBoardFetch={onBoardFetch}
          onLabelAdd={onLabelAdd}
          onLabelRemove={onLabelRemove}
          onLabelCreate={onLabelCreate}
          onLabelUpdate={onLabelUpdate}
          onLabelDelete={onLabelDelete}
          position="left-start"
          offset={0}
          hideCloseButton
          wrapperClassName={s.popupWrapper}
        >
          <Button style={ButtonStyle.Icon} title={t('common.editCard')} className={s.editCardButton}>
            <Icon type={IconType.EllipsisVertical} size={IconSize.Size13} className={s.iconEditCardButton} />
          </Button>
        </ActionsPopup>
      );
    }

    return null;
  },
);

ActionsCell.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  projectId: PropTypes.string.isRequired,
  allProjectsToLists: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allBoardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allLabels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  url: PropTypes.string.isRequired,
  dueDate: PropTypes.instanceOf(Date),
  timer: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  boardId: PropTypes.string.isRequired,
  listId: PropTypes.string.isRequired,
  isPersisted: PropTypes.bool.isRequired,
  users: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  labels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  activities: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isActivitiesFetching: PropTypes.bool.isRequired,
  isAllActivitiesFetched: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  createdAt: PropTypes.instanceOf(Date),
  createdBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  updatedAt: PropTypes.instanceOf(Date),
  updatedBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onTransfer: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUserAdd: PropTypes.func.isRequired,
  onUserRemove: PropTypes.func.isRequired,
  onBoardFetch: PropTypes.func.isRequired,
  onLabelAdd: PropTypes.func.isRequired,
  onLabelRemove: PropTypes.func.isRequired,
  onLabelCreate: PropTypes.func.isRequired,
  onLabelUpdate: PropTypes.func.isRequired,
  onLabelDelete: PropTypes.func.isRequired,
  onOpenNameEdit: PropTypes.func.isRequired,
  onActivitiesFetch: PropTypes.func.isRequired,
};

ActionsCell.defaultProps = {
  dueDate: undefined,
  timer: undefined,
  createdAt: undefined,
  createdBy: undefined,
  updatedAt: undefined,
  updatedBy: undefined,
};

export default ActionsCell;
