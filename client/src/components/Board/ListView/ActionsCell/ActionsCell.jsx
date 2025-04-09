import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import ActionsPopup from '../../../Card/ActionsPopup';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../../../Utils';

import * as s from './ActionsCell.module.scss';

const ActionsCell = React.memo(
  ({
    id,
    projectId,
    allProjectsToLists,
    allBoardMemberships,
    allLabels,
    url,
    dueDate,
    timer,
    boardId,
    listId,
    isPersisted,
    users,
    labels,
    canEdit,
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
  }) => {
    const [t] = useTranslation();

    const handleNameEdit = useCallback(() => {
      onOpenNameEdit(id);
    }, [onOpenNameEdit, id]);

    if (canEdit && isPersisted) {
      return (
        <ActionsPopup
          card={{
            dueDate,
            timer,
            boardId,
            listId,
            projectId,
          }}
          projectsToLists={allProjectsToLists}
          boardMemberships={allBoardMemberships}
          currentUserIds={users.map((user) => user.id)}
          labels={allLabels}
          currentLabelIds={labels.map((label) => label.id)}
          url={url}
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
  projectId: PropTypes.string.isRequired,
  allProjectsToLists: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allBoardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allLabels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  url: PropTypes.string.isRequired,
  dueDate: PropTypes.instanceOf(Date),
  timer: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  boardId: PropTypes.string.isRequired,
  listId: PropTypes.string.isRequired,
  isPersisted: PropTypes.bool.isRequired,
  users: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  labels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
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
};

ActionsCell.defaultProps = {
  dueDate: undefined,
  timer: undefined,
};

export default ActionsCell;
