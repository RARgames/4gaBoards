import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle, Icon, IconType, IconSize, Dropdown, MDPreview } from '../Utils';
import { createTimer, startTimer, stopTimer } from '../../utils/timer';
import NameField from './NameField';
import DescriptionEdit from './DescriptionEdit';
import Tasks from './Tasks';
import Attachments from './Attachments';
import AttachmentAddZone from './AttachmentAddZone';
import AttachmentAdd from './AttachmentAdd';
import Activities from './Activities';
import User from '../User';
import Label from '../Label';
import DueDate from '../DueDate';
import Timer from '../Timer';
import BoardMembershipsPopup from '../BoardMembershipsPopup';
import LabelsPopup from '../LabelsPopup';
import DueDateEditPopup from '../DueDateEditPopup';
import TimerEditPopup from '../TimerEditPopup';
import DeletePopup from '../DeletePopup';
import ActionsPopup from '../Card/ActionsPopup';
import { useLocalStorage } from '../../hooks';
import { useToggle } from '../../lib/hooks';

import styles from './CardModal.module.scss';
import gStyles from '../../globalStyles.module.scss';

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
    onTaskMove,
    onTaskDelete,
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
        tasksRef.current?.open();
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

    // TODO remove after testing
    // eslint-disable-next-line no-param-reassign
    // canEdit = false;

    const headerNode = (
      <div className={styles.header}>
        <div className={styles.headerFirstLine}>
          <div className={styles.headerTitleWrapper}>
            <NameField defaultValue={name} onUpdate={handleNameUpdate} ref={nameEdit}>
              {/*  eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
              <div className={classNames(styles.headerTitle, canEdit && gStyles.cursorPointer)} onClick={handleNameEdit} title={name}>
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
        <div className={styles.headerListFieldWrapper}>
          <Dropdown
            ref={dropdown}
            options={selectedBoard.lists.map((list) => ({
              name: list.name,
              id: list.id,
            }))}
            placeholder={selectedList.name}
            defaultItem={selectedList}
            isSearchable
            onChange={(list) => onMove(list.id)}
            selectFirstOnSearch
          >
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div className={classNames(canEdit && gStyles.cursorPointer)} onClick={handleDropdownClick}>
              <div className={classNames(styles.headerListField)}>{selectedList.name}</div>
              <Icon type={IconType.TriangleDown} title={t('common.moveCardToList')} size={IconSize.Size10} className={styles.headerListFieldIcon} />
            </div>
          </Dropdown>
        </div>
      </div>
    );

    const membersNode = (
      <div className={styles.headerItems}>
        <div className={styles.text}>
          {t('common.members', { context: 'title' })}
          {canEdit && (
            <div className={styles.popupWrapper}>
              <BoardMembershipsPopup items={allBoardMemberships} currentUserIds={userIds} onUserSelect={onUserAdd} onUserDeselect={onUserRemove} offset={0}>
                <Button style={ButtonStyle.Icon} title={t('common.addMember')}>
                  <Icon type={IconType.Plus} size={IconSize.Size10} className={styles.iconAddButton2} />
                </Button>
              </BoardMembershipsPopup>
            </div>
          )}
        </div>
        {users.map((user) => (
          <span key={user.id} className={styles.headerItem}>
            <User name={user.name} avatarUrl={user.avatarUrl} size="small" />
          </span>
        ))}
      </div>
    );

    const labelsNode = (
      <div className={styles.headerItems}>
        <div className={styles.text}>
          {t('common.labels', { context: 'title' })}
          {canEdit && (
            <div className={styles.popupWrapper}>
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
                  <Icon type={IconType.Plus} size={IconSize.Size10} className={styles.iconAddButton2} />
                </Button>
              </LabelsPopup>
            </div>
          )}
        </div>
        {labels.map((label) => (
          <span key={label.id} className={styles.headerItem}>
            <Label name={label.name} color={label.color} variant="cardModal" />
          </span>
        ))}
      </div>
    );

    const dueDateNode = (
      <div className={styles.headerItems}>
        <div className={styles.text}>
          {t('common.dueDate', { context: 'title' })}
          {canEdit && (
            <div className={styles.popupWrapper}>
              <DueDateEditPopup defaultValue={dueDate} onUpdate={handleDueDateUpdate} offset={0}>
                <Button style={ButtonStyle.Icon} title={dueDate ? t('common.editDueDate') : t('common.addDueDate')}>
                  <Icon type={dueDate ? IconType.Pencil : IconType.Plus} size={IconSize.Size10} className={styles.iconAddButton2} />
                </Button>
              </DueDateEditPopup>
            </div>
          )}
        </div>
        <span className={styles.headerItem}>
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
      <div className={styles.headerItems}>
        <div className={styles.text}>
          {t('common.timer', { context: 'title' })}
          {canEdit && (
            <div className={styles.popupWrapper}>
              <TimerEditPopup defaultValue={timer} onUpdate={handleTimerUpdate} offset={0}>
                <Button style={ButtonStyle.Icon} title={t('common.editTimer')}>
                  <Icon type={IconType.Pencil} size={IconSize.Size10} className={styles.iconAddButton2} />
                </Button>
              </TimerEditPopup>
            </div>
          )}
        </div>
        <span className={styles.headerItem}>
          <Timer startedAt={timer ? timer.startedAt : undefined} total={timer ? timer.total : 0} variant="cardModal" onClick={canEdit ? handleToggleTimerClick : undefined} />
        </span>
      </div>
    );

    const subscribeNode = (
      <div className={styles.headerItems}>
        <div className={styles.text}>{t('common.notifications')}</div>
        <span className={styles.headerItem}>
          <Button style={ButtonStyle.Default} content={isSubscribed ? t('action.unsubscribe') : t('action.subscribe')} onClick={handleToggleSubscriptionClick} className={styles.subscribeButton} />
        </span>
      </div>
    );

    const descriptionEditOpenNode = description ? (
      <Button title={t('common.editDescription')} onClick={handleDescClick} className={classNames(styles.descriptionText, styles.cursorPointer)} ref={descriptionEditButtonRef}>
        <MDPreview source={description} isGithubConnected={isGithubConnected} githubRepo={githubRepo} />
      </Button>
    ) : (
      <Button style={ButtonStyle.Default} title={t('common.addDescription')} onClick={handleDescClick} className={styles.descriptionButton}>
        <span className={styles.descriptionButtonText}>{t('action.addDescription')}</span>
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
      <div className={styles.contentModule}>
        <div className={styles.moduleHeader}>
          <Icon type={IconType.BarsStaggered} size={IconSize.Size20} className={styles.moduleIcon} />
          {t('common.description')}
          {canEdit && (
            <Button style={ButtonStyle.Icon} title={description ? t('common.editDescription') : t('common.addDescription')} onClick={handleDescButtonClick}>
              <Icon type={description ? IconType.Pencil : IconType.Plus} size={IconSize.Size10} className={styles.iconAddButton} />
            </Button>
          )}
          {canEdit && unsavedDesc && <span className={styles.localChangesLoaded}>{t('common.unsavedChanges')}</span>}
          <Button style={ButtonStyle.Icon} title={t('common.toggleDescription')} onClick={handleToggleDescShown} className={styles.buttonToggle}>
            <Icon type={descShown ? IconType.Minus : IconType.Plus} size={IconSize.Size10} />
          </Button>
        </div>
        <div className={styles.moduleBody}>
          {descShown && canEdit && descriptionEditNode}
          {descShown && !canEdit && (
            <div className={styles.descriptionText}>
              <MDPreview source={description} isGithubConnected={isGithubConnected} githubRepo={githubRepo} />
            </div>
          )}
        </div>
      </div>
    );

    const tasksNode = (tasks.length > 0 || canEdit) && (
      <div className={styles.contentModule}>
        <div className={styles.moduleHeader}>
          <Icon type={IconType.Check} size={IconSize.Size20} className={styles.moduleIcon} />
          {t('common.tasks')}
          {canEdit && (
            <Button style={ButtonStyle.Icon} title={t('common.addTask')} onClick={handleTaskAddOpen}>
              <Icon type={IconType.Plus} size={IconSize.Size10} className={styles.iconAddButton} />
            </Button>
          )}
          <Button style={ButtonStyle.Icon} title={t('common.toggleTasks')} onClick={handleToggleTasksShown} className={styles.buttonToggle}>
            <Icon type={taskShown ? IconType.Minus : IconType.Plus} size={IconSize.Size10} />
          </Button>
        </div>
        <div className={styles.moduleBody}>
          {taskShown && <Tasks ref={tasksRef} items={tasks} canEdit={canEdit} onCreate={onTaskCreate} onUpdate={onTaskUpdate} onMove={onTaskMove} onDelete={onTaskDelete} />}
        </div>
      </div>
    );

    const attachmentsNode = (
      <div className={styles.contentModule}>
        <div className={styles.moduleHeader}>
          <Icon type={IconType.Attach} size={IconSize.Size20} className={styles.moduleIcon} />
          {t('common.attachments')}
          {canEdit && (
            <AttachmentAdd onCreate={onAttachmentCreate}>
              <Button style={ButtonStyle.Icon} title={t('common.addAttachmentButton')}>
                <Icon type={IconType.Plus} size={IconSize.Size10} className={styles.iconAddButton} />
              </Button>
            </AttachmentAdd>
          )}
          <Button style={ButtonStyle.Icon} title={t('common.toggleAttachments')} onClick={handleToggleAttacShown} className={styles.buttonToggle}>
            <Icon type={attacShown ? IconType.Minus : IconType.Plus} size={IconSize.Size10} />
          </Button>
        </div>
        <div className={styles.moduleBody}>
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
              <AttachmentAdd onCreate={onAttachmentCreate}>
                <Button style={ButtonStyle.Default} title={t('common.addAttachmentButton')} className={styles.addAttachmentButton}>
                  {t('common.addAttachment')} <span className={styles.hint}>{t('common.addAttachmentExtra')}</span>
                </Button>
              </AttachmentAdd>
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
      <div className={classNames(styles.mainContainer, gStyles.scrollableY)}>
        {headerNode}
        <div className={styles.moduleContainer}>
          {membersNode}
          {labelsNode}
          {dueDateNode}
          {timerNode}
          {subscribeNode}
          <hr className={styles.hr} />
        </div>
        <div className={styles.moduleContainer}>
          {descriptionNode}
          <hr className={styles.hr} />
        </div>
        <div className={styles.moduleContainer}>
          {tasksNode}
          <hr className={styles.hr} />
        </div>
        <div className={styles.moduleContainer}>
          {attachmentsNode}
          <hr className={styles.hr} />
        </div>
        <div className={styles.moduleContainer}>
          {activitiesNode}
          <hr className={styles.hr} />
        </div>
      </div>
    );

    return <div className={styles.wrapper}>{canEdit ? <AttachmentAddZone onCreate={onAttachmentCreate}>{contentNode}</AttachmentAddZone> : contentNode}</div>;
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
  onTaskMove: PropTypes.func.isRequired,
  onTaskDelete: PropTypes.func.isRequired,
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
