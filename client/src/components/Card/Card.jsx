import React, { useCallback, useRef, useEffect, useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import Paths from '../../constants/Paths';
import { startTimer, stopTimer } from '../../utils/timer';
import DueDate from '../DueDate';
import DueDateEditPopup from '../DueDateEditPopup';
import Label from '../Label';
import LabelsPopup from '../LabelsPopup';
import MembershipsPopup from '../MembershipsPopup';
import Tasks from '../Tasks';
import Timer from '../Timer';
import User from '../User';
import { Button, ButtonStyle, Icon, IconType, IconSize, LinkifiedTextRenderer } from '../Utils';
import ActionsPopup from './ActionsPopup';
import NameEdit from './NameEdit';

import * as s from './Card.module.scss';

const Card = React.memo(
  ({
    id,
    index,
    name,
    dueDate,
    timer,
    coverUrl,
    boardId,
    listId,
    projectId,
    isPersisted,
    isOpen,
    notificationsTotal,
    users,
    labels,
    tasks,
    description,
    attachmentsCount,
    commentCount,
    allProjectsToLists,
    boardMemberships,
    boardAndCardMemberships,
    boardAndTaskMemberships,
    allLabels,
    url,
    activities,
    isActivitiesFetching,
    isAllActivitiesFetched,
    closestDueDate,
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
    onTaskUpdate,
    onTaskDuplicate,
    onTaskDelete,
    onUserToTaskAdd,
    onUserFromTaskRemove,
    onTaskCreate,
    onTaskMove,
    onActivitiesFetch,
  }) => {
    const [t] = useTranslation();
    const nameEdit = useRef(null);
    const cardRef = useRef(null);
    const [isDragOverTask, setIsDragOverTask] = useState(false);
    const navigate = useNavigate();

    const scrollCardIntoView = useCallback(() => {
      cardRef.current?.scrollIntoView({
        behavior: 'auto',
        block: 'nearest',
        inline: 'nearest',
      });
    }, []);

    const handleClick = useCallback(
      (e) => {
        // Prevent card click if user is trying to edit card details such as tasks
        let { target } = e;
        while (target) {
          if (target.dataset.preventCardSwitch) {
            return;
          }
          if (target.classList.contains(s.card)) {
            break;
          }
          target = target.parentElement;
        }

        navigate(Paths.CARDS.replace(':id', id));
        if (document.activeElement) {
          document.activeElement.blur();
        }
      },
      [id, navigate],
    );

    // TODO should be possible without 200ms timeout, but it's not due to other issues - somewhere else
    // eslint-disable-next-line consistent-return
    useEffect(() => {
      if (isOpen) {
        const timeout = setTimeout(() => {
          scrollCardIntoView();
        }, 200);

        return () => clearTimeout(timeout);
      }
    }, [isOpen, scrollCardIntoView]);

    const handleToggleTimerClick = useCallback(() => {
      onUpdate({
        timer: timer.startedAt ? stopTimer(timer) : startTimer(timer),
      });
    }, [timer, onUpdate]);

    const handleNameUpdate = useCallback(
      (newName) => {
        onUpdate({
          name: newName,
        });
      },
      [onUpdate],
    );

    const handleNameEdit = useCallback(() => {
      nameEdit.current?.open();
    }, []);

    const getStyle = (style, snapshot) => {
      if (!snapshot.isDropAnimating) {
        return style;
      }
      return {
        ...style,
        transitionDuration: `0.05s`,
      };
    };

    const handleTasksMouseEnter = useCallback(() => {
      setIsDragOverTask(true);
    }, []);

    const handleTasksMouseOut = useCallback(() => {
      setIsDragOverTask(false);
    }, []);

    const handleDueDateUpdate = useCallback(
      (newDueDate) => {
        onUpdate({
          dueDate: newDueDate,
        });
      },
      [onUpdate],
    );

    const visibleMembersCount = 3;
    const labelIds = labels.map((label) => label.id);

    const contentNode = (
      <>
        <div>
          <div className={s.detailsTitle}>
            <div title={name} className={s.name}>
              <LinkifiedTextRenderer text={name} />
            </div>
          </div>
          {notificationsTotal > 0 && notificationsTotal <= 9 && <span className={s.notification}>{notificationsTotal}</span>}
          {notificationsTotal > 9 && <span className={clsx(s.notification, s.notificationFull)}>9+</span>}
        </div>
        {coverUrl && <img src={coverUrl} alt="" className={s.cover} />}
        {(labels.length > 0 || tasks.length > 0 || description || attachmentsCount > 0 || commentCount > 0 || dueDate || timer || users.length > 0) && (
          <div className={s.details}>
            {labels.length > 0 && (
              <span className={s.labels}>
                {labels.map((label) => (
                  <LabelsPopup
                    key={label.id}
                    items={allLabels}
                    currentIds={labelIds}
                    onSelect={onLabelAdd}
                    onDeselect={onLabelRemove}
                    onCreate={onLabelCreate}
                    onUpdate={onLabelUpdate}
                    onDelete={onLabelDelete}
                    canEdit={canEdit}
                    offset={0}
                    wrapperClassName={clsx(s.attachment, s.attachmentLeft)}
                    disabled={!canEdit}
                  >
                    <Label name={label.name} color={label.color} variant="card" isClickable={canEdit} />
                  </LabelsPopup>
                ))}
              </span>
            )}
            {tasks.length > 0 && (
              <Tasks
                variant="card"
                isCardActive={isOpen}
                cardId={id}
                cardName={name}
                items={tasks}
                closestDueDate={closestDueDate}
                canEdit={canEdit}
                allBoardMemberships={boardAndTaskMemberships}
                boardMemberships={boardMemberships}
                isActivitiesFetching={isActivitiesFetching}
                isAllActivitiesFetched={isAllActivitiesFetched}
                onCreate={onTaskCreate}
                onUpdate={onTaskUpdate}
                onMove={onTaskMove}
                onDuplicate={onTaskDuplicate}
                onDelete={onTaskDelete}
                onUserAdd={onUserToTaskAdd}
                onUserRemove={onUserFromTaskRemove}
                onMouseEnterTasks={handleTasksMouseEnter}
                onMouseLeaveTasks={handleTasksMouseOut}
                onActivitiesFetch={onActivitiesFetch}
              />
            )}
            {(description || attachmentsCount > 0 || commentCount > 0 || dueDate || timer) && (
              <span className={s.attachments}>
                {description && (
                  <span className={clsx(s.attachment, s.attachmentLeft)}>
                    <Icon type={IconType.BarsStaggered} size={IconSize.Size14} className={s.detailsIcon} title={t('common.detailsDescription')} />
                  </span>
                )}
                {attachmentsCount > 0 && (
                  <span className={clsx(s.attachment, s.attachmentLeft)}>
                    <Icon type={IconType.Attach} size={IconSize.Size14} className={s.detailsIcon} title={t('common.detailsAttachments', { count: attachmentsCount })} />
                  </span>
                )}
                {commentCount > 0 && (
                  <span className={clsx(s.attachment, s.attachmentLeft)}>
                    <Icon type={IconType.Comment} size={IconSize.Size14} className={s.detailsIcon} title={t('common.detailsComments', { count: commentCount })} />
                  </span>
                )}
                {dueDate && (
                  <span className={clsx(s.attachment, s.attachmentLeft)}>
                    <DueDateEditPopup defaultValue={dueDate} onUpdate={handleDueDateUpdate} disabled={!canEdit}>
                      <DueDate value={dueDate} variant="card" isClickable={canEdit} />
                    </DueDateEditPopup>
                  </span>
                )}
                {timer && (
                  <span className={clsx(s.attachment, s.attachmentLeft)} data-prevent-card-switch>
                    <Timer as="span" startedAt={timer.startedAt} total={timer.total} variant="card" onClick={canEdit ? handleToggleTimerClick : undefined} />
                  </span>
                )}
              </span>
            )}
            {users.length > 0 && (
              <span className={clsx(s.attachments, s.attachmentsRight, s.users)}>
                <div className={s.popupWrapper2}>
                  <MembershipsPopup
                    items={boardAndCardMemberships}
                    currentUserIds={users.map((user) => user.id)}
                    memberships={boardMemberships}
                    onUserSelect={(userId) => onUserAdd(userId, id)}
                    onUserDeselect={(userId) => onUserRemove(userId, id)}
                    offset={0}
                  >
                    {users.slice(0, visibleMembersCount).map((user) => (
                      <span key={user.id} className={clsx(s.attachment, s.user)}>
                        <User name={user.name} avatarUrl={user.avatarUrl} size="card" isMember={boardMemberships.some((m) => m.user?.id === user.id)} isNotMemberTitle={t('common.noLongerBoardMember')} />
                      </span>
                    ))}
                    {users.length > visibleMembersCount && (
                      <span
                        className={clsx(s.attachment, s.user, s.moreUsers)}
                        title={users
                          .slice(visibleMembersCount)
                          .map((user) => user.name)
                          .join(',\n')}
                      >
                        +{users.length - visibleMembersCount}
                      </span>
                    )}
                  </MembershipsPopup>
                </div>
              </span>
            )}
          </div>
        )}
      </>
    );

    return (
      <Draggable draggableId={`card:${id}`} index={index} isDragDisabled={isDragOverTask || !isPersisted || !canEdit}>
        {(provided, snapshot) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef} className={s.wrapper} style={getStyle(provided.draggableProps.style, snapshot)}>
            <NameEdit ref={nameEdit} defaultValue={name} onUpdate={handleNameUpdate}>
              <div ref={cardRef} className={clsx(s.card, isOpen && s.cardOpen)}>
                {isPersisted ? (
                  <>
                    {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                    <div
                      className={s.content}
                      onClick={(e) => {
                        handleClick(e);
                      }}
                    >
                      {contentNode}
                    </div>
                    {canEdit && (
                      <div className={s.popupWrapper}>
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
                          allBoardMemberships={boardAndCardMemberships}
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
                        >
                          <Button style={ButtonStyle.Icon} title={t('common.editCard')} className={s.editCardButton}>
                            <Icon type={IconType.EllipsisVertical} size={IconSize.Size13} />
                          </Button>
                        </ActionsPopup>
                      </div>
                    )}
                  </>
                ) : (
                  <span className={s.content}>{contentNode}</span>
                )}
              </div>
            </NameEdit>
          </div>
        )}
      </Draggable>
    );
  },
);

