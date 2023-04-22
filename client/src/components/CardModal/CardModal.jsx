import React, { useMemo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, Grid, Icon, Modal } from 'semantic-ui-react';
import { FilePicker, Markdown } from '../../lib/custom-ui';

import { createTimer, startTimer, stopTimer } from '../../utils/timer';
import NameField from './NameField';
import DescriptionEdit from './DescriptionEdit';
import Tasks from './Tasks';
import Attachments from './Attachments';
import AttachmentAddZone from './AttachmentAddZone';
import AttachmentAddPopup from './AttachmentAddPopup';
import Activities from './Activities';
import User from '../User';
import Label from '../Label';
import DueDate from '../DueDate';
import Timer from '../Timer';
import BoardMembershipsPopup from '../BoardMembershipsPopup';
import LabelsPopup from '../LabelsPopup';
import DueDateEditPopup from '../DueDateEditPopup';
import TimerEditPopup from '../TimerEditPopup';
import CardMovePopup from '../CardMovePopup';
import DeletePopup from '../DeletePopup';
import ListField from './ListField';
import ActionsPopup from '../Card/ActionsPopup';

import styles from './CardModal.module.scss';
import gStyles from '../../globalStyles.module.scss';

const CardModal = React.memo(
  ({
    name,
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
    allProjectsToLists,
    allBoardMemberships,
    allLabels,
    canEdit,
    canEditCommentActivities,
    canEditAllCommentActivities,
    onUpdate,
    onMove,
    onTransfer,
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
    const listField = useRef(null);

    const selectedProject = useMemo(() => allProjectsToLists.find((project) => project.id === projectId) || null, [allProjectsToLists, projectId]);

    const selectedBoard = useMemo(() => (selectedProject && selectedProject.boards.find((board) => board.id === boardId)) || null, [selectedProject, boardId]);

    const selectedList = useMemo(() => (selectedBoard && selectedBoard.lists.find((list) => list.id === listId)) || null, [selectedBoard, listId]);

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

    const handleListFieldClick = useCallback(() => {
      if (canEdit) {
        listField.current.open();
      }
    }, [canEdit]);

    const userIds = users.map((user) => user.id);
    const labelIds = labels.map((label) => label.id);

    const headerNode = (
      <div className={styles.headerWrapper}>
        <div className={styles.headerTitleWrapper}>
          {canEdit ? <NameField defaultValue={name} onUpdate={handleNameUpdate} /> : <div className={styles.headerTitle}>{name}</div>}

          <Button className={classNames(gStyles.iconButtonSolid, styles.headerButton)} onClick={handleClose}>
            <Icon fitted name="close" />
          </Button>
          {/* TODO added here card actions - to edit */}
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
              // onNameEdit={handleNameEdit}
              onUpdate={onUpdate}
              onMove={onMove}
              onTransfer={onTransfer}
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
            >
              <Button className={classNames(gStyles.iconButtonSolid, styles.headerButton)}>
                <Icon fitted name="ellipsis vertical" />
              </Button>
            </ActionsPopup>
          )}
          {/* TODO added here card actions end - to edit */}
          {canEdit && (
            <DeletePopup
              title={t('common.deleteCard', {
                context: 'title',
              })}
              content={t('common.areYouSureYouWantToDeleteThisCard')}
              buttonContent={t('action.deleteCard')}
              onConfirm={onDelete}
            >
              <Button className={classNames(gStyles.iconButtonSolid, styles.headerButton)}>
                <Icon fitted name="trash" />
              </Button>
            </DeletePopup>
          )}
        </div>
        <div className={styles.headerListFieldWrapper}>
          <ListField
            ref={listField}
            projectsToLists={allProjectsToLists}
            defaultPath={{
              projectId,
              boardId,
              listId,
            }}
            onMove={onMove}
            onTransfer={onTransfer}
            onBoardFetch={onBoardFetch}
          >
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div className={canEdit && gStyles.cursorPointer} onClick={handleListFieldClick}>
              <div className={classNames(styles.headerListField)}>{selectedList.name}</div>
              <Icon fitted name="triangle down" className={classNames(styles.headerListField, gStyles.iconButtonSolid)} />
            </div>
          </ListField>
        </div>
      </div>
    );

    const membersNode = (
      <div className={styles.attachments}>
        <div className={styles.text}>
          {t('common.members', {
            context: 'title',
          })}
        </div>
        {users.map((user) => (
          <span key={user.id} className={styles.attachment}>
            {canEdit ? (
              <BoardMembershipsPopup items={allBoardMemberships} currentUserIds={userIds} onUserSelect={onUserAdd} onUserDeselect={onUserRemove}>
                <User name={user.name} avatarUrl={user.avatarUrl} />
              </BoardMembershipsPopup>
            ) : (
              <User name={user.name} avatarUrl={user.avatarUrl} />
            )}
          </span>
        ))}
        {canEdit && (
          <BoardMembershipsPopup items={allBoardMemberships} currentUserIds={userIds} onUserSelect={onUserAdd} onUserDeselect={onUserRemove}>
            <button type="button" className={classNames(styles.attachment, styles.dueDate)}>
              <Icon name="add" size="small" className={styles.addAttachment} />
            </button>
          </BoardMembershipsPopup>
        )}
      </div>
    );

    const labelsNode = (
      <div className={styles.attachments}>
        <div className={styles.text}>
          {t('common.labels', {
            context: 'title',
          })}
        </div>
        {labels.map((label) => (
          <span key={label.id} className={styles.attachment}>
            {canEdit ? (
              <LabelsPopup
                key={label.id}
                items={allLabels}
                currentIds={labelIds}
                onSelect={onLabelAdd}
                onDeselect={onLabelRemove}
                onCreate={onLabelCreate}
                onUpdate={onLabelUpdate}
                onMove={onLabelMove}
                onDelete={onLabelDelete}
              >
                <Label name={label.name} color={label.color} />
              </LabelsPopup>
            ) : (
              <Label name={label.name} color={label.color} />
            )}
          </span>
        ))}
        {canEdit && (
          <LabelsPopup
            items={allLabels}
            currentIds={labelIds}
            onSelect={onLabelAdd}
            onDeselect={onLabelRemove}
            onCreate={onLabelCreate}
            onUpdate={onLabelUpdate}
            onMove={onLabelMove}
            onDelete={onLabelDelete}
          >
            <button type="button" className={classNames(styles.attachment, styles.dueDate)}>
              <Icon name="add" size="small" className={styles.addAttachment} />
            </button>
          </LabelsPopup>
        )}
      </div>
    );

    const dueDateNode = (
      <div className={styles.attachments}>
        <div className={styles.text}>
          {t('common.dueDate', {
            context: 'title',
          })}
        </div>
        <span className={styles.attachment}>
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
      <div className={styles.attachments}>
        <div className={styles.text}>
          {t('common.timer', {
            context: 'title',
          })}
        </div>
        <span className={styles.attachment}>
          {canEdit ? (
            <TimerEditPopup defaultValue={timer} onUpdate={handleTimerUpdate}>
              <Timer startedAt={timer ? timer.startedAt : undefined} total={timer ? timer.total : 0} />
            </TimerEditPopup>
          ) : (
            <Timer startedAt={timer ? timer.startedAt : undefined} total={timer ? timer.total : 0} />
          )}
        </span>
        {canEdit && (
          <button onClick={handleToggleTimerClick} type="button" className={classNames(styles.attachment, styles.dueDate)}>
            <Icon name={timer && timer.startedAt ? 'pause' : 'play'} size="small" className={styles.addAttachment} />
          </button>
        )}
      </div>
    );

    const contentNode = (
      <Grid className={classNames(styles.grid, gStyles.scrollableY)}>
        <Grid.Row className={styles.headerPadding}>
          <Grid.Column width={16} className={styles.headerPadding}>
            {headerNode}
          </Grid.Column>
        </Grid.Row>
        <Grid.Row className={styles.modalPadding}>
          <Grid.Column width={16} className={styles.contentPadding}>
            <div className={styles.moduleWrapper}>
              {membersNode}
              {labelsNode}
              {dueDateNode}
              {timerNode}
              {/* Temp added here subscribe - move to actions */}
              <Button onClick={handleToggleSubscriptionClick}>
                <Icon name="paper plane outline" />
                {isSubscribed ? t('action.unsubscribe') : t('action.subscribe')}
              </Button>
            </div>
            {(description || canEdit) && (
              <div className={styles.contentModule}>
                <Icon name="align justify" className={styles.moduleIcon} />
                <div className={styles.moduleHeader}>{t('common.description')}</div>
                <div className={styles.moduleBody}>
                  {canEdit ? (
                    <DescriptionEdit defaultValue={description} onUpdate={handleDescriptionUpdate}>
                      {description ? (
                        <button type="button" className={classNames(styles.descriptionText, styles.cursorPointer)}>
                          <Markdown linkStopPropagation linkTarget="_blank">
                            {description}
                          </Markdown>
                        </button>
                      ) : (
                        <button type="button" className={styles.descriptionButton}>
                          <span className={styles.descriptionButtonText}>{t('action.addMoreDetailedDescription')}</span>
                        </button>
                      )}
                    </DescriptionEdit>
                  ) : (
                    <div className={styles.descriptionText}>
                      <Markdown linkStopPropagation linkTarget="_blank">
                        {description}
                      </Markdown>
                    </div>
                  )}
                </div>
              </div>
            )}
            {(tasks.length > 0 || canEdit) && (
              <div className={styles.contentModule}>
                <Icon name="check" className={styles.moduleIcon} />
                <div className={styles.moduleHeader}>{t('common.tasks')}</div>
                <div className={styles.moduleBody}>
                  <Tasks items={tasks} canEdit={canEdit} onCreate={onTaskCreate} onUpdate={onTaskUpdate} onMove={onTaskMove} onDelete={onTaskDelete} />
                </div>
              </div>
            )}

            <div className={styles.contentModule}>
              <Icon name="attach" className={styles.moduleIcon} />
              <div className={styles.moduleHeader}>{t('common.attachments')}</div>
              <div className={styles.moduleBody}>
                <Attachments
                  items={attachments}
                  canEdit={canEdit}
                  onUpdate={onAttachmentUpdate}
                  onDelete={onAttachmentDelete}
                  onCoverUpdate={handleCoverUpdate}
                  onGalleryOpen={handleGalleryOpen}
                  onGalleryClose={handleGalleryClose}
                />
                <AttachmentAddPopup onCreate={onAttachmentCreate}>
                  <Button fluid className={styles.actionButton}>
                    <Icon name="attach" className={styles.actionIcon} />
                    {t('common.attachment')}
                  </Button>
                </AttachmentAddPopup>
              </div>
            </div>
            {/* TODO fix activities in other file (style and not in order) */}
            <Activities
              items={activities}
              isFetching={isActivitiesFetching}
              isAllFetched={isAllActivitiesFetched}
              isDetailsVisible={isActivitiesDetailsVisible}
              isDetailsFetching={isActivitiesDetailsFetching}
              canEdit={canEditCommentActivities}
              canEditAllComments={canEditAllCommentActivities}
              onFetch={onActivitiesFetch}
              onDetailsToggle={onActivitiesDetailsToggle}
              onCommentCreate={onCommentActivityCreate}
              onCommentUpdate={onCommentActivityUpdate}
              onCommentDelete={onCommentActivityDelete}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );

    return <div className={styles.wrapper}>{canEdit ? <AttachmentAddZone onCreate={onAttachmentCreate}>{contentNode}</AttachmentAddZone> : contentNode}</div>;
  },
);

CardModal.propTypes = {
  name: PropTypes.string.isRequired,
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
  allProjectsToLists: PropTypes.array.isRequired,
  allBoardMemberships: PropTypes.array.isRequired,
  allLabels: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  canEdit: PropTypes.bool.isRequired,
  canEditCommentActivities: PropTypes.bool.isRequired,
  canEditAllCommentActivities: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onTransfer: PropTypes.func.isRequired,
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
