import React, { useCallback, useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { startTimer, stopTimer } from '@4gaboards/utils';
import { attachClosestEdge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import DroppableTypes from '../../constants/DroppableTypes';
import Paths from '../../constants/Paths';
import { dragKey, getDragData, useDropAnimation } from '../../lib/hooks/use-drop-animation';
import DueDate from '../DueDate';
import DueDateEditPopup from '../DueDateEditPopup';
import Label from '../Label';
import LabelsPopup from '../LabelsPopup';
import MembershipsPopup from '../MembershipsPopup';
import Tasks from '../Tasks';
import Timer from '../Timer';
import User from '../User';
import { Button, ButtonVariant, Icon, IconType, IconSize, LinkifiedTextRenderer } from '../Utils';
import CardActionsPopup from './CardActionsPopup';
import NameEdit from './NameEdit';

import * as gs from '../../global.module.scss';
import * as s from './Card.module.scss';

const Card = React.memo(
  ({
    id,
    index,
    name,
    isCompleted,
    dueDate,
    completedAt,
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
    lastActivityId,
    closestDueDate,
    canEdit,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
    showFullDueDates,
    onUpdate,
    onMove,
    onTransfer,
    onDuplicate,
    onDelete,
    onMarkCompleted,
    onUserAdd,
    onUserRemove,
    onUserEmailLookup,
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
    onTaskActivitiesFetch,
  }) => {
    const [t] = useTranslation();
    const nameEdit = useRef(null);
    const cardRef = useRef(null);
    const wrapperRef = useRef(null);
    const cardActionsPopupRef = useRef(null);
    const [isDragOverTask, setIsDragOverTask] = useState(false);
    const navigate = useNavigate();
    const [closestEdge, setClosestEdge] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [placeholderHeight, setPlaceholderHeight] = useState(0);
    const [showOrigin, setShowOrigin] = useState(true);
    const key = dragKey('card', id);

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

    useEffect(() => {
      // DnD: the whole card is the drag handle and also a drop target (drop above/below it)
      const element = wrapperRef.current;

      if (!element) {
        return undefined;
      }

      const data = { type: DroppableTypes.CARD, cardId: id, listId, index, hasPlaceholder: true };

      return combine(
        draggable({
          element,
          canDrag: () => isPersisted && canEdit && !isDragOverTask,
          getInitialData: ({ input }) => ({
            ...data,
            height: cardRef.current?.offsetHeight,
            ...getDragData(cardRef.current, input, key),
          }),
          onDragStart: ({ source }) => {
            setPlaceholderHeight(source.data.height);
            setShowOrigin(true);
            setIsDragging(true);
            cardActionsPopupRef.current?.close();
          },
          onDrag: ({ location }) => {
            // another placeholder is visible only if the innermost target renders one and isn't this card
            const innermost = location.current.dropTargets[0];
            setShowOrigin(!innermost || !innermost.data.hasPlaceholder || innermost.data.cardId === id);
          },
          onDrop: () => setIsDragging(false),
        }),
        dropTargetForElements({
          element,
          canDrop: ({ source }) => source.data.type === DroppableTypes.CARD,
          getData: ({ input, element: targetElement }) =>
            attachClosestEdge(data, {
              input,
              element: cardRef.current || targetElement,
              allowedEdges: ['top', 'bottom'],
            }),
          onDrag: ({ self, source }) => {
            setClosestEdge(source.data.cardId === id ? null : extractClosestEdge(self.data));
            setPlaceholderHeight(source.data.height);
          },
          onDragLeave: () => setClosestEdge(null),
          onDrop: () => setClosestEdge(null),
        }),
      );
    }, [id, listId, index, isPersisted, canEdit, isDragOverTask, key]);

    useDropAnimation(cardRef, key);

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
            <div title={name} className={clsx(s.name, isCompleted && s.nameCompleted)}>
              {isCompleted && <Icon type={IconType.Check} size={IconSize.Size13} title={t('common.done')} />}
              <LinkifiedTextRenderer text={name} />
            </div>
          </div>
          {notificationsTotal > 0 && notificationsTotal <= 9 && <span className={s.notification}>{notificationsTotal}</span>}
          {notificationsTotal > 9 && <span className={clsx(s.notification, s.notificationFull)}>9+</span>}
        </div>
        {coverUrl && <img src={coverUrl} alt="" className={s.cover} draggable={false} />}
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
                showFullDueDates={showFullDueDates}
                canEdit={canEdit}
                allBoardMemberships={boardAndTaskMemberships}
                boardMemberships={boardMemberships}
                onCreate={onTaskCreate}
                onUpdate={onTaskUpdate}
                onMove={onTaskMove}
                onDuplicate={onTaskDuplicate}
                onDelete={onTaskDelete}
                onUserAdd={onUserToTaskAdd}
                onUserRemove={onUserFromTaskRemove}
                onUserEmailLookup={onUserEmailLookup}
                onMouseEnterTasks={handleTasksMouseEnter}
                onMouseLeaveTasks={handleTasksMouseOut}
                onActivitiesFetch={onTaskActivitiesFetch}
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
                      <DueDate value={dueDate} completedAt={completedAt} variant="card" isClickable={canEdit} showFullDueDates={showFullDueDates} />
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
                    onUserEmailLookup={onUserEmailLookup}
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

    const placeholder = <div style={{ height: placeholderHeight }} />;

    return (
      <div ref={wrapperRef} className={s.wrapper}>
        {(closestEdge === 'top' || (isDragging && showOrigin)) && placeholder}
        <NameEdit ref={nameEdit} defaultValue={name} onUpdate={handleNameUpdate}>
          <div ref={cardRef} className={clsx(s.card, isOpen && s.cardOpen, isDragging && gs.hidden)}>
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
                <div className={s.popupWrapper}>
                  <CardActionsPopup
                    ref={cardActionsPopupRef}
                    card={{
                      id,
                      name,
                      isCompleted,
                      dueDate,
                      timer,
                      boardId,
                      listId,
                      projectId,
                      lastActivityId,
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
                    onMarkCompleted={onMarkCompleted}
                    onMove={onMove}
                    onTransfer={onTransfer}
                    onDuplicate={onDuplicate}
                    onDelete={onDelete}
                    onUserAdd={onUserAdd}
                    onUserRemove={onUserRemove}
                    onUserEmailLookup={onUserEmailLookup}
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
                    <Button variant={ButtonVariant.Icon} title={t('common.editCard')} className={s.editCardButton}>
                      <Icon type={IconType.EllipsisVertical} size={IconSize.Size13} />
                    </Button>
                  </CardActionsPopup>
                </div>
              </>
            ) : (
              <span className={s.content}>{contentNode}</span>
            )}
          </div>
        </NameEdit>
        {closestEdge === 'bottom' && placeholder}
      </div>
    );
  },
);

Card.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  isCompleted: PropTypes.bool.isRequired,
  dueDate: PropTypes.instanceOf(Date),
  completedAt: PropTypes.instanceOf(Date),
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
  lastActivityId: PropTypes.string,
  closestDueDate: PropTypes.instanceOf(Date),
  canEdit: PropTypes.bool.isRequired,
  createdAt: PropTypes.instanceOf(Date),
  createdBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  updatedAt: PropTypes.instanceOf(Date),
  updatedBy: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  showFullDueDates: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onMarkCompleted: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onTransfer: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUserAdd: PropTypes.func.isRequired,
  onUserRemove: PropTypes.func.isRequired,
  onUserEmailLookup: PropTypes.func.isRequired,
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
  onTaskActivitiesFetch: PropTypes.func.isRequired,
};

Card.defaultProps = {
  dueDate: undefined,
  completedAt: undefined,
  timer: undefined,
  coverUrl: undefined,
  description: undefined,
  lastActivityId: undefined,
  closestDueDate: undefined,
  createdAt: undefined,
  createdBy: undefined,
  updatedAt: undefined,
  updatedBy: undefined,
};

export default Card;