Card.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  dueDate: PropTypes.instanceOf(Date),
  timer: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  coverUrl: PropTypes.string,
  boardId: PropTypes.string.isRequired,
  listId: PropTypes.string.isRequired,
  projectId: PropTypes.string.isRequired,
  isPersisted: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool.isRequired,
  notificationsTotal: PropTypes.number.isRequired,
  users: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  labels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  tasks: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  description: PropTypes.string,
  attachmentsCount: PropTypes.number.isRequired,
  commentCount: PropTypes.number.isRequired,
  allProjectsToLists: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  boardAndCardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  boardAndTaskMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  allLabels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  url: PropTypes.string.isRequired,
  activities: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isActivitiesFetching: PropTypes.bool.isRequired,
  isAllActivitiesFetched: PropTypes.bool.isRequired,
  closestDueDate: PropTypes.instanceOf(Date),
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
  onTaskUpdate: PropTypes.func.isRequired,
  onTaskDuplicate: PropTypes.func.isRequired,
  onTaskDelete: PropTypes.func.isRequired,
  onUserToTaskAdd: PropTypes.func.isRequired,
  onUserFromTaskRemove: PropTypes.func.isRequired,
  onTaskCreate: PropTypes.func.isRequired,
  onTaskMove: PropTypes.func.isRequired,
  onActivitiesFetch: PropTypes.func.isRequired,
};

Card.defaultProps = {
  dueDate: undefined,
  timer: undefined,
  coverUrl: undefined,
  description: undefined,
  closestDueDate: undefined,
  createdAt: undefined,
  createdBy: undefined,
  updatedAt: undefined,
  updatedBy: undefined,
};

export default Card;
