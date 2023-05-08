import React, { useMemo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, Grid, Icon, Modal } from 'semantic-ui-react';
import { FilePicker, Markdown, Dropdown } from '../../lib/custom-ui';

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
    const nameField = useRef(null);
    const dropdown = useRef(null);

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

    const handleNameEdit = useCallback(() => {
      nameField.current.open();
    }, []);

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

    const userIds = users.map((user) => user.id);
    const labelIds = labels.map((label) => label.id);

    // eslint-disable-next-line no-param-reassign
    // canEdit = false;

    const headerNode = (
      <div className={styles.header}>
        {canEdit ? <NameField defaultValue={name} onUpdate={handleNameUpdate} ref={nameField} /> : <div className={styles.headerTitle}>{name}</div>}

        <Button className={classNames(gStyles.iconButtonSolid, styles.headerButton)} onClick={handleClose}>
          <Icon fitted name="close" />
        </Button>
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
            onChange={onMove}
            submitOnBlur
          >
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div className={classNames(canEdit && gStyles.cursorPointer)} onClick={handleDropdownClick}>
              <div className={classNames(styles.headerListField)}>{selectedList.name}</div>
              <Icon fitted name="triangle down" className={classNames(styles.headerListFieldIcon, gStyles.iconButtonSolid)} />
            </div>
          </Dropdown>
        </div>
      </div>
    );

    const labelsNode = (
      <div className={styles.moduleContainer}>
        <div className={styles.attachments}>
          <div className={styles.text}>
            {t('common.labels', {
              context: 'title',
            })}
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
                <Button className={gStyles.iconButtonSolid}>
                  <Icon fitted size="small" name="add" />
                </Button>
              </LabelsPopup>
            )}
          </div>
          {labels.map((label) => (
            <span key={label.id} className={styles.attachment}>
              <Label name={label.name} color={label.color} size="small" />
            </span>
          ))}
        </div>
      </div>
    );

    const membersNode = (
      <div className={styles.attachments}>
        <div className={styles.text}>
          {t('common.members', {
            context: 'title',
          })}
          {canEdit && (
            <BoardMembershipsPopup items={allBoardMemberships} currentUserIds={userIds} onUserSelect={onUserAdd} onUserDeselect={onUserRemove}>
              <Button className={gStyles.iconButtonSolid}>
                <Icon fitted size="small" name="add" />
              </Button>
            </BoardMembershipsPopup>
          )}
        </div>
        {users.map((user) => (
          <span key={user.id} className={styles.attachment}>
            <User name={user.name} avatarUrl={user.avatarUrl} size="small" />
          </span>
        ))}
      </div>
    );

    const dueDateNode = (
      <div className={styles.attachments}>
        <div className={styles.text}>
          {t('common.dueDate', {
            context: 'title',
          })}
          {canEdit && (
            <DueDateEditPopup defaultValue={dueDate} onUpdate={handleDueDateUpdate}>
              <Button className={gStyles.iconButtonSolid}>{dueDate ? <Icon fitted size="small" name="pencil" /> : <Icon fitted size="small" name="add" />}</Button>
            </DueDateEditPopup>
          )}
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
          {canEdit && (
            <TimerEditPopup defaultValue={timer} onUpdate={handleTimerUpdate}>
              <Button className={gStyles.iconButtonSolid}>
                <Icon fitted size="small" name="pencil" />
              </Button>
            </TimerEditPopup>
          )}
        </div>
        <span className={styles.attachment}>
          <Timer startedAt={timer ? timer.startedAt : undefined} total={timer ? timer.total : 0} variant="cardModal" onClick={canEdit ? handleToggleTimerClick : undefined} />
        </span>
      </div>
    );

    const contentNode = (
      <div className={styles.mainContainer}>
        {headerNode}
        {labelsNode}
        <div className={styles.moduleContainer}>
          {membersNode}
          {dueDateNode}
          {timerNode}
        </div>
      </div>
    );

    // const contentNode0 = (
    //   <Grid className={classNames(styles.grid, gStyles.scrollableY)}>
    //     <Grid.Row className={styles.headerPadding}>
    //       <Grid.Column width={16} className={styles.headerPadding}>
    //         {headerNode}
    //       </Grid.Column>
    //     </Grid.Row>
    //     <Grid.Row className={styles.modalPadding}>
    //       <Grid.Column width={16} className={styles.contentPadding}>
    //         <div className={styles.moduleWrapper}>
    //           {membersNode}
    //           {labelsNode}
    //           {dueDateNode}
    //           {timerNode}
    //           {/* Temp added here subscribe - move to actions */}
    //           <Button onClick={handleToggleSubscriptionClick}>
    //             <Icon name="paper plane outline" />
    //             {isSubscribed ? t('action.unsubscribe') : t('action.subscribe')}
    //           </Button>
    //         </div>
    //         {(description || canEdit) && (
    //           <div className={styles.contentModule}>
    //             <Icon name="align justify" className={styles.moduleIcon} />
    //             <div className={styles.moduleHeader}>{t('common.description')}</div>
    //             <div className={styles.moduleBody}>
    //               {canEdit ? (
    //                 <DescriptionEdit defaultValue={description} onUpdate={handleDescriptionUpdate}>
    //                   {description ? (
    //                     <button type="button" className={classNames(styles.descriptionText, styles.cursorPointer)}>
    //                       <Markdown linkStopPropagation linkTarget="_blank">
    //                         {description}
    //                       </Markdown>
    //                     </button>
    //                   ) : (
    //                     <button type="button" className={styles.descriptionButton}>
    //                       <span className={styles.descriptionButtonText}>{t('action.addMoreDetailedDescription')}</span>
    //                     </button>
    //                   )}
    //                 </DescriptionEdit>
    //               ) : (
    //                 <div className={styles.descriptionText}>
    //                   <Markdown linkStopPropagation linkTarget="_blank">
    //                     {description}
    //                   </Markdown>
    //                 </div>
    //               )}
    //             </div>
    //           </div>
    //         )}
    //         {(tasks.length > 0 || canEdit) && (
    //           <div className={styles.contentModule}>
    //             <Icon name="check" className={styles.moduleIcon} />
    //             <div className={styles.moduleHeader}>{t('common.tasks')}</div>
    //             <div className={styles.moduleBody}>
    //               <Tasks items={tasks} canEdit={canEdit} onCreate={onTaskCreate} onUpdate={onTaskUpdate} onMove={onTaskMove} onDelete={onTaskDelete} />
    //             </div>
    //           </div>
    //         )}

    //         <div className={styles.contentModule}>
    //           <Icon name="attach" className={styles.moduleIcon} />
    //           <div className={styles.moduleHeader}>{t('common.attachments')}</div>
    //           <div className={styles.moduleBody}>
    //             <Attachments
    //               items={attachments}
    //               canEdit={canEdit}
    //               onUpdate={onAttachmentUpdate}
    //               onDelete={onAttachmentDelete}
    //               onCoverUpdate={handleCoverUpdate}
    //               onGalleryOpen={handleGalleryOpen}
    //               onGalleryClose={handleGalleryClose}
    //             />
    //             <AttachmentAddPopup onCreate={onAttachmentCreate}>
    //               <Button fluid className={styles.actionButton}>
    //                 <Icon name="attach" className={styles.actionIcon} />
    //                 {t('common.attachment')}
    //               </Button>
    //             </AttachmentAddPopup>
    //           </div>
    //         </div>
    //         {/* TODO fix activities in other file (style and not in order) */}
    //         <Activities
    //           items={activities}
    //           isFetching={isActivitiesFetching}
    //           isAllFetched={isAllActivitiesFetched}
    //           isDetailsVisible={isActivitiesDetailsVisible}
    //           isDetailsFetching={isActivitiesDetailsFetching}
    //           canEdit={canEditCommentActivities}
    //           canEditAllComments={canEditAllCommentActivities}
    //           onFetch={onActivitiesFetch}
    //           onDetailsToggle={onActivitiesDetailsToggle}
    //           onCommentCreate={onCommentActivityCreate}
    //           onCommentUpdate={onCommentActivityUpdate}
    //           onCommentDelete={onCommentActivityDelete}
    //         />
    //       </Grid.Column>
    //     </Grid.Row>
    //   </Grid>
    // );

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
