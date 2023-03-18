import React, { useMemo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, Grid, Icon } from 'semantic-ui-react';
import { Markdown } from '../../lib/custom-ui';

import { startTimer, stopTimer } from '../../utils/timer';
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

    const contentNode = (
      <Grid className={styles.grid}>
        <Grid.Row className={styles.headerPadding}>
          <Grid.Column width={14} className={styles.headerPadding}>
            <div className={styles.headerWrapper}>
              <div className={styles.headerTitleWrapper}>{canEdit ? <NameField defaultValue={name} onUpdate={handleNameUpdate} /> : <div className={styles.headerTitle}>{name}</div>}</div>
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
                  <div className={classNames(styles.headerListField, canEdit && gStyles.cursorPointer)} onClick={handleListFieldClick}>
                    <Icon fitted name="triangle down" /> {selectedList.name}
                  </div>
                </ListField>
              </div>
            </div>
          </Grid.Column>
          <Grid.Column>
            <Button style={{ marginTop: '10px' }} icon="close" onClick={handleClose} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row className={styles.modalPadding}>
          <Grid.Column width={canEdit ? 12 : 16} className={styles.contentPadding}>
            {(users.length > 0 || labels.length > 0 || dueDate || timer) && (
              <div className={styles.moduleWrapper}>
                {users.length > 0 && (
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
                )}
                {labels.length > 0 && (
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
                )}
                {dueDate && (
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
                )}
                {timer && (
                  <div className={styles.attachments}>
                    <div className={styles.text}>
                      {t('common.timer', {
                        context: 'title',
                      })}
                    </div>
                    <span className={styles.attachment}>
                      {canEdit ? (
                        <TimerEditPopup defaultValue={timer} onUpdate={handleTimerUpdate}>
                          <Timer startedAt={timer.startedAt} total={timer.total} />
                        </TimerEditPopup>
                      ) : (
                        <Timer startedAt={timer.startedAt} total={timer.total} />
                      )}
                    </span>
                    {canEdit && (
                      <button onClick={handleToggleTimerClick} type="button" className={classNames(styles.attachment, styles.dueDate)}>
                        <Icon name={timer.startedAt ? 'pause' : 'play'} size="small" className={styles.addAttachment} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            {(description || canEdit) && (
              <div className={styles.contentModule}>
                <div className={styles.moduleWrapper}>
                  <Icon name="align justify" className={styles.moduleIcon} />
                  <div className={styles.moduleHeader}>{t('common.description')}</div>
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
                <div className={styles.moduleWrapper}>
                  <Icon name="check square outline" className={styles.moduleIcon} />
                  <div className={styles.moduleHeader}>{t('common.tasks')}</div>
                  <Tasks items={tasks} canEdit={canEdit} onCreate={onTaskCreate} onUpdate={onTaskUpdate} onMove={onTaskMove} onDelete={onTaskDelete} />
                </div>
              </div>
            )}
            {attachments.length > 0 && (
              <div className={styles.contentModule}>
                <div className={styles.moduleWrapper}>
                  <Icon name="attach" className={styles.moduleIcon} />
                  <div className={styles.moduleHeader}>{t('common.attachments')}</div>
                  <Attachments
                    items={attachments}
                    canEdit={canEdit}
                    onUpdate={onAttachmentUpdate}
                    onDelete={onAttachmentDelete}
                    onCoverUpdate={handleCoverUpdate}
                    onGalleryOpen={handleGalleryOpen}
                    onGalleryClose={handleGalleryClose}
                  />
                </div>
              </div>
            )}
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
          {canEdit && (
            <Grid.Column width={4} className={styles.sidebarPadding}>
              <div className={styles.actions}>
                <span className={styles.actionsTitle}>{t('action.addToCard')}</span>
                <BoardMembershipsPopup items={allBoardMemberships} currentUserIds={userIds} onUserSelect={onUserAdd} onUserDeselect={onUserRemove}>
                  <Button fluid className={styles.actionButton}>
                    <Icon name="user outline" className={styles.actionIcon} />
                    {t('common.members')}
                  </Button>
                </BoardMembershipsPopup>
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
                  <Button fluid className={styles.actionButton}>
                    <Icon name="bookmark outline" className={styles.actionIcon} />
                    {t('common.labels')}
                  </Button>
                </LabelsPopup>
                <DueDateEditPopup defaultValue={dueDate} onUpdate={handleDueDateUpdate}>
                  <Button fluid className={styles.actionButton}>
                    <Icon name="calendar check outline" className={styles.actionIcon} />
                    {t('common.dueDate', {
                      context: 'title',
                    })}
                  </Button>
                </DueDateEditPopup>
                <TimerEditPopup defaultValue={timer} onUpdate={handleTimerUpdate}>
                  <Button fluid className={styles.actionButton}>
                    <Icon name="clock outline" className={styles.actionIcon} />
                    {t('common.timer')}
                  </Button>
                </TimerEditPopup>
                <AttachmentAddPopup onCreate={onAttachmentCreate}>
                  <Button fluid className={styles.actionButton}>
                    <Icon name="attach" className={styles.actionIcon} />
                    {t('common.attachment')}
                  </Button>
                </AttachmentAddPopup>
              </div>
              <div className={styles.actions}>
                <span className={styles.actionsTitle}>{t('common.actions')}</span>
                <Button fluid className={styles.actionButton} onClick={handleToggleSubscriptionClick}>
                  <Icon name="paper plane outline" className={styles.actionIcon} />
                  {isSubscribed ? t('action.unsubscribe') : t('action.subscribe')}
                </Button>
                <CardMovePopup
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
                  <Button fluid className={styles.actionButton} onClick={handleToggleSubscriptionClick}>
                    <Icon name="share square outline" className={styles.actionIcon} />
                    {t('action.move')}
                  </Button>
                </CardMovePopup>
                <DeletePopup
                  title={t('common.deleteCard', {
                    context: 'title',
                  })}
                  content={t('common.areYouSureYouWantToDeleteThisCard')}
                  buttonContent={t('action.deleteCard')}
                  onConfirm={onDelete}
                >
                  <Button fluid className={styles.actionButton}>
                    <Icon name="trash alternate outline" className={styles.actionIcon} />
                    {t('action.delete')}
                  </Button>
                </DeletePopup>
              </div>
            </Grid.Column>
          )}
        </Grid.Row>
      </Grid>
    );

    return canEdit ? <AttachmentAddZone onCreate={onAttachmentCreate}>{contentNode}</AttachmentAddZone> : contentNode;
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
