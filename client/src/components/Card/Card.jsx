import React, { useCallback, useRef, useEffect, useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import clsx from 'clsx';
import { format } from 'date-fns';
import PropTypes from 'prop-types';

import Paths from '../../constants/Paths';
import { startTimer, stopTimer } from '../../utils/timer';
import DueDate from '../DueDate';
import DueDateEditPopup from '../DueDateEditPopup';
import Label from '../Label';
import LabelsPopup from '../LabelsPopup';
import MembershipsPopup from '../MembershipsPopup';
import Priority from '../Priority';
import Tasks from '../Tasks';
import Timer from '../Timer';
import User from '../User';
import { Button, ButtonStyle, Icon, IconType, IconSize, LinkifiedTextRenderer } from '../Utils';
import ActionsPopup from './ActionsPopup';
import NameEdit from './NameEdit';

import * as s from './Card.module.scss';

// .wrapper margin-bottom (8px); baked into the virtual row height since react-window positions rows absolutely
const CARD_GAP = 8;

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
    listType,
    listAutoArchiveDays,
    completedAt,
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
    priority,
    parent,
    childrenCount,
    isBlocked,
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
    style,
    provided,
    snapshot,
    isClone,
    onSizeChange,
  }) => {
    const [t] = useTranslation();
    const nameEdit = useRef(null);
    const cardRef = useRef(null);
    const [isDragOverTask, setIsDragOverTask] = useState(false);
    const [isLinkCopied, setIsLinkCopied] = useState(false);
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

    // Report natural height to the virtualized list so it can size the row (cards have variable height)
    useEffect(() => {
      const cardElement = cardRef.current;
      if (isClone || !onSizeChange || !cardElement) {
        return undefined;
      }
      const measure = () => onSizeChange(id, cardElement.offsetHeight + CARD_GAP);
      measure();
      const observer = new window.ResizeObserver(measure);
      observer.observe(cardElement);
      return () => observer.disconnect();
    }, [id, isClone, onSizeChange]);

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

    const handleCopyLink = useCallback(
      (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(url);
        setIsLinkCopied(true);
        setTimeout(() => setIsLinkCopied(false), 1500);
      },
      [url],
    );

    const getStyle = (draggableStyle, dragSnapshot) => {
      // Merge in the virtualized-list row style (`style` prop); undefined for the drag clone
      const merged = { ...draggableStyle, ...style };
      if (!dragSnapshot.isDropAnimating) {
        return merged;
      }
      return {
        ...merged,
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

    // §6.2: Done card treatment — gated on the parent list's type, same shape as isBlocked
    // above. completedAt can be null even in a done-type list right after a restore (§5.4
    // cards/unarchive.js always clears it), so the meta/countdown rows are additionally
    // gated on completedAt being present rather than assuming it whenever listType is 'done'.
    const isDoneList = listType === 'done';
    let completionMetaText = null;
    let autoArchiveDaysRemaining = null;
    let autoArchiveElapsedPercent = 0;
    let isAutoArchiveUrgent = false;
    if (isDoneList && completedAt) {
      const now = new Date();
      const isSameDay = completedAt.getFullYear() === now.getFullYear() && completedAt.getMonth() === now.getMonth() && completedAt.getDate() === now.getDate();
      if (isSameDay) {
        completionMetaText = t('common.completedAt', { time: format(completedAt, 'h:mmaaa').toLowerCase() });
      } else if (completedAt.getFullYear() === now.getFullYear()) {
        completionMetaText = format(completedAt, 'MMM dd');
      } else {
        completionMetaText = format(completedAt, 'MMM dd, yyyy');
      }

      const autoArchiveDaysValue = listAutoArchiveDays || 30;
      const daysSinceCompleted = (now.getTime() - completedAt.getTime()) / (1000 * 60 * 60 * 24);
      autoArchiveDaysRemaining = Math.max(0, Math.ceil(autoArchiveDaysValue - daysSinceCompleted));
      autoArchiveElapsedPercent = Math.min(100, (daysSinceCompleted / autoArchiveDaysValue) * 100);
      isAutoArchiveUrgent = autoArchiveElapsedPercent >= 80;
    }

    const contentNode = (
      <>
        <div>
          <div className={s.detailsTitle}>
            {isDoneList && <Icon type={IconType.Check} size={IconSize.Size13} className={s.doneCheck} />}
            <div title={name} className={s.name}>
              <LinkifiedTextRenderer text={name} />
            </div>
          </div>
          {childrenCount > 0 && <div className={s.childrenCountText}>{t('common.childrenCount', { count: childrenCount })}</div>}
          {notificationsTotal > 0 && notificationsTotal <= 9 && <span className={s.notification}>{notificationsTotal}</span>}
          {notificationsTotal > 9 && <span className={clsx(s.notification, s.notificationFull)}>9+</span>}
        </div>
        {coverUrl && <img src={coverUrl} alt="" className={s.cover} />}
        {(priority || labels.length > 0 || tasks.length > 0 || description || attachmentsCount > 0 || commentCount > 0 || dueDate || timer || users.length > 0) && (
          <div className={s.details}>
            {priority && (
              <span className={s.attachment}>
                <Priority name={priority.name} color={priority.color} variant="card" />
              </span>
            )}
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
              <span className={clsx(s.attachments, s.attachmentsRight, s.users, isBlocked && s.usersBlockedGap)}>
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
        {isDoneList && completionMetaText && <div className={s.doneMeta}>{completionMetaText}</div>}
        {isDoneList && completedAt && (
          <div className={clsx(s.autoArchiveRow, isAutoArchiveUrgent && s.autoArchiveRowUrgent)}>
            {autoArchiveDaysRemaining > 0 ? t('common.autoArchivesInDays', { days: autoArchiveDaysRemaining }) : t('common.autoArchivesToday')}
            <span className={s.autoArchiveBar}>
              <span className={s.autoArchiveBarFill} style={{ width: `${autoArchiveElapsedPercent}%` }} />
            </span>
          </div>
        )}
      </>
    );

    const renderCard = (dragProvided, dragSnapshot) => (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <div {...dragProvided.draggableProps} {...dragProvided.dragHandleProps} ref={dragProvided.innerRef} className={s.wrapper} style={getStyle(dragProvided.draggableProps.style, dragSnapshot)}>
        <NameEdit ref={nameEdit} defaultValue={name} onUpdate={handleNameUpdate}>
          <div ref={cardRef} className={clsx(s.card, isOpen && s.cardOpen, (parent || childrenCount > 0) && s.cardHasHeroAccent, !isClone && dragSnapshot.isDragging && s.cardDragging)}>
            {isBlocked && (
              <span className={s.blockedIndicator} title={t('common.cardIsBlocked')}>
                <Icon type={IconType.Exclamation} size={IconSize.Size20} className={s.blockedIndicatorIcon} />
              </span>
            )}
            {parent && (
              <Button
                style={ButtonStyle.Default}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(Paths.CARDS.replace(':id', parent.id));
                }}
                title={t('common.openHero')}
                className={s.heroBar}
              >
                {t('common.heroLabel', { name: parent.name })}
              </Button>
            )}
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
                <Button
                  style={ButtonStyle.Icon}
                  title={t('common.linkCard', { context: 'title' })}
                  onClick={handleCopyLink}
                  className={clsx(s.copyLinkButton, isLinkCopied && s.copyLinkButtonCopied, parent && s.copyLinkButtonWithHero)}
                >
                  <Icon type={isLinkCopied ? IconType.Check : IconType.Link} size={IconSize.Size13} />
                </Button>
                {canEdit && (
                  <div className={clsx(s.popupWrapper, parent && s.popupWrapperWithHero)}>
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
    );

    if (isClone) {
      return renderCard(provided, snapshot);
    }

    return (
      <Draggable draggableId={`card:${id}`} index={index} isDragDisabled={isDragOverTask || !isPersisted || !canEdit}>
        {(dragProvided, dragSnapshot) => renderCard(dragProvided, dragSnapshot)}
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
  listType: PropTypes.oneOf(['none', 'active', 'blocked', 'done']),
  listAutoArchiveDays: PropTypes.number,
  completedAt: PropTypes.instanceOf(Date),
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
  priority: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  parent: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  childrenCount: PropTypes.number.isRequired,
  isBlocked: PropTypes.bool,
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
  style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  provided: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  snapshot: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  isClone: PropTypes.bool,
  onSizeChange: PropTypes.func,
};

Card.defaultProps = {
  dueDate: undefined,
  timer: undefined,
  coverUrl: undefined,
  listType: 'none',
  listAutoArchiveDays: undefined,
  completedAt: undefined,
  description: undefined,
  priority: undefined,
  parent: undefined,
  isBlocked: false,
  closestDueDate: undefined,
  createdAt: undefined,
  createdBy: undefined,
  updatedAt: undefined,
  updatedBy: undefined,
  style: undefined,
  provided: undefined,
  snapshot: undefined,
  isClone: false,
  onSizeChange: undefined,
};

export default Card;
