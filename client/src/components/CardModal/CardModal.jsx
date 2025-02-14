import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { useLocalStorage } from '../../hooks';
import { useToggle } from '../../lib/hooks';
import { createTimer, startTimer, stopTimer } from '../../utils/timer';
import ActionsPopup from '../Card/ActionsPopup';
import DeletePopup from '../DeletePopup';
import DueDate from '../DueDate';
import DueDateEditPopup from '../DueDateEditPopup';
import Label from '../Label';
import LabelsPopup from '../LabelsPopup';
import MembershipsPopup from '../MembershipsPopup';
import Tasks from '../Tasks';
import Timer from '../Timer';
import TimerEditPopup from '../TimerEditPopup';
import User from '../User';
import { Button, ButtonStyle, Icon, IconType, IconSize, Dropdown, DropdownStyle, MDPreview } from '../Utils';
import Activities from './Activities';
import AttachmentAdd from './AttachmentAdd';
import AttachmentAddZone from './AttachmentAddZone';
import Attachments from './Attachments';
import DescriptionEdit from './DescriptionEdit';
import NameField from './NameField';

import * as gStyles from '../../globalStyles.module.scss';
import * as s from './CardModal.module.scss';

const CardModal = React.memo(
  ({
    name,
    id,
    description,
    dueDate,
    timer,
    isSubscribed,
    isActivitiesFetching,
    isAllActivitiesFetched,
    isActivitiesDetailsVisible,
    isActivitiesDetailsFetching,
    listId,
    boardId,
    projectId,
    users,
    labels,
    tasks,
    attachments,
    activities,
    descriptionMode,
    descriptionShown,
    tasksShown,
    attachmentsShown,
    commentsShown,
    userId,
    isGithubConnected,
    githubRepo,
    allProjectsToLists,
    allBoardMemberships,
    allLabels,
    canEdit,
    canEditCommentActivities,
    canEditAllCommentActivities,
    commentMode,
    commentCount,
    url,
    onCurrentUserUpdate,
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
    onLabelMove,
    onLabelDelete,
    onTaskCreate,
    onTaskUpdate,
    onTaskDuplicate,
    onTaskMove,
    onTaskDelete,
    onUserToTaskAdd,
    onUserFromTaskRemove,
    onAttachmentCreate,
    onAttachmentUpdate,
    onAttachmentDelete,
    onActivitiesFetch,
    onActivitiesDetailsToggle,
    onCommentActivityCreate,
    onCommentActivityUpdate,
    onCommentActivityDelete,
    onClose,
  }) => {
    const [t] = useTranslation();

    const isGalleryOpened = useRef(false);
    const nameEdit = useRef(null);
    const dropdown = useRef(null);
    const tasksRef = useRef(null);
    const descEditRef = useRef(null);
    const descriptionEditButtonRef = useRef(null);
    const [descriptionHeight, setDescriptionHeight] = useState(0);
    const [unsavedDesc, setUnsavedDesc] = useState(false);
    const [, getLocalDesc] = useLocalStorage(`desc-${id}`);
    const [isDescOpened, setIsDescOpened] = useState(false);
    const [descShown, toggleDescShown] = useToggle(descriptionShown);
    const [taskShown, toggleTasksShown] = useToggle(tasksShown);
    const [attacShown, toggleAttacShown] = useToggle(attachmentsShown);
    const [commShown, toggleCommShown] = useToggle(commentsShown);

    const selectedProject = useMemo(() => allProjectsToLists.find((project) => project.id === projectId) || null, [allProjectsToLists, projectId]);
    const selectedBoard = useMemo(() => (selectedProject && selectedProject.boards.find((board) => board.id === boardId)) || null, [selectedProject, boardId]);
    const selectedList = useMemo(() => (selectedBoard && selectedBoard.lists.find((list) => list.id === listId)) || null, [selectedBoard, listId]);

    const handleToggleDescShown = useCallback(() => {
      toggleDescShown();
      // TODO hacky way to update UI faster
      const timeout = setTimeout(() => {
        onCurrentUserUpdate({ descriptionShown: !descShown });
      }, 0);
      return () => clearTimeout(timeout);
    }, [descShown, onCurrentUserUpdate, toggleDescShown]);

    const handleToggleTasksShown = useCallback(() => {
      toggleTasksShown();
      // TODO hacky way to update UI faster
      const timeout = setTimeout(() => {
        onCurrentUserUpdate({ tasksShown: !taskShown });
      }, 0);
      return () => clearTimeout(timeout);
    }, [taskShown, onCurrentUserUpdate, toggleTasksShown]);

    const handleToggleAttacShown = useCallback(() => {
      toggleAttacShown();
      // TODO hacky way to update UI faster
      const timeout = setTimeout(() => {
        onCurrentUserUpdate({ attachmentsShown: !attacShown });
      }, 0);
      return () => clearTimeout(timeout);
    }, [attacShown, onCurrentUserUpdate, toggleAttacShown]);

    const handleToggleCommShown = useCallback(() => {
      toggleCommShown();
      // TODO hacky way to update UI faster
      const timeout = setTimeout(() => {
        onCurrentUserUpdate({ commentsShown: !commShown });
      }, 0);
      return () => clearTimeout(timeout);
    }, [commShown, onCurrentUserUpdate, toggleCommShown]);

    const handleNameUpdate = useCallback(
      (newName) => {
        onUpdate({
          name: newName,
        });
      },
      [onUpdate],
    );

    const handleDescriptionUpdate = useCallback(
      (newDescription) => {
        onUpdate({
          description: newDescription,
        });
      },
      [onUpdate],
    );

    const handleLocalDescChange = useCallback((isLocallyChanged) => {
      setUnsavedDesc(isLocallyChanged);
    }, []);

    const handleDueDateUpdate = useCallback(
      (newDueDate) => {
        onUpdate({
          dueDate: newDueDate,
        });
      },
      [onUpdate],
    );

    const handleTimerUpdate = useCallback(
      (newTimer) => {
        onUpdate({
          timer: newTimer,
        });
      },
      [onUpdate],
    );

    const handleToggleTimerClick = useCallback(() => {
      // TODO hacky way of creating new timer - should be created using TimerEditStep
      if (!timer) {
        const newTimer = createTimer({ hours: 0, minutes: 0, seconds: 0 });
        onUpdate({
          timer: newTimer.startedAt ? stopTimer(newTimer) : startTimer(newTimer),
        });
      } else {
        onUpdate({
          timer: timer.startedAt ? stopTimer(timer) : startTimer(timer),
        });
      }
    }, [onUpdate, timer]);

    const handleCoverUpdate = useCallback(
      (newCoverAttachmentId) => {
        onUpdate({
          coverAttachmentId: newCoverAttachmentId,
        });
      },
      [onUpdate],
    );

    const handleToggleSubscriptionClick = useCallback(() => {
      onUpdate({
        isSubscribed: !isSubscribed,
      });
    }, [isSubscribed, onUpdate]);

    const handleTaskAddOpen = useCallback(() => {
      if (!taskShown) {
        handleToggleTasksShown();
      }
      const timeout = setTimeout(() => {
        tasksRef.current?.openTaskAdd();
      }, 0);
      return () => clearTimeout(timeout);
    }, [handleToggleTasksShown, taskShown]);

    const handleNameEdit = useCallback(() => {
      if (canEdit) {
        nameEdit.current.open();
      }
    }, [canEdit]);

    const handleGalleryOpen = useCallback(() => {
      isGalleryOpened.current = true;
    }, []);

    const handleGalleryClose = useCallback(() => {
      isGalleryOpened.current = false;
    }, []);

    const handleClose = useCallback(() => {
      if (isGalleryOpened.current) {
        return;
      }
      onClose();
    }, [onClose]);

    const handleDropdownClick = useCallback(() => {
      if (canEdit) {
        dropdown.current.open();
      }
    }, [canEdit]);

    const handleDescButtonClick = useCallback(() => {
      if (!descShown) {
        handleToggleDescShown();
      }
      if (!isDescOpened) {
        setIsDescOpened(true);
      } else if (descEditRef.current) {
        descEditRef.current.focus();
      }
    }, [descShown, handleToggleDescShown, isDescOpened]);

    const handleDescClick = useCallback((e) => {
      if (descriptionEditButtonRef.current) {
        setDescriptionHeight(descriptionEditButtonRef.current.offsetHeight);
      }
      if (e.ctrlKey) {
        return;
      }
      setIsDescOpened(true);
    }, []);

    const handleDescClose = useCallback(() => {
      setIsDescOpened(false);
      setUnsavedDesc(false);
    }, []);

    // eslint-disable-next-line consistent-return
    useEffect(() => {
      // TODO here reset state of all inner components (tasks, comments)
      setUnsavedDesc(false);
      setIsDescOpened(false);
      if (getLocalDesc()) {
        setUnsavedDesc(true);
        const timeout = setTimeout(() => {
          setIsDescOpened(true);
        }, 0);

        return () => clearTimeout(timeout);
      }
    }, [getLocalDesc, id]);

    const userIds = users.map((user) => user.id);
    const labelIds = labels.map((label) => label.id);

    const headerNode = (
      <div className={s.header}>
        <div className={s.headerFirstLine}>
          <div className={s.headerTitleWrapper}>
            <NameField defaultValue={name} onUpdate={handleNameUpdate} ref={nameEdit}>
              {/*  eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
              <div className={classNames(s.headerTitle, canEdit && gStyles.cursorPointer)} onClick={handleNameEdit} title={name}>
                {name}
              </div>
            </NameField>
          </div>
          {canEdit && (
            <DeletePopup
              title={t('common.deleteCard', { context: 'title' })}
              content={t('common.areYouSureYouWantToDeleteThisCard')}
              buttonContent={t('action.deleteCard')}
              onConfirm={onDelete}
              position="left-start"
              offset={0}
            >
              <Button style={ButtonStyle.Icon} title={t('common.deleteCard', { context: 'title' })}>
                <Icon type={IconType.Trash} size={IconSize.Size14} />
              </Button>
            </DeletePopup>
          )}
          {canEdit && (
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
              onLabelMove={onLabelMove}
              onLabelDelete={onLabelDelete}
              position="left-start"
              offset={0}
              hideCloseButton
            >
              <Button style={ButtonStyle.Icon} title={t('common.editCard')}>
                <Icon type={IconType.EllipsisVertical} size={IconSize.Size14} />
              </Button>
            </ActionsPopup>
          )}
          <Button style={ButtonStyle.Icon} title={t('common.closeCard')} onClick={handleClose}>
            <Icon type={IconType.Close} size={IconSize.Size14} />
          </Button>
        </div>
        <div className={s.headerListFieldWrapper}>
          <Dropdown
            ref={dropdown}
            style={DropdownStyle.FullWidth}
            options={selectedBoard.lists.map((list) => ({
              name: list.name,
              id: list.id,
            }))}
            placeholder={selectedList.name}
            defaultItem={selectedList}
            isSearchable
            onChange={(list) => onMove(list.id)}
            selectFirstOnSearch
            dropdownMenuClassName={s.dropdownMenu}
          >
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div className={classNames(canEdit && gStyles.cursorPointer)} onClick={handleDropdownClick}>
              <div className={classNames(s.headerListField)} title={selectedList.name}>
                {selectedList.name}
              </div>
              <Icon type={IconType.TriangleDown} title={t('common.moveCardToList')} size={IconSize.Size10} className={s.headerListFieldIcon} />
            </div>
          </Dropdown>
        </div>
      </div>
    );

    const visibleMembersCount = 5;
    const membersNode = (
      <div className={s.headerItems}>
        <div className={s.text}>
          {t('common.members', { context: 'title' })}
          {canEdit && (
            <div className={s.popupWrapper}>
              <MembershipsPopup items={allBoardMemberships} currentUserIds={userIds} onUserSelect={onUserAdd} onUserDeselect={onUserRemove} offset={0}>
                <Button style={ButtonStyle.Icon} title={t('common.addMember')}>
                  <Icon type={IconType.Plus} size={IconSize.Size10} className={s.iconAddButton2} />
                </Button>
              </MembershipsPopup>
            </div>
          )}
        </div>
        <MembershipsPopup items={allBoardMemberships} currentUserIds={userIds} onUserSelect={onUserAdd} onUserDeselect={onUserRemove} offset={0}>
          {users.slice(0, visibleMembersCount).map((user) => (
            <span key={user.id} className={classNames(s.headerItem, s.user)}>
              <User name={user.name} avatarUrl={user.avatarUrl} size="small" />
            </span>
          ))}
          {users.length > visibleMembersCount && (
            <span
              className={classNames(s.headerItem, s.user, s.moreUsers)}
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
    );

    const labelsNode = (
      <div className={s.headerItems}>
        <div className={s.text}>
          {t('common.labels', { context: 'title' })}
          {canEdit && (
            <div className={s.popupWrapper}>
              <LabelsPopup
                items={allLabels}
                currentIds={labelIds}
                onSelect={onLabelAdd}
                onDeselect={onLabelRemove}
                onCreate={onLabelCreate}
                onUpdate={onLabelUpdate}
                onMove={onLabelMove}
                onDelete={onLabelDelete}
                offset={0}
              >
                <Button style={ButtonStyle.Icon} title={t('common.addLabel')}>
                  <Icon type={IconType.Plus} size={IconSize.Size10} className={s.iconAddButton2} />
                </Button>
              </LabelsPopup>
            </div>
          )}
        </div>
        {labels.map((label) => (
          <span key={label.id} className={s.headerItem}>
            <Label name={label.name} color={label.color} variant="cardModal" />
          </span>
        ))}
      </div>
    );

    const dueDateNode = (
      <div className={s.headerItems}>
        <div className={s.text}>
          {t('common.dueDate', { context: 'title' })}
          {canEdit && (
            <div className={s.popupWrapper}>
              <DueDateEditPopup defaultValue={dueDate} onUpdate={handleDueDateUpdate} offset={0}>
                <Button style={ButtonStyle.Icon} title={dueDate ? t('common.editDueDate') : t('common.addDueDate')}>
                  <Icon type={dueDate ? IconType.Pencil : IconType.Plus} size={IconSize.Size10} className={s.iconAddButton2} />
                </Button>
              </DueDateEditPopup>
            </div>
          )}
        </div>
        <span className={s.headerItem}>
          {canEdit ? (
            <DueDateEditPopup defaultValue={dueDate} onUpdate={handleDueDateUpdate}>
              <DueDate value={dueDate} />
            </DueDateEditPopup>
          ) : (
            <DueDate value={dueDate} />
          )}
        </span>
      </div>
    );

    const timerNode = (
      <div className={s.headerItems}>
        <div className={s.text}>
          {t('common.timer', { context: 'title' })}
          {canEdit && (
            <div className={s.popupWrapper}>
              <TimerEditPopup defaultValue={timer} onUpdate={handleTimerUpdate} offset={0}>
                <Button style={ButtonStyle.Icon} title={t('common.editTimer')}>
                  <Icon type={IconType.Pencil} size={IconSize.Size10} className={s.iconAddButton2} />
                </Button>
              </TimerEditPopup>
            </div>
          )}
        </div>
        <span className={s.headerItem}>
          <Timer startedAt={timer ? timer.startedAt : undefined} total={timer ? timer.total : 0} variant="cardModal" onClick={canEdit ? handleToggleTimerClick : undefined} />
        </span>
      </div>
    );

    const subscribeNode = (
      <div className={s.headerItems}>
        <div className={s.text}>{t('common.notifications')}</div>
        <span className={s.headerItem}>
          <Button style={ButtonStyle.Default} content={isSubscribed ? t('action.unsubscribe') : t('action.subscribe')} onClick={handleToggleSubscriptionClick} className={s.subscribeButton} />
        </span>
      </div>
    );

    const descriptionEditOpenNode = description ? (
      <Button title={t('common.editDescription')} onClick={handleDescClick} className={classNames(s.descriptionText, s.cursorPointer)} ref={descriptionEditButtonRef}>
        <MDPreview source={description} isGithubConnected={isGithubConnected} githubRepo={githubRepo} />
      </Button>
    ) : (
      <Button style={ButtonStyle.Default} title={t('common.addDescription')} onClick={handleDescClick} className={s.descriptionButton}>
        <span className={s.descriptionButtonText}>{t('action.addDescription')}</span>
      </Button>
    );

    const descriptionEditNode = isDescOpened ? (
      <DescriptionEdit
        ref={descEditRef}
        defaultValue={description}
        onUpdate={handleDescriptionUpdate}
        cardId={id}
        onLocalDescChange={handleLocalDescChange}
        onClose={handleDescClose}
        descriptionHeight={descriptionHeight}
        descriptionMode={descriptionMode}
        userId={userId}
        onCurrentUserUpdate={onCurrentUserUpdate}
        isGithubConnected={isGithubConnected}
        githubRepo={githubRepo}
      />
    ) : (
      descriptionEditOpenNode
    );

    const descriptionNode = (description || canEdit) && (
      <div>
        <div className={s.moduleHeader}>
          <Icon type={IconType.BarsStaggered} size={IconSize.Size20} className={s.moduleIcon} />
          {t('common.description')}
          {canEdit && (
            <Button style={ButtonStyle.Icon} title={description ? t('common.editDescription') : t('common.addDescription')} onClick={handleDescButtonClick}>
              <Icon type={description ? IconType.Pencil : IconType.Plus} size={IconSize.Size10} className={s.iconAddButton} />
            </Button>
          )}
          {canEdit && unsavedDesc && <span className={s.localChangesLoaded}>{t('common.unsavedChanges')}</span>}
          <Button style={ButtonStyle.Icon} title={t('common.toggleDescription')} onClick={handleToggleDescShown} className={s.buttonToggle}>
            <Icon type={descShown ? IconType.Minus : IconType.Plus} size={IconSize.Size10} />
          </Button>
        </div>
        <div>
          {descShown && canEdit && descriptionEditNode}
          {descShown && !canEdit && (
            <div className={s.descriptionText}>
              <MDPreview source={description} isGithubConnected={isGithubConnected} githubRepo={githubRepo} />
            </div>
          )}
        </div>
      </div>
    );

    const completedTasks = tasks.filter((task) => task.isCompleted);
    const closestNotCompletedTaslDueDate = tasks.filter((task) => !task.isCompleted && task.dueDate).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

    const tasksNode = (tasks.length > 0 || canEdit) && (
      <div>
        <div className={s.moduleHeader}>
          <Icon type={IconType.Check} size={IconSize.Size20} className={s.moduleIcon} />
          {t('common.tasks')}
          {tasks.length > 0 && closestNotCompletedTaslDueDate && (
            <div className={s.taskDueDateSummaryWrapper}>
              <DueDate variant="tasksCard" value={closestNotCompletedTaslDueDate.dueDate} titlePrefix={t('common.dueDateSummary')} iconSize={IconSize.Size12} />
            </div>
          )}
          {tasks.length > 0 && (
            <div className={s.headerCount}>
              ({completedTasks.length}/{tasks.length})
            </div>
          )}
          {canEdit && (
            <Button style={ButtonStyle.Icon} title={t('common.addTask')} onClick={handleTaskAddOpen}>
              <Icon type={IconType.Plus} size={IconSize.Size10} className={s.iconAddButton} />
            </Button>
          )}
          <Button style={ButtonStyle.Icon} title={t('common.toggleTasks')} onClick={handleToggleTasksShown} className={s.buttonToggle}>
            <Icon type={taskShown ? IconType.Minus : IconType.Plus} size={IconSize.Size10} />
          </Button>
        </div>
        <div>
          {taskShown && (
            <Tasks
              ref={tasksRef}
              variant="cardModal"
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
            />
          )}
        </div>
      </div>
    );

    const attachmentsNode = (
      <div>
        <div className={s.moduleHeader}>
          <Icon type={IconType.Attach} size={IconSize.Size20} className={s.moduleIcon} />
          {t('common.attachments')}
          {attachments.length > 0 && <div className={s.headerCount}>({attachments.length})</div>}
          {canEdit && (
            <AttachmentAdd onCreate={onAttachmentCreate}>
              <Button style={ButtonStyle.Icon} title={t('common.addAttachmentButton')}>
                <Icon type={IconType.Plus} size={IconSize.Size10} className={s.iconAddButton} />
              </Button>
            </AttachmentAdd>
          )}
          <Button style={ButtonStyle.Icon} title={t('common.toggleAttachments')} onClick={handleToggleAttacShown} className={s.buttonToggle}>
            <Icon type={attacShown ? IconType.Minus : IconType.Plus} size={IconSize.Size10} />
          </Button>
        </div>
        <div>
          {attacShown && (
            <>
              <Attachments
                items={attachments}
                canEdit={canEdit}
                onUpdate={onAttachmentUpdate}
                onDelete={onAttachmentDelete}
                onCoverUpdate={handleCoverUpdate}
                onGalleryOpen={handleGalleryOpen}
                onGalleryClose={handleGalleryClose}
              />
              {canEdit && (
                <AttachmentAdd onCreate={onAttachmentCreate}>
                  <Button style={ButtonStyle.Default} title={t('common.addAttachmentButton')} className={s.addAttachmentButton}>
                    {t('common.addAttachment')} <span className={s.hint}>{t('common.addAttachmentExtra')}</span>
                  </Button>
                </AttachmentAdd>
              )}
            </>
          )}
        </div>
      </div>
    );

    const activitiesNode = (
      <Activities
        items={activities}
        isFetching={isActivitiesFetching}
        isAllFetched={isAllActivitiesFetched}
        isDetailsVisible={isActivitiesDetailsVisible}
        isDetailsFetching={isActivitiesDetailsFetching}
        canEdit={canEditCommentActivities}
        canEditAllComments={canEditAllCommentActivities}
        commentMode={commentMode}
        isGithubConnected={isGithubConnected}
        githubRepo={githubRepo}
        commentCount={commentCount}
        onFetch={onActivitiesFetch}
        onDetailsToggle={onActivitiesDetailsToggle}
        onCommentCreate={onCommentActivityCreate}
        onCommentUpdate={onCommentActivityUpdate}
        onCommentDelete={onCommentActivityDelete}
        toggleCommShown={handleToggleCommShown}
        commShown={commShown}
        onCurrentUserUpdate={onCurrentUserUpdate}
      />
    );

    const contentNode = (
      <div className={s.flexContainer}>
        {headerNode}
        <div className={classNames(s.mainContainer, gStyles.scrollableY)}>
          <div className={s.moduleContainer}>
            {membersNode}
            {labelsNode}
            {dueDateNode}
            {timerNode}
            {subscribeNode}
            <hr className={s.hr} />
          </div>
          <div className={s.moduleContainer}>
            {descriptionNode}
            <hr className={s.hr} />
          </div>
          <div className={s.moduleContainer}>
            {tasksNode}
            <hr className={s.hr} />
          </div>
          <div className={s.moduleContainer}>
            {attachmentsNode}
            <hr className={s.hr} />
          </div>
          <div className={s.moduleContainer}>
            {activitiesNode}
            <hr className={s.hr} />
          </div>
        </div>
      </div>
    );

    return <div className={s.wrapper}>{canEdit ? <AttachmentAddZone onCreate={onAttachmentCreate}>{contentNode}</AttachmentAddZone> : contentNode}</div>;
  },
);

CardModal.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  description: PropTypes.string,
  dueDate: PropTypes.instanceOf(Date),
  timer: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  isSubscribed: PropTypes.bool.isRequired,
  isActivitiesFetching: PropTypes.bool.isRequired,
  isAllActivitiesFetched: PropTypes.bool.isRequired,
  isActivitiesDetailsVisible: PropTypes.bool.isRequired,
  isActivitiesDetailsFetching: PropTypes.bool.isRequired,
  listId: PropTypes.string.isRequired,
  boardId: PropTypes.string.isRequired,
  projectId: PropTypes.string.isRequired,
  /* eslint-disable react/forbid-prop-types */
  users: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  tasks: PropTypes.array.isRequired,
  attachments: PropTypes.array.isRequired,
  activities: PropTypes.array.isRequired,
  descriptionMode: PropTypes.string.isRequired,
  descriptionShown: PropTypes.bool.isRequired,
  tasksShown: PropTypes.bool.isRequired,
  attachmentsShown: PropTypes.bool.isRequired,
  commentsShown: PropTypes.bool.isRequired,
  userId: PropTypes.string.isRequired,
  isGithubConnected: PropTypes.bool.isRequired,
  githubRepo: PropTypes.string.isRequired,
  allProjectsToLists: PropTypes.array.isRequired,
  allBoardMemberships: PropTypes.array.isRequired,
  allLabels: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  canEdit: PropTypes.bool.isRequired,
  canEditCommentActivities: PropTypes.bool.isRequired,
  canEditAllCommentActivities: PropTypes.bool.isRequired,
  commentMode: PropTypes.string.isRequired,
  commentCount: PropTypes.number.isRequired,
  url: PropTypes.string.isRequired,
  onCurrentUserUpdate: PropTypes.func.isRequired,
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
  onLabelMove: PropTypes.func.isRequired,
  onLabelDelete: PropTypes.func.isRequired,
  onTaskCreate: PropTypes.func.isRequired,
  onTaskUpdate: PropTypes.func.isRequired,
  onTaskDuplicate: PropTypes.func.isRequired,
  onTaskMove: PropTypes.func.isRequired,
  onTaskDelete: PropTypes.func.isRequired,
  onUserToTaskAdd: PropTypes.func.isRequired,
  onUserFromTaskRemove: PropTypes.func.isRequired,
  onAttachmentCreate: PropTypes.func.isRequired,
  onAttachmentUpdate: PropTypes.func.isRequired,
  onAttachmentDelete: PropTypes.func.isRequired,
  onActivitiesFetch: PropTypes.func.isRequired,
  onActivitiesDetailsToggle: PropTypes.func.isRequired,
  onCommentActivityCreate: PropTypes.func.isRequired,
  onCommentActivityUpdate: PropTypes.func.isRequired,
  onCommentActivityDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

CardModal.defaultProps = {
  description: undefined,
  dueDate: undefined,
  timer: undefined,
};

export default CardModal;
