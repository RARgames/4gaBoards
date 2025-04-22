import React, { useCallback, useRef, useEffect, useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import Paths from '../../constants/Paths';
import { startTimer, stopTimer } from '../../utils/timer';
import DueDate from '../DueDate';
import Label from '../Label';
import MembershipsPopup from '../MembershipsPopup';
import Tasks from '../Tasks';
import Timer from '../Timer';
import User from '../User';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';
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
    allBoardMemberships,
    allLabels,
    url,
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
    onTaskUpdate,
    onTaskDuplicate,
    onTaskDelete,
    onUserToTaskAdd,
    onUserFromTaskRemove,
    onTaskCreate,
    onTaskMove,
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
      (event) => {
        // Prevent card click if user is trying to edit card details such as tasks
        let { target } = event;
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
      nameEdit.current.open();
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

    const visibleMembersCount = 3;

    const contentNode = (
      <>
        <div>
          <div className={s.detailsTitle}>
            <div title={name} className={s.name}>
              {name}
            </div>
          </div>
          {notificationsTotal > 0 && notificationsTotal <= 9 && <span className={s.notification}>{notificationsTotal}</span>}
          {notificationsTotal > 9 && <span className={classNames(s.notification, s.notificationFull)}>9+</span>}
        </div>
        {coverUrl && <img src={coverUrl} alt="" className={s.cover} />}
        <div className={s.details}>
          {labels.length > 0 && (
            <span className={s.labels}>
              {labels.map((label) => (
                <span key={label.id} className={classNames(s.attachment, s.attachmentLeft)}>
                  <Label name={label.name} color={label.color} variant="card" />
                </span>
              ))}
            </span>
          )}
          {tasks.length > 0 && (
            <Tasks
              variant="card"
              isCardActive={isOpen}
              cardId={id}
              items={tasks}
              canEdit={canEdit}
              boardMemberships={allBoardMemberships}
              onCreate={onTaskCreate}
              onUpdate={onTaskUpdate}
              onMove={onTaskMove}
              onDuplicate={onTaskDuplicate}
              onDelete={onTaskDelete}
              onUserAdd={onUserToTaskAdd}
              onUserRemove={onUserFromTaskRemove}
              onMouseEnterTasks={handleTasksMouseEnter}
              onMouseLeaveTasks={handleTasksMouseOut}
            />
          )}
          {(description || attachmentsCount > 0 || commentCount > 0 || dueDate || timer) && (
            <span className={s.attachments}>
              {description && (
                <span className={classNames(s.attachment, s.attachmentLeft)}>
                  <Icon type={IconType.BarsStaggered} size={IconSize.Size14} className={s.detailsIcon} title={t('common.detailsDescription')} />
                </span>
              )}
              {attachmentsCount > 0 && (
                <span className={classNames(s.attachment, s.attachmentLeft)}>
                  <Icon type={IconType.Attach} size={IconSize.Size14} className={s.detailsIcon} title={t('common.detailsAttachments', { count: attachmentsCount })} />
                </span>
              )}
              {commentCount > 0 && (
                <span className={classNames(s.attachment, s.attachmentLeft)}>
                  <Icon type={IconType.Comment} size={IconSize.Size14} className={s.detailsIcon} title={t('common.detailsComments', { count: commentCount })} />
                </span>
              )}
              {dueDate && (
                <span className={classNames(s.attachment, s.attachmentLeft)}>
                  <DueDate value={dueDate} variant="card" />
                </span>
              )}
              {timer && (
                <span className={classNames(s.attachment, s.attachmentLeft)} data-prevent-card-switch>
                  <Timer as="span" startedAt={timer.startedAt} total={timer.total} variant="card" onClick={canEdit ? handleToggleTimerClick : undefined} />
                </span>
              )}
            </span>
          )}
          {users.length > 0 && (
            <span className={classNames(s.attachments, s.attachmentsRight, s.users)}>
              <div className={s.popupWrapper2}>
                <MembershipsPopup
                  items={allBoardMemberships}
                  currentUserIds={users.map((user) => user.id)}
                  onUserSelect={(userId) => onUserAdd(userId, id)}
                  onUserDeselect={(userId) => onUserRemove(userId, id)}
                  offset={0}
                >
                  {users.slice(0, visibleMembersCount).map((user) => (
                    <span key={user.id} className={classNames(s.attachment, s.user)}>
                      <User name={user.name} avatarUrl={user.avatarUrl} size="card" />
                    </span>
                  ))}
                  {users.length > visibleMembersCount && (
                    <span
                      className={classNames(s.attachment, s.user, s.moreUsers)}
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
      </>
    );

    return (
      <Draggable draggableId={`card:${id}`} index={index} isDragDisabled={isDragOverTask || !isPersisted || !canEdit}>
        {(provided, snapshot) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef} className={s.wrapper} style={getStyle(provided.draggableProps.style, snapshot)}>
            <NameEdit ref={nameEdit} defaultValue={name} onUpdate={handleNameUpdate}>
              <div ref={cardRef} className={classNames(s.card, isOpen && s.cardOpen)}>
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
                          canEdit={canEdit}
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
                          <Button style={ButtonStyle.Icon} title={t('common.editCard')} className={classNames(s.editCardButton, s.target)}>
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
  /* eslint-disable react/forbid-prop-types */
  users: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  tasks: PropTypes.array.isRequired,
  description: PropTypes.string,
  attachmentsCount: PropTypes.number.isRequired,
  commentCount: PropTypes.number.isRequired,
  allProjectsToLists: PropTypes.array.isRequired,
  allBoardMemberships: PropTypes.array.isRequired,
  allLabels: PropTypes.array.isRequired,
  url: PropTypes.string.isRequired,
  /* eslint-enable react/forbid-prop-types */
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
  onTaskUpdate: PropTypes.func.isRequired,
  onTaskDuplicate: PropTypes.func.isRequired,
  onTaskDelete: PropTypes.func.isRequired,
  onUserToTaskAdd: PropTypes.func.isRequired,
  onUserFromTaskRemove: PropTypes.func.isRequired,
  onTaskCreate: PropTypes.func.isRequired,
  onTaskMove: PropTypes.func.isRequired,
};

Card.defaultProps = {
  dueDate: undefined,
  timer: undefined,
  coverUrl: undefined,
  description: undefined,
};

export default Card;
