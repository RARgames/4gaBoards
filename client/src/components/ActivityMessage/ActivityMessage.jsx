import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import truncate from 'lodash/truncate';
import PropTypes from 'prop-types';

import { ActivityTypes, ActivityScopes } from '../../constants/Enums';
import Paths from '../../constants/Paths';
import { formatTimerActivities, getTimerState } from '../../utils/timer';

import * as s from './ActivityMessage.module.scss';

const cardNameTruncateLength = 30;
const commentTruncateLength = 50;
const listNameTruncateLength = 30;
const boardNameTruncateLength = 30;
const projectNameTruncateLength = 30;
const taskNameTruncateLength = 30;
const userNameTruncateLength = 20;
const descriptionTruncateLength = 100;
const defaultTruncateLength = 30;
const isDescriptionTruncated = true;

const ActivityMessage = React.memo(({ activity, isTruncated, hideCardDetails, hideListDetails, hideLabelDetails, hideBoardDetails, hideProjectDetails, onClose }) => {
  const [t] = useTranslation();

  if ([ActivityScopes.CARD, ActivityScopes.TASK, ActivityScopes.ATTACHMENT, ActivityScopes.COMMENT].includes(activity.scope)) {
    let cardName = activity.card?.name || activity.data?.cardName;
    let cardNameTruncated = isTruncated ? truncate(cardName, { length: cardNameTruncateLength }) : cardName;
    const cardNode = activity.card ? (
      <Link to={Paths.CARDS.replace(':id', activity.card.id)} className={s.linked} title={cardName} onClick={onClose} />
    ) : (
      <Link to={Paths.CARDS.replace(':id', activity.cardId)} className={s.linkedDeleted} title={t('activity.deletedCard', { card: cardName })} onClick={onClose} />
    );

    switch (activity.type) {
      case ActivityTypes.CARD_CREATE: {
        const { listName } = activity.data;
        const listNameTruncated = isTruncated ? truncate(listName, { length: listNameTruncateLength }) : listName;

        return (
          <Trans
            i18nKey={hideCardDetails ? 'activity.cardCreateShort' : 'activity.cardCreate'}
            values={{
              card: cardNameTruncated,
              list: listNameTruncated,
            }}
          >
            {cardNode}
            <span className={s.data} title={listName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_DUPLICATE: {
        const { listName } = activity.data;
        const listNameTruncated = isTruncated ? truncate(listName, { length: listNameTruncateLength }) : listName;

        return (
          <Trans
            i18nKey={hideCardDetails ? 'activity.cardDuplicateShort' : 'activity.cardDuplicate'}
            values={{
              card: cardNameTruncated,
              list: listNameTruncated,
            }}
          >
            {cardNode}
            <span className={s.data} title={listName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_UPDATE: {
        if (activity.data.cardPrevName) {
          const { cardPrevName } = activity.data;
          const prevCardNameTruncated = isTruncated ? truncate(cardPrevName, { length: cardNameTruncateLength }) : cardPrevName;
          cardName = activity.data.cardName;
          cardNameTruncated = isTruncated ? truncate(cardName, { length: cardNameTruncateLength }) : cardName;
          return (
            <Trans
              i18nKey={hideCardDetails ? 'activity.cardUpdateNameShort' : 'activity.cardUpdateName'}
              values={{
                prevCard: prevCardNameTruncated,
                card: cardNameTruncated,
              }}
            >
              {cardNode}
              <span className={s.data} title={cardPrevName} />
            </Trans>
          );
        }
        if (activity.data.cardDescription !== undefined) {
          const { cardPrevDescription, cardDescription } = activity.data;
          const prevDescriptionTruncated = isTruncated || isDescriptionTruncated ? truncate(cardPrevDescription, { length: descriptionTruncateLength }) : cardPrevDescription;
          const descriptionTruncated = isTruncated || isDescriptionTruncated ? truncate(cardDescription, { length: descriptionTruncateLength }) : cardDescription;

          let key;
          if (cardPrevDescription !== null && cardDescription !== null) {
            key = hideCardDetails ? 'activity.cardUpdateDescriptionShort' : 'activity.cardUpdateDescription';
          } else if (cardPrevDescription === null && cardDescription !== null) {
            key = hideCardDetails ? 'activity.cardUpdateDescriptionAddShort' : 'activity.cardUpdateDescriptionAdd';
          } else if (cardPrevDescription !== null && cardDescription === null) {
            key = hideCardDetails ? 'activity.cardUpdateDescriptionRemoveShort' : 'activity.cardUpdateDescriptionRemove';
          }

          return (
            <Trans
              i18nKey={key}
              values={{
                card: cardNameTruncated,
                description: descriptionTruncated,
                prevDescription: prevDescriptionTruncated,
              }}
            >
              {cardNode}
              <span className={s.data} title={cardDescription} />
              <span className={s.data} title={cardPrevDescription} />
            </Trans>
          );
        }
        if (activity.data.cardDueDate !== undefined) {
          const { cardPrevDueDate, cardDueDate } = activity.data;
          let key;
          if (cardPrevDueDate !== null && cardDueDate !== null) {
            key = hideCardDetails ? 'activity.cardUpdateDueDateShort' : 'activity.cardUpdateDueDate';
          } else if (cardPrevDueDate === null && cardDueDate !== null) {
            key = hideCardDetails ? 'activity.cardUpdateDueDateAddShort' : 'activity.cardUpdateDueDateAdd';
          } else if (cardPrevDueDate !== null && cardDueDate === null) {
            key = hideCardDetails ? 'activity.cardUpdateDueDateRemoveShort' : 'activity.cardUpdateDueDateRemove';
          }

          return (
            <Trans
              i18nKey={key}
              values={{
                card: cardNameTruncated,
                dueDate: t(`format:date`, { value: cardDueDate, postProcess: 'formatDate' }),
                prevDueDate: t(`format:date`, { value: cardPrevDueDate, postProcess: 'formatDate' }),
              }}
            >
              {cardNode}
              <span className={s.data} title={t('format:dateTime', { postProcess: 'formatDate', value: cardDueDate })} />
              <span className={s.data} title={t('format:dateTime', { postProcess: 'formatDate', value: cardPrevDueDate })} />
            </Trans>
          );
        }
        if (activity.data.cardTimer !== undefined) {
          const { cardPrevTimer, cardTimer } = activity.data;
          const state = getTimerState(cardPrevTimer, cardTimer);
          let key;
          switch (state) {
            case 'start':
              key = hideCardDetails ? 'activity.cardUpdateTimerStartShort' : 'activity.cardUpdateTimerStart';
              break;
            case 'stop':
              key = hideCardDetails ? 'activity.cardUpdateTimerStopShort' : 'activity.cardUpdateTimerStop';
              break;
            case 'edit':
              key = hideCardDetails ? 'activity.cardUpdateTimerEditShort' : 'activity.cardUpdateTimerEdit';
              break;
            case 'add':
              key = hideCardDetails ? 'activity.cardUpdateTimerAddShort' : 'activity.cardUpdateTimerAdd';
              break;
            case 'remove':
              key = hideCardDetails ? 'activity.cardUpdateTimerRemoveShort' : 'activity.cardUpdateTimerRemove';
              break;
            default:
              key = '';
          }

          return (
            <Trans
              i18nKey={key}
              values={{
                card: cardNameTruncated,
                timer: formatTimerActivities({ startedAt: cardTimer?.startedAt, total: cardTimer?.total }),
                prevTimer: formatTimerActivities({ startedAt: cardPrevTimer?.startedAt, total: cardPrevTimer?.total }),
              }}
            >
              {cardNode}
              <span className={s.data} />
              <span className={s.data} />
            </Trans>
          );
        }
        if (activity.data.cardCoverAttachmentName !== undefined) {
          const { cardPrevCoverAttachmentName, cardCoverAttachmentName } = activity.data;
          const cardCoverAttachmentNameTruncated = isTruncated ? truncate(cardCoverAttachmentName, { length: defaultTruncateLength }) : cardCoverAttachmentName;
          const cardPrevCoverAttachmentNameTruncated = isTruncated ? truncate(cardPrevCoverAttachmentName, { length: defaultTruncateLength }) : cardPrevCoverAttachmentName;

          let key;
          if (cardPrevCoverAttachmentName !== null && cardCoverAttachmentName !== null) {
            key = hideCardDetails ? 'activity.cardUpdateCoverAttachmentShort' : 'activity.cardUpdateCoverAttachment';
          } else if (cardPrevCoverAttachmentName === null && cardCoverAttachmentName !== null) {
            key = hideCardDetails ? 'activity.cardUpdateCoverAttachmentAddShort' : 'activity.cardUpdateCoverAttachmentAdd';
          } else if (cardPrevCoverAttachmentName !== null && cardCoverAttachmentName === null) {
            key = hideCardDetails ? 'activity.cardUpdateCoverAttachmentRemoveShort' : 'activity.cardUpdateCoverAttachmentRemove';
          }

          return (
            <Trans
              i18nKey={key}
              values={{
                card: cardNameTruncated,
                coverAttachment: cardCoverAttachmentNameTruncated,
                prevCoverAttachment: cardPrevCoverAttachmentNameTruncated,
              }}
            >
              {cardNode}
              <span className={s.data} title={cardCoverAttachmentName} />
              <span className={s.data} title={cardPrevCoverAttachmentName} />
            </Trans>
          );
        }
        if (activity.data.cardPosition !== undefined) {
          const { listName } = activity.data;
          const listNameTruncated = isTruncated ? truncate(listName, { length: listNameTruncateLength }) : listName;

          return (
            <Trans
              i18nKey={hideCardDetails ? 'activity.cardUpdatePositionShort' : 'activity.cardUpdatePosition'}
              values={{
                card: cardNameTruncated,
                list: listNameTruncated,
              }}
            >
              {cardNode}
              <span className={s.data} title={listName} />
            </Trans>
          );
        }

        return null;
      }

      case ActivityTypes.CARD_MOVE: {
        const { listFromName, listToName } = activity.data;
        const fromListNameTruncated = isTruncated ? truncate(listFromName, { length: listNameTruncateLength }) : listFromName;
        const toListNameTruncated = isTruncated ? truncate(listToName, { length: listNameTruncateLength }) : listToName;

        return (
          <Trans
            i18nKey={hideCardDetails ? 'activity.cardMoveShort' : 'activity.cardMove'}
            values={{
              card: cardNameTruncated,
              fromList: fromListNameTruncated,
              toList: toListNameTruncated,
            }}
          >
            {cardNode}
            <span className={s.data} title={listFromName} />
            <span className={s.data} title={listToName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_TRANSFER: {
        const { listFromName, listToName, boardFromName, boardToName, projectFromName, projectToName } = activity.data;
        const fromListNameTruncated = isTruncated ? truncate(listFromName, { length: listNameTruncateLength }) : listFromName;
        const toListNameTruncated = isTruncated ? truncate(listToName, { length: listNameTruncateLength }) : listToName;
        const fromBoardNameTruncated = isTruncated ? truncate(boardFromName, { length: boardNameTruncateLength }) : boardFromName;
        const toBoardNameTruncated = isTruncated ? truncate(boardToName, { length: boardNameTruncateLength }) : boardToName;
        const fromProjectNameTruncated = isTruncated ? truncate(projectFromName, { length: projectNameTruncateLength }) : projectFromName;
        const toProjectNameTruncated = isTruncated ? truncate(projectToName, { length: projectNameTruncateLength }) : projectToName;

        let key;

        if (activity.data.projectFromId !== activity.data.projectToId) {
          key = hideCardDetails ? 'activity.cardTransferProjectShort' : 'activity.cardTransferProject';
        } else {
          key = hideCardDetails ? 'activity.cardTransferBoardShort' : 'activity.cardTransferBoard';
        }

        return (
          <Trans
            i18nKey={key}
            values={{
              card: cardNameTruncated,
              fromList: fromListNameTruncated,
              fromBoard: fromBoardNameTruncated,
              toList: toListNameTruncated,
              toBoard: toBoardNameTruncated,
              fromProject: fromProjectNameTruncated,
              toProject: toProjectNameTruncated,
            }}
          >
            {cardNode}
            <span className={s.data} title={listFromName} />
            <span className={s.data} title={boardFromName} />
            <span className={s.data} title={listToName} />
            <span className={s.data} title={boardToName} />
            <span className={s.data} title={projectFromName} />
            <span className={s.data} title={projectToName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_DELETE: {
        const { listName } = activity.data;
        const listNameTruncated = isTruncated ? truncate(listName, { length: listNameTruncateLength }) : listName;

        return (
          <Trans
            i18nKey={hideCardDetails ? 'activity.cardDeleteShort' : 'activity.cardDelete'}
            values={{
              card: cardNameTruncated,
              list: listNameTruncated,
            }}
          >
            {cardNode}
            <span className={s.data} title={listName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_COMMENT_CREATE: {
        const { cardComment } = activity.data;
        const cardCommentTruncated = isTruncated ? truncate(cardComment, { length: commentTruncateLength }) : cardComment;

        return (
          <Trans
            i18nKey={hideCardDetails ? 'activity.cardCommentCreateShort' : 'activity.cardCommentCreate'}
            values={{
              comment: cardCommentTruncated,
              card: cardNameTruncated,
            }}
          >
            {cardNode}
            <span className={s.data} title={cardComment} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_COMMENT_UPDATE: {
        const { commentPrevText, commentText, userName } = activity.data;
        const prevCardCommentTruncated = isTruncated ? truncate(commentPrevText, { length: commentTruncateLength }) : commentPrevText;
        const cardCommentTruncated = isTruncated ? truncate(commentText, { length: commentTruncateLength }) : commentText;
        const userNameTruncated = isTruncated ? truncate(userName, { length: userNameTruncateLength }) : userName;

        let key;
        if (activity.userId === activity.data.userId) {
          key = hideCardDetails ? 'activity.cardCommentUpdateOwnShort' : 'activity.cardCommentUpdateOwn';
        } else {
          key = hideCardDetails ? 'activity.cardCommentUpdateShort' : 'activity.cardCommentUpdate';
        }

        return (
          <Trans
            i18nKey={key}
            values={{
              prevComment: prevCardCommentTruncated,
              comment: cardCommentTruncated,
              card: cardNameTruncated,
              user: userNameTruncated,
            }}
          >
            {cardNode}
            <span className={s.data} title={commentPrevText} />
            <span className={s.data} title={commentText} />
            <span className={s.data} title={userName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_COMMENT_DELETE: {
        const { commentText, userName } = activity.data;
        const cardCommentTruncated = isTruncated ? truncate(commentText, { length: commentTruncateLength }) : commentText;
        const userNameTruncated = isTruncated ? truncate(userName, { length: userNameTruncateLength }) : userName;

        return (
          <Trans
            i18nKey={hideCardDetails ? 'activity.cardCommentDeleteShort' : 'activity.cardCommentDelete'}
            values={{
              comment: cardCommentTruncated,
              card: cardNameTruncated,
              user: userNameTruncated,
            }}
          >
            {cardNode}
            <span className={s.data} title={commentText} />
            <span className={s.data} title={userName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_USER_ADD: {
        const { userName } = activity.data;
        const userNameTruncated = isTruncated ? truncate(userName, { length: userNameTruncateLength }) : userName;

        return (
          <Trans
            i18nKey={hideCardDetails ? 'activity.cardUserAddShort' : 'activity.cardUserAdd'}
            values={{
              user: userNameTruncated,
              card: cardNameTruncated,
            }}
          >
            {cardNode}
            <span className={s.data} title={userName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_USER_REMOVE: {
        const { userName } = activity.data;
        const userNameTruncated = isTruncated ? truncate(userName, { length: userNameTruncateLength }) : userName;

        return (
          <Trans
            i18nKey={hideCardDetails ? 'activity.cardUserRemoveShort' : 'activity.cardUserRemove'}
            values={{
              user: userNameTruncated,
              card: cardNameTruncated,
            }}
          >
            {cardNode}
            <span className={s.data} title={userName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_TASK_CREATE: {
        const { taskName } = activity.data;
        const taskNameTruncated = isTruncated ? truncate(taskName, { length: taskNameTruncateLength }) : taskName;

        return (
          <Trans
            i18nKey={hideCardDetails ? 'activity.cardTaskCreateShort' : 'activity.cardTaskCreate'}
            values={{
              task: taskNameTruncated,
              card: cardNameTruncated,
            }}
          >
            {cardNode}
            <span className={s.data} title={taskName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_TASK_UPDATE: {
        const { taskName } = activity.data;
        const taskNameTruncated = isTruncated ? truncate(taskName, { length: taskNameTruncateLength }) : taskName;

        if (activity.data.taskPrevName) {
          const { taskPrevName } = activity.data;
          const taskPrevNameTruncated = isTruncated ? truncate(taskPrevName, { length: taskNameTruncateLength }) : taskPrevName;
          return (
            <Trans
              i18nKey={hideCardDetails ? 'activity.cardTaskUpdateNameShort' : 'activity.cardTaskUpdateName'}
              values={{
                task: taskNameTruncated,
                prevTask: taskPrevNameTruncated,
                card: cardNameTruncated,
              }}
            >
              {cardNode}
              <span className={s.data} title={taskPrevName} />
              <span className={s.data} title={taskName} />
            </Trans>
          );
        }
        if (activity.data.taskIsCompleted !== undefined) {
          return (
            <Trans
              i18nKey={hideCardDetails ? 'activity.cardTaskUpdateIsCompletedShort' : 'activity.cardTaskUpdateIsCompleted'}
              values={{
                task: taskNameTruncated,
                card: cardNameTruncated,
                isCompleted: activity.data.taskIsCompleted ? t('activity.cardTaskCompleted') : t('activity.cardTaskUncompleted'),
              }}
            >
              {cardNode}
              <span className={s.data} title={taskName} />
              <span className={s.data} />
            </Trans>
          );
        }
        if (activity.data.taskDueDate !== undefined) {
          const { taskPrevDueDate, taskDueDate } = activity.data;
          let key;
          if (taskPrevDueDate !== null && taskDueDate !== null) {
            key = hideCardDetails ? 'activity.cardTaskUpdateDueDateShort' : 'activity.cardTaskUpdateDueDate';
          } else if (taskPrevDueDate === null && taskDueDate !== null) {
            key = hideCardDetails ? 'activity.cardTaskUpdateDueDateAddShort' : 'activity.cardTaskUpdateDueDateAdd';
          } else if (taskPrevDueDate !== null && taskDueDate === null) {
            key = hideCardDetails ? 'activity.cardTaskUpdateDueDateRemoveShort' : 'activity.cardTaskUpdateDueDateRemove';
          }

          return (
            <Trans
              i18nKey={key}
              values={{
                task: taskNameTruncated,
                card: cardNameTruncated,
                dueDate: t(`format:date`, { value: taskDueDate, postProcess: 'formatDate' }),
                prevDueDate: t(`format:date`, { value: taskPrevDueDate, postProcess: 'formatDate' }),
              }}
            >
              {cardNode}
              <span className={s.data} title={taskName} />
              <span className={s.data} title={t('format:dateTime', { postProcess: 'formatDate', value: taskDueDate })} />
              <span className={s.data} title={t('format:dateTime', { postProcess: 'formatDate', value: taskPrevDueDate })} />
            </Trans>
          );
        }
        return null;
      }

      case ActivityTypes.CARD_TASK_DUPLICATE: {
        const { taskName } = activity.data;
        const taskNameTruncated = isTruncated ? truncate(taskName, { length: taskNameTruncateLength }) : taskName;

        return (
          <Trans
            i18nKey={hideCardDetails ? 'activity.cardTaskDuplicateShort' : 'activity.cardTaskDuplicate'}
            values={{
              task: taskNameTruncated,
              card: cardNameTruncated,
            }}
          >
            {cardNode}
            <span className={s.data} title={taskName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_TASK_MOVE: {
        const { taskName } = activity.data;
        const taskNameTruncated = isTruncated ? truncate(taskName, { length: taskNameTruncateLength }) : taskName;

        return (
          <Trans
            i18nKey={hideCardDetails ? 'activity.cardTaskMoveShort' : 'activity.cardTaskMove'}
            values={{
              task: taskNameTruncated,
              card: cardNameTruncated,
            }}
          >
            {cardNode}
            <span className={s.data} title={taskName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_TASK_DELETE: {
        const { taskName } = activity.data;
        const taskNameTruncated = isTruncated ? truncate(taskName, { length: taskNameTruncateLength }) : taskName;

        return (
          <Trans
            i18nKey={hideCardDetails ? 'activity.cardTaskDeleteShort' : 'activity.cardTaskDelete'}
            values={{
              task: taskNameTruncated,
              card: cardNameTruncated,
            }}
          >
            {cardNode}
            <span className={s.data} title={taskName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_TASK_USER_ADD: {
        const { userName, taskName } = activity.data;
        const userNameTruncated = isTruncated ? truncate(userName, { length: userNameTruncateLength }) : userName;
        const taskNameTruncated = isTruncated ? truncate(taskName, { length: taskNameTruncateLength }) : taskName;

        return (
          <Trans
            i18nKey={hideCardDetails ? 'activity.cardTaskUserAddShort' : 'activity.cardTaskUserAdd'}
            values={{
              user: userNameTruncated,
              task: taskNameTruncated,
              card: cardNameTruncated,
            }}
          >
            {cardNode}
            <span className={s.data} title={taskName} />
            <span className={s.data} title={userName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_TASK_USER_REMOVE: {
        const { userName, taskName } = activity.data;
        const userNameTruncated = isTruncated ? truncate(userName, { length: userNameTruncateLength }) : userName;
        const taskNameTruncated = isTruncated ? truncate(taskName, { length: taskNameTruncateLength }) : taskName;

        return (
          <Trans
            i18nKey={hideCardDetails ? 'activity.cardTaskUserRemoveShort' : 'activity.cardTaskUserRemove'}
            values={{
              user: userNameTruncated,
              task: taskNameTruncated,
              card: cardNameTruncated,
            }}
          >
            {cardNode}
            <span className={s.data} title={taskName} />
            <span className={s.data} title={userName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_ATTACHMENT_CREATE: {
        const { attachmentName } = activity.data;
        const attachmentNameTruncated = isTruncated ? truncate(attachmentName, { length: commentTruncateLength }) : attachmentName;

        return (
          <Trans
            i18nKey={hideCardDetails ? 'activity.cardAttachmentCreateShort' : 'activity.cardAttachmentCreate'}
            values={{
              attachment: attachmentNameTruncated,
              card: cardNameTruncated,
            }}
          >
            {cardNode}
            <span className={s.data} title={attachmentName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_ATTACHMENT_UPDATE: {
        const { attachmentPrevName, attachmentName } = activity.data;
        const attachmentPrevNameTruncated = isTruncated ? truncate(attachmentPrevName, { length: commentTruncateLength }) : attachmentPrevName;
        const attachmentNameTruncated = isTruncated ? truncate(attachmentName, { length: commentTruncateLength }) : attachmentName;

        return (
          <Trans
            i18nKey={hideCardDetails ? 'activity.cardAttachmentUpdateShort' : 'activity.cardAttachmentUpdate'}
            values={{
              prevAttachment: attachmentPrevNameTruncated,
              attachment: attachmentNameTruncated,
              card: cardNameTruncated,
            }}
          >
            {cardNode}
            <span className={s.data} title={attachmentPrevName} />
            <span className={s.data} title={attachmentName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_ATTACHMENT_DELETE: {
        const { attachmentName } = activity.data;
        const attachmentNameTruncated = isTruncated ? truncate(attachmentName, { length: commentTruncateLength }) : attachmentName;

        return (
          <Trans
            i18nKey={hideCardDetails ? 'activity.cardAttachmentDeleteShort' : 'activity.cardAttachmentDelete'}
            values={{
              attachment: attachmentNameTruncated,
              card: cardNameTruncated,
            }}
          >
            {cardNode}
            <span className={s.data} title={attachmentName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_LABEL_ADD: {
        const { labelName } = activity.data;
        const labelNameTruncated = isTruncated ? truncate(labelName, { length: commentTruncateLength }) : labelName;

        return (
          <Trans
            i18nKey={hideCardDetails ? 'activity.cardLabelAddShort' : 'activity.cardLabelAdd'}
            values={{
              label: labelNameTruncated,
              card: cardNameTruncated,
            }}
          >
            {cardNode}
            <span className={s.data} title={labelName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_LABEL_REMOVE: {
        const { labelName } = activity.data;
        const labelNameTruncated = isTruncated ? truncate(labelName, { length: commentTruncateLength }) : labelName;

        return (
          <Trans
            i18nKey={hideCardDetails ? 'activity.cardLabelRemoveShort' : 'activity.cardLabelRemove'}
            values={{
              label: labelNameTruncated,
              card: cardNameTruncated,
            }}
          >
            {cardNode}
            <span className={s.data} title={labelName} />
          </Trans>
        );
      }

      default: {
        return null;
      }
    }
  } else if (ActivityScopes.LIST === activity.scope) {
    let listName = activity.list?.name || activity.data?.listName;
    let listNameTruncated = isTruncated ? truncate(listName, { length: listNameTruncateLength }) : listName;
    const boardName = activity.board?.name || activity.data?.boardName;
    const boardNameTruncated = isTruncated ? truncate(boardName, { length: boardNameTruncateLength }) : boardName;
    const boardNode = activity.board ? (
      <Link to={Paths.BOARDS.replace(':id', activity.board.id)} className={s.linked} title={boardName} onClick={onClose} />
    ) : (
      <Link to={Paths.BOARDS.replace(':id', activity.boardId)} className={s.linkedDeleted} title={t('activity.deletedBoard', { board: boardName })} onClick={onClose} />
    );

    switch (activity.type) {
      case ActivityTypes.LIST_CREATE: {
        return (
          <Trans
            i18nKey={hideListDetails ? 'activity.listCreateShort' : 'activity.listCreate'}
            values={{
              list: listNameTruncated,
              board: boardNameTruncated,
            }}
          >
            <span className={s.data} title={listName} />
            {boardNode}
          </Trans>
        );
      }

      case ActivityTypes.LIST_UPDATE: {
        if (activity.data.listPrevName) {
          const { listPrevName } = activity.data;
          const prevListNameTruncated = isTruncated ? truncate(listPrevName, { length: listNameTruncateLength }) : listPrevName;
          listName = activity.data.listName;
          listNameTruncated = isTruncated ? truncate(listName, { length: listNameTruncateLength }) : listName;

          return (
            <Trans
              i18nKey={hideListDetails ? 'activity.listUpdateNameShort' : 'activity.listUpdateName'}
              values={{
                prevList: prevListNameTruncated,
                list: listNameTruncated,
              }}
            >
              <span className={s.data} title={listPrevName} />
              <span className={s.data} title={listName} />
            </Trans>
          );
        }
        if (activity.data.listPosition !== undefined) {
          return (
            <Trans
              i18nKey={hideListDetails ? 'activity.listUpdatePositionShort' : 'activity.listUpdatePosition'}
              values={{
                list: listNameTruncated,
                board: boardNameTruncated,
              }}
            >
              <span className={s.data} title={listName} />
              {boardNode}
            </Trans>
          );
        }
        if (activity.data.listIsCollapsed !== undefined) {
          const { listIsCollapsed } = activity.data;
          let key;
          if (listIsCollapsed === true) {
            key = hideListDetails ? 'activity.listCollapseShort' : 'activity.listCollapse';
          } else {
            key = hideListDetails ? 'activity.listExpandShort' : 'activity.listExpand';
          }

          return (
            <Trans
              i18nKey={key}
              values={{
                list: listNameTruncated,
              }}
            >
              <span className={s.data} title={listName} />
            </Trans>
          );
        }

        return null;
      }

      case ActivityTypes.LIST_DELETE: {
        return (
          <Trans
            i18nKey={hideListDetails ? 'activity.listDeleteShort' : 'activity.listDelete'}
            values={{
              list: listNameTruncated,
              board: boardNameTruncated,
            }}
          >
            <span className={s.data} title={listName} />
            {boardNode}
          </Trans>
        );
      }

      default:
        return null;
    }
  } else if (ActivityScopes.BOARD === activity.scope) {
    let boardName = activity.board?.name || activity.data?.boardName;
    let boardNameTruncated = isTruncated ? truncate(boardName, { length: boardNameTruncateLength }) : boardName;
    const boardNode = activity.board ? (
      <Link to={Paths.BOARDS.replace(':id', activity.board.id)} className={s.linked} title={boardName} onClick={onClose} />
    ) : (
      <Link to={Paths.BOARDS.replace(':id', activity.boardId)} className={s.linkedDeleted} title={t('activity.deletedBoard', { board: boardName })} onClick={onClose} />
    );
    const projectName = activity.project?.name || activity.data?.projectName;
    const projectNameTruncated = isTruncated ? truncate(projectName, { length: projectNameTruncateLength }) : projectName;
    const projectNode = activity.project ? (
      <Link to={Paths.PROJECTS.replace(':id', activity.project.id)} className={s.linked} title={projectName} onClick={onClose} />
    ) : (
      <Link to={Paths.PROJECTS.replace(':id', activity.projectId)} className={s.linkedDeleted} title={t('activity.deletedProject', { project: projectName })} onClick={onClose} />
    );

    switch (activity.type) {
      case ActivityTypes.LABEL_CREATE: {
        const { labelName } = activity.data;
        const labelNameTruncated = isTruncated ? truncate(labelName, { length: defaultTruncateLength }) : labelName;

        return (
          <Trans
            i18nKey={hideLabelDetails ? 'activity.labelCreateShort' : 'activity.labelCreate'}
            values={{
              label: labelNameTruncated,
              board: boardNameTruncated,
            }}
          >
            <span className={s.data} title={labelName} />
            {boardNode}
          </Trans>
        );
      }

      case ActivityTypes.LABEL_UPDATE: {
        const { labelName } = activity.data;
        const labelNameTruncated = isTruncated ? truncate(labelName, { length: defaultTruncateLength }) : labelName;

        if (activity.data.labelColor) {
          const labelColorName = activity.data.labelColor;

          return (
            <Trans
              i18nKey={hideLabelDetails ? 'activity.labelUpdateColorShort' : 'activity.labelUpdateColor'}
              values={{
                label: labelNameTruncated,
                color: labelColorName,
                board: boardNameTruncated,
              }}
            >
              <span className={s.data} title={labelName} />
              <span className={s.data} title={labelColorName} />
              {boardNode}
            </Trans>
          );
        }
        if (activity.data.labelPrevName) {
          const { labelPrevName } = activity.data;
          const prevLabelNameTruncated = isTruncated ? truncate(labelPrevName, { length: defaultTruncateLength }) : labelPrevName;

          return (
            <Trans
              i18nKey={hideLabelDetails ? 'activity.labelUpdateNameShort' : 'activity.labelUpdateName'}
              values={{
                prevLabel: prevLabelNameTruncated,
                label: labelNameTruncated,
                board: boardNameTruncated,
              }}
            >
              <span className={s.data} title={labelPrevName} />
              <span className={s.data} title={labelName} />
              {boardNode}
            </Trans>
          );
        }
        return null;
      }

      case ActivityTypes.LABEL_DELETE: {
        const { labelName } = activity.data;
        const labelNameTruncated = isTruncated ? truncate(labelName, { length: defaultTruncateLength }) : labelName;

        return (
          <Trans
            i18nKey={hideLabelDetails ? 'activity.labelDeleteShort' : 'activity.labelDelete'}
            values={{
              label: labelNameTruncated,
              board: boardNameTruncated,
            }}
          >
            <span className={s.data} title={labelName} />
            {boardNode}
          </Trans>
        );
      }

      case ActivityTypes.BOARD_USER_ADD: {
        const { userName } = activity.data;
        const userNameTruncated = isTruncated ? truncate(userName, { length: userNameTruncateLength }) : userName;
        const canComment = activity.data.canComment === null || activity.data.canComment === true ? t('activity.yes') : t('activity.no');

        return (
          <Trans
            i18nKey={hideBoardDetails ? 'activity.boardUserAddShort' : 'activity.boardUserAdd'}
            values={{
              user: userNameTruncated,
              board: boardNameTruncated,
              role: activity.data.role,
              canComment,
            }}
          >
            <span className={s.data} title={userName} />
            {boardNode}
            <span className={s.data} title={activity.data.role} />
            <span className={s.data} title={canComment} />
          </Trans>
        );
      }

      case ActivityTypes.BOARD_USER_UPDATE: {
        const { userName } = activity.data;
        const userNameTruncated = isTruncated ? truncate(userName, { length: userNameTruncateLength }) : userName;
        const canComment = activity.data.canComment === null || activity.data.canComment === true ? t('activity.yes') : t('activity.no');
        const prevCanComment = activity.data.prevCanComment === null || activity.data.prevCanComment === true ? t('activity.yes') : t('activity.no');

        if (activity.data.prevRole) {
          const { prevRole, role } = activity.data;

          return (
            <Trans
              i18nKey={hideBoardDetails ? 'activity.boardUserUpdateRoleShort' : 'activity.boardUserUpdateRole'}
              values={{
                user: userNameTruncated,
                prevRole,
                prevCanComment,
                role,
                canComment,
                board: boardNameTruncated,
              }}
            >
              <span className={s.data} title={userName} />
              <span className={s.data} title={prevRole} />
              <span className={s.data} title={prevCanComment} />
              <span className={s.data} title={role} />
              <span className={s.data} title={canComment} />
              {boardNode}
            </Trans>
          );
        }

        return null;
      }

      case ActivityTypes.BOARD_USER_REMOVE: {
        const { userName } = activity.data;
        const userNameTruncated = isTruncated ? truncate(userName, { length: userNameTruncateLength }) : userName;

        return (
          <Trans
            i18nKey={hideBoardDetails ? 'activity.boardUserRemoveShort' : 'activity.boardUserRemove'}
            values={{
              user: userNameTruncated,
              board: boardNameTruncated,
            }}
          >
            <span className={s.data} title={userName} />
            {boardNode}
          </Trans>
        );
      }

      case ActivityTypes.BOARD_CREATE: {
        const isImportedBoard = activity.data.isImportedBoard === true ? t('activity.yes') : t('activity.no');

        return (
          <Trans
            i18nKey={hideBoardDetails ? 'activity.boardCreateShort' : 'activity.boardCreate'}
            values={{
              board: boardNameTruncated,
              project: projectNameTruncated,
              isImportedBoard,
            }}
          >
            {boardNode}
            <span className={s.data} title={isImportedBoard} />
            {projectNode}
          </Trans>
        );
      }

      case ActivityTypes.BOARD_UPDATE: {
        if (activity.data.boardPrevName) {
          const { boardPrevName } = activity.data;
          const prevBoardNameTruncated = isTruncated ? truncate(boardPrevName, { length: boardNameTruncateLength }) : boardPrevName;
          boardName = activity.data.boardName;
          boardNameTruncated = isTruncated ? truncate(boardName, { length: boardNameTruncateLength }) : boardName;

          return (
            <Trans
              i18nKey={hideBoardDetails ? 'activity.boardUpdateNameShort' : 'activity.boardUpdateName'}
              values={{
                prevBoard: prevBoardNameTruncated,
                board: boardNameTruncated,
              }}
            >
              <span className={s.data} title={boardPrevName} />
              {boardNode}
            </Trans>
          );
        }
        if (activity.data.prevIsGithubConnected !== undefined || activity.data.prevGithubRepo !== undefined) {
          const { prevIsGithubConnected, isGithubConnected, prevGithubRepo, githubRepo } = activity.data;
          let key;
          if (prevIsGithubConnected === false && isGithubConnected === true) {
            key = hideBoardDetails ? 'activity.boardAddedGithubRepoShort' : 'activity.boardAddedGithubRepo';
          } else if (prevIsGithubConnected === true && isGithubConnected === false) {
            key = hideBoardDetails ? 'activity.boardRemovedGithubRepoShort' : 'activity.boardRemovedGithubRepo';
          } else {
            key = hideBoardDetails ? 'activity.boardUpdateGithubRepoShort' : 'activity.boardUpdateGithubRepo';
          }

          return (
            <Trans
              i18nKey={key}
              values={{
                board: boardNameTruncated,
                prevGithubRepo,
                githubRepo,
              }}
            >
              {boardNode}
              <span className={s.data} title={githubRepo} />
              <span className={s.data} title={prevGithubRepo} />
            </Trans>
          );
        }
        if (activity.data.prevPosition !== undefined) {
          return (
            <Trans
              i18nKey={hideBoardDetails ? 'activity.boardUpdatePositionShort' : 'activity.boardUpdatePosition'}
              values={{
                board: boardNameTruncated,
                project: projectNameTruncated,
              }}
            >
              {boardNode}
              {projectNode}
            </Trans>
          );
        }

        return null;
      }

      case ActivityTypes.BOARD_DELETE: {
        return (
          <Trans
            i18nKey={hideBoardDetails ? 'activity.boardDeleteShort' : 'activity.boardDelete'}
            values={{
              board: boardNameTruncated,
              project: projectNameTruncated,
            }}
          >
            {boardNode}
            {projectNode}
          </Trans>
        );
      }

      default:
        return null;
    }
  } else if (ActivityScopes.PROJECT === activity.scope) {
    let projectName = activity.project?.name || activity.data?.projectName;
    let projectNameTruncated = isTruncated ? truncate(projectName, { length: projectNameTruncateLength }) : projectName;
    const projectNode = activity.project ? (
      <Link to={Paths.PROJECTS.replace(':id', activity.project.id)} className={s.linked} title={projectName} onClick={onClose} />
    ) : (
      <Link to={Paths.PROJECTS.replace(':id', activity.projectId)} className={s.linkedDeleted} title={t('activity.deletedProject', { project: projectName })} onClick={onClose} />
    );

    switch (activity.type) {
      case ActivityTypes.PROJECT_CREATE: {
        return (
          <Trans
            i18nKey={hideProjectDetails ? 'activity.projectCreateShort' : 'activity.projectCreate'}
            values={{
              project: projectNameTruncated,
            }}
          >
            {projectNode}
          </Trans>
        );
      }

      case ActivityTypes.PROJECT_UPDATE: {
        if (activity.data.projectPrevName) {
          const { projectPrevName } = activity.data;
          const prevProjectNameTruncated = isTruncated ? truncate(projectPrevName, { length: projectNameTruncateLength }) : projectPrevName;
          projectName = activity.data.projectName;
          projectNameTruncated = isTruncated ? truncate(projectName, { length: projectNameTruncateLength }) : projectName;

          return (
            <Trans
              i18nKey={hideProjectDetails ? 'activity.projectUpdateNameShort' : 'activity.projectUpdateName'}
              values={{
                prevProject: prevProjectNameTruncated,
                project: projectNameTruncated,
              }}
            >
              <span className={s.data} title={projectPrevName} />
              {projectNode}
            </Trans>
          );
        }
        if (
          activity.data.projectPrevBackground !== undefined ||
          activity.data.projectBackground !== undefined ||
          activity.data.projectPrevBackgroundImage !== undefined ||
          activity.data.projectBackgroundImage !== undefined
        ) {
          const { projectPrevBackground, projectBackground, projectPrevBackgroundImage, projectBackgroundImage } = activity.data;
          let key;
          if ((projectPrevBackground === null && projectBackground !== null) || (projectPrevBackgroundImage === null && projectBackgroundImage !== null)) {
            key = hideProjectDetails ? 'activity.projectBackgroundAddShort' : 'activity.projectBackgroundAdd';
          } else if ((projectPrevBackground !== null && projectBackground === null) || (projectPrevBackgroundImage !== null && projectBackgroundImage === null)) {
            key = hideProjectDetails ? 'activity.projectBackgroundRemoveShort' : 'activity.projectBackgroundRemove';
          } else if ((projectPrevBackground !== null && projectBackground !== null) || (projectPrevBackgroundImage !== null && projectBackgroundImage !== null)) {
            key = hideProjectDetails ? 'activity.projectBackgroundUpdateShort' : 'activity.projectBackgroundUpdate';
          }

          return (
            <Trans
              i18nKey={key}
              values={{
                project: projectNameTruncated,
              }}
            >
              {projectNode}
            </Trans>
          );
        }

        return null;
      }

      case ActivityTypes.PROJECT_DELETE: {
        return (
          <Trans
            i18nKey={hideProjectDetails ? 'activity.projectDeleteShort' : 'activity.projectDelete'}
            values={{
              project: projectNameTruncated,
            }}
          >
            {projectNode}
          </Trans>
        );
      }

      case ActivityTypes.PROJECT_MANAGER_ADD: {
        const { userName } = activity.data;
        const userNameTruncated = isTruncated ? truncate(userName, { length: userNameTruncateLength }) : userName;

        return (
          <Trans
            i18nKey={hideProjectDetails ? 'activity.projectManagerAddShort' : 'activity.projectManagerAdd'}
            values={{
              user: userNameTruncated,
              project: projectNameTruncated,
            }}
          >
            <span className={s.data} title={userName} />
            {projectNode}
          </Trans>
        );
      }

      case ActivityTypes.PROJECT_MANAGER_REMOVE: {
        const { userName } = activity.data;
        const userNameTruncated = isTruncated ? truncate(userName, { length: userNameTruncateLength }) : userName;

        return (
          <Trans
            i18nKey={hideProjectDetails ? 'activity.projectManagerRemoveShort' : 'activity.projectManagerRemove'}
            values={{
              user: userNameTruncated,
              project: projectNameTruncated,
            }}
          >
            <span className={s.data} title={userName} />
            {projectNode}
          </Trans>
        );
      }

      default:
        return null;
    }
  } else if (ActivityScopes.USER === activity.scope) {
    const { userName } = activity.data;
    const userNameTruncated = isTruncated ? truncate(userName, { length: userNameTruncateLength }) : userName;

    switch (activity.type) {
      case ActivityTypes.USER_CREATE: {
        return (
          <Trans
            i18nKey="activity.userCreate"
            values={{
              userName: userNameTruncated,
              userEmail: activity.data.userEmail,
              isAdmin: activity.data.isAdmin ? t('activity.yes') : t('activity.no'),
            }}
          >
            <span className={s.data} title={userName} />
            <span className={s.data} title={activity.data.userEmail} />
            <span className={s.data} title={activity.data.isAdmin ? t('activity.yes') : t('activity.no')} />
          </Trans>
        );
      }

      case ActivityTypes.USER_REGISTER: {
        const isLocalRegistration = activity.data.ssoOidcEmail === null && activity.data.ssoGoogleEmail === null && activity.data.ssoGithubEmail === null && activity.data.ssoMicrosoftEmail === null;

        return (
          <Trans
            i18nKey={isLocalRegistration ? 'activity.userRegisterLocal' : 'activity.userRegisterOidc'}
            values={{
              userName: userNameTruncated,
              userEmail: activity.data.userEmail,
              isAdmin: activity.data.isAdmin ? t('activity.yes') : t('activity.no'),
            }}
          >
            <span className={s.data} title={userName} />
            <span className={s.data} title={activity.data.userEmail} />
            <span className={s.data} title={activity.data.isAdmin ? t('activity.yes') : t('activity.no')} />
          </Trans>
        );
      }

      case ActivityTypes.USER_UPDATE: {
        if (activity.data.prevUserName) {
          const { prevUserName } = activity.data;
          const userPrevNameTruncated = isTruncated ? truncate(prevUserName, { length: userNameTruncateLength }) : prevUserName;

          return (
            <Trans
              i18nKey="activity.userUpdateName"
              values={{
                prevUserName: userPrevNameTruncated,
                userName: userNameTruncated,
              }}
            >
              <span className={s.data} title={prevUserName} />
              <span className={s.data} title={userName} />
            </Trans>
          );
        }
        if (activity.data.userUsername) {
          const { prevUserUsername, userUsername } = activity.data;

          return (
            <Trans
              i18nKey="activity.userUpdateUsername"
              values={{
                prevUsername: prevUserUsername || t('activity.none'),
                username: userUsername,
              }}
            >
              <span className={s.data} title={prevUserUsername} />
              <span className={s.data} title={userUsername} />
            </Trans>
          );
        }
        if (activity.data.userEmail) {
          const userPrevEmail = activity.data.prevUserEmail;

          return (
            <Trans
              i18nKey="activity.userUpdateEmail"
              values={{
                userName,
                prevUserEmail: userPrevEmail,
                userEmail: activity.data.userEmail,
              }}
            >
              <span className={s.data} title={userName} />
              <span className={s.data} title={userPrevEmail} />
              <span className={s.data} title={activity.data.userEmail} />
            </Trans>
          );
        }
        if (activity.data.userIsAdmin !== undefined) {
          const { prevUserIsAdmin, userIsAdmin } = activity.data;

          return (
            <Trans
              i18nKey="activity.userUpdateIsAdmin"
              values={{
                userName,
                prevIsAdmin: prevUserIsAdmin ? t('activity.yes') : t('activity.no'),
                isAdmin: userIsAdmin ? t('activity.yes') : t('activity.no'),
              }}
            >
              <span className={s.data} title={userName} />
              <span className={s.data} title={prevUserIsAdmin ? t('activity.yes') : t('activity.no')} />
              <span className={s.data} title={userIsAdmin ? t('activity.yes') : t('activity.no')} />
            </Trans>
          );
        }
        if (activity.data.userAvatar !== undefined) {
          const { prevUserAvatar, userAvatar } = activity.data;

          return (
            <Trans
              i18nKey="activity.userUpdateAvatar"
              values={{
                userName,
                prevUserAvatar: prevUserAvatar ? t('activity.yes') : t('activity.no'),
                userAvatar: userAvatar ? t('activity.yes') : t('activity.no'),
              }}
            >
              <span className={s.data} title={userName} />
              <span className={s.data} title={prevUserAvatar ? t('activity.yes') : t('activity.no')} />
              <span className={s.data} title={userAvatar ? t('activity.yes') : t('activity.no')} />
            </Trans>
          );
        }
        if (activity.data.ssoGoogleEmail !== undefined) {
          const { prevSsoGoogleEmail, ssoGoogleEmail } = activity.data;

          return (
            <Trans
              i18nKey="activity.userUpdateSsoGoogleEmail"
              values={{
                userName,
                prevSsoGoogleEmail: prevSsoGoogleEmail || t('activity.none'),
                ssoGoogleEmail: ssoGoogleEmail || t('activity.none'),
              }}
            >
              <span className={s.data} title={userName} />
              <span className={s.data} title={prevSsoGoogleEmail || t('activity.none')} />
              <span className={s.data} title={ssoGoogleEmail || t('activity.none')} />
            </Trans>
          );
        }
        if (activity.data.ssoGithubEmail !== undefined) {
          const { prevSsoGithubEmail, ssoGithubEmail } = activity.data;

          return (
            <Trans
              i18nKey="activity.userUpdateSsoGithubEmail"
              values={{
                userName,
                prevSsoGithubEmail: prevSsoGithubEmail || t('activity.none'),
                ssoGithubEmail: ssoGithubEmail || t('activity.none'),
              }}
            >
              <span className={s.data} title={userName} />
              <span className={s.data} title={prevSsoGithubEmail || t('activity.none')} />
              <span className={s.data} title={ssoGithubEmail || t('activity.none')} />
            </Trans>
          );
        }
        if (activity.data.ssoMicrosoftEmail !== undefined) {
          const { prevSsoMicrosoftEmail, ssoMicrosoftEmail } = activity.data;

          return (
            <Trans
              i18nKey="activity.userUpdateSsoMicrosoftEmail"
              values={{
                userName,
                prevSsoMicrosoftEmail: prevSsoMicrosoftEmail || t('activity.none'),
                ssoMicrosoftEmail: ssoMicrosoftEmail || t('activity.none'),
              }}
            >
              <span className={s.data} title={userName} />
              <span className={s.data} title={prevSsoMicrosoftEmail || t('activity.none')} />
              <span className={s.data} title={ssoMicrosoftEmail || t('activity.none')} />
            </Trans>
          );
        }
        if (activity.data.ssoOidcEmail !== undefined) {
          const { prevSsoOidcEmail, ssoOidcEmail } = activity.data;

          return (
            <Trans
              i18nKey="activity.userUpdateSsoOidcEmail"
              values={{
                userName,
                prevSsoOidcEmail: prevSsoOidcEmail || t('activity.none'),
                ssoOidcEmail: ssoOidcEmail || t('activity.none'),
              }}
            >
              <span className={s.data} title={userName} />
              <span className={s.data} title={prevSsoOidcEmail || t('activity.none')} />
              <span className={s.data} title={ssoOidcEmail || t('activity.none')} />
            </Trans>
          );
        }
        if (activity.data.passwordChanged !== undefined) {
          return (
            <Trans
              i18nKey="activity.userUpdatePasswordChanged"
              values={{
                userName,
              }}
            >
              <span className={s.data} title={userName} />
            </Trans>
          );
        }

        return null;
      }

      case ActivityTypes.USER_DELETE: {
        return (
          <Trans
            i18nKey="activity.userDelete"
            values={{
              user: userName,
              userEmail: activity.data.userEmail,
            }}
          >
            <span className={s.data} title={userName} />
            <span className={s.data} title={activity.data.userEmail} />
          </Trans>
        );
      }

      default:
        return null;
    }
  } else if (ActivityScopes.INSTANCE === activity.scope && ActivityTypes.INSTANCE_UPDATE === activity.type) {
    const data = activity.data || {};

    const settings = Object.entries(data)
      .filter(([key, value]) => value !== undefined && !key.startsWith('prev'))
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(', ');

    return (
      <Trans
        i18nKey="activity.instanceUpdateSettings"
        values={{
          settings,
        }}
      >
        <span className={s.data} />
      </Trans>
    );
  }
  return null;
});

ActivityMessage.propTypes = {
  activity: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isTruncated: PropTypes.bool,
  hideCardDetails: PropTypes.bool,
  hideListDetails: PropTypes.bool,
  hideLabelDetails: PropTypes.bool,
  hideBoardDetails: PropTypes.bool,
  hideProjectDetails: PropTypes.bool,
  onClose: PropTypes.func,
};

ActivityMessage.defaultProps = {
  isTruncated: false,
  hideCardDetails: false,
  hideListDetails: false,
  hideLabelDetails: false,
  hideBoardDetails: false,
  hideProjectDetails: false,
  onClose: () => {},
};

export default ActivityMessage;
