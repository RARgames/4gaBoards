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

const ActivityMessage = React.memo(({ activity, card, isTruncated, isCardLinked, onClose }) => {
  const [t] = useTranslation();

  if (activity.scope === ActivityScopes.CARD) {
    const cardName = isTruncated ? truncate(card?.name || activity.data?.cardName, { length: cardNameTruncateLength }) : card?.name || activity.data?.cardName;
    const cardNode = card ? (
      <Link to={Paths.CARDS.replace(':id', card?.id)} className={s.linked} title={cardName} onClick={onClose} />
    ) : (
      <span className={s.linkedDeleted} title={t('activity.deletedCard', { card: cardName })} />
    );

    switch (activity.type) {
      case ActivityTypes.CARD_CREATE: {
        const listName = isTruncated ? truncate(activity.data.listName, { length: listNameTruncateLength }) : activity.data.listName;

        return (
          <Trans
            i18nKey={isCardLinked ? 'activity.cardCreate' : 'activity.cardCreateShort'}
            values={{
              card: cardName,
              list: listName,
            }}
          >
            {cardNode}
            <span className={s.data} title={listName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_DUPLICATE: {
        const listName = isTruncated ? truncate(activity.data.listName, { length: listNameTruncateLength }) : activity.data.listName;

        return (
          <Trans
            i18nKey={isCardLinked ? 'activity.cardDuplicate' : 'activity.cardDuplicateShort'}
            values={{
              card: cardName,
              list: listName,
            }}
          >
            {cardNode}
            <span className={s.data} title={listName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_UPDATE: {
        if (activity.data.cardPrevName) {
          const prevCardName = isTruncated ? truncate(activity.data.cardPrevName, { length: cardNameTruncateLength }) : activity.data.cardPrevName;
          return (
            <Trans
              i18nKey={isCardLinked ? 'activity.cardUpdateName' : 'activity.cardUpdateNameShort'}
              values={{
                prevCard: prevCardName,
                card: cardName,
              }}
            >
              {isCardLinked ? cardNode : <span className={s.data} title={cardName} />}
              <span className={s.data} title={prevCardName} />
            </Trans>
          );
        }
        if (activity.data.cardDescription !== undefined) {
          const { cardPrevDescription, cardDescription } = activity.data;
          const prevDescriptionTruncated = isTruncated || isDescriptionTruncated ? truncate(cardPrevDescription, { length: descriptionTruncateLength }) : cardPrevDescription;
          const descriptionTruncated = isTruncated || isDescriptionTruncated ? truncate(cardDescription, { length: descriptionTruncateLength }) : cardDescription;

          let key;
          if (cardPrevDescription !== null && cardDescription !== null) {
            key = isCardLinked ? 'activity.cardUpdateDescription' : 'activity.cardUpdateDescriptionShort';
          } else if (cardPrevDescription === null && cardDescription !== null) {
            key = isCardLinked ? 'activity.cardUpdateDescriptionAdd' : 'activity.cardUpdateDescriptionAddShort';
          } else if (cardPrevDescription !== null && cardDescription === null) {
            key = isCardLinked ? 'activity.cardUpdateDescriptionRemove' : 'activity.cardUpdateDescriptionRemoveShort';
          }

          return (
            <Trans
              i18nKey={key}
              values={{
                card: cardName,
                description: descriptionTruncated,
                prevDescription: prevDescriptionTruncated,
              }}
            >
              {cardNode}
              <span className={s.data} title={descriptionTruncated} />
              <span className={s.data} title={prevDescriptionTruncated} />
            </Trans>
          );
        }
        if (activity.data.cardDueDate !== undefined) {
          const { cardPrevDueDate, cardDueDate } = activity.data;
          let key;
          if (cardPrevDueDate !== null && cardDueDate !== null) {
            key = isCardLinked ? 'activity.cardUpdateDueDate' : 'activity.cardUpdateDueDateShort';
          } else if (cardPrevDueDate === null && cardDueDate !== null) {
            key = isCardLinked ? 'activity.cardUpdateDueDateAdd' : 'activity.cardUpdateDueDateAddShort';
          } else if (cardPrevDueDate !== null && cardDueDate === null) {
            key = isCardLinked ? 'activity.cardUpdateDueDateRemove' : 'activity.cardUpdateDueDateRemoveShort';
          }

          return (
            <Trans
              i18nKey={key}
              values={{
                card: cardName,
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
              key = isCardLinked ? 'activity.cardUpdateTimerStart' : 'activity.cardUpdateTimerStartShort';
              break;
            case 'stop':
              key = isCardLinked ? 'activity.cardUpdateTimerStop' : 'activity.cardUpdateTimerStopShort';
              break;
            case 'edit':
              key = isCardLinked ? 'activity.cardUpdateTimerEdit' : 'activity.cardUpdateTimerEditShort';
              break;
            case 'add':
              key = isCardLinked ? 'activity.cardUpdateTimerAdd' : 'activity.cardUpdateTimerAddShort';
              break;
            case 'remove':
              key = isCardLinked ? 'activity.cardUpdateTimerRemove' : 'activity.cardUpdateTimerRemoveShort';
              break;
            default:
              key = '';
          }

          return (
            <Trans
              i18nKey={key}
              values={{
                card: cardName,
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
            key = isCardLinked ? 'activity.cardUpdateCoverAttachment' : 'activity.cardUpdateCoverAttachmentShort';
          } else if (cardPrevCoverAttachmentName === null && cardCoverAttachmentName !== null) {
            key = isCardLinked ? 'activity.cardUpdateCoverAttachmentAdd' : 'activity.cardUpdateCoverAttachmentAddShort';
          } else if (cardPrevCoverAttachmentName !== null && cardCoverAttachmentName === null) {
            key = isCardLinked ? 'activity.cardUpdateCoverAttachmentRemove' : 'activity.cardUpdateCoverAttachmentRemoveShort';
          }

          return (
            <Trans
              i18nKey={key}
              values={{
                card: cardName,
                coverAttachment: cardCoverAttachmentNameTruncated,
                prevCoverAttachment: cardPrevCoverAttachmentNameTruncated,
              }}
            >
              {cardNode}
              <span className={s.data} title={cardCoverAttachmentNameTruncated} />
              <span className={s.data} title={cardPrevCoverAttachmentNameTruncated} />
            </Trans>
          );
        }
        if (activity.data.cardPosition !== undefined) {
          const listName = isTruncated ? truncate(activity.data.listName, { length: listNameTruncateLength }) : activity.data.listName;

          return (
            <Trans
              i18nKey={isCardLinked ? 'activity.cardUpdatePosition' : 'activity.cardUpdatePositionShort'}
              values={{
                card: cardName,
                list: listName,
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
        const fromListName = isTruncated ? truncate(activity.data.listFromName, { length: listNameTruncateLength }) : activity.data.listFromName;
        const toListName = isTruncated ? truncate(activity.data.listToName, { length: listNameTruncateLength }) : activity.data.listToName;

        return (
          <Trans
            i18nKey={isCardLinked ? 'activity.cardMove' : 'activity.cardMoveShort'}
            values={{
              card: cardName,
              fromList: fromListName,
              toList: toListName,
            }}
          >
            {cardNode}
            <span className={s.data} title={fromListName} />
            <span className={s.data} title={toListName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_TRANSFER: {
        const fromListName = isTruncated ? truncate(activity.data.listFromName, { length: listNameTruncateLength }) : activity.data.listFromName;
        const toListName = isTruncated ? truncate(activity.data.listToName, { length: listNameTruncateLength }) : activity.data.listToName;
        const fromBoardName = isTruncated ? truncate(activity.data.boardFromName, { length: boardNameTruncateLength }) : activity.data.boardFromName;
        const toBoardName = isTruncated ? truncate(activity.data.boardToName, { length: boardNameTruncateLength }) : activity.data.boardToName;
        const fromProjectName = isTruncated ? truncate(activity.data.projectFromName, { length: projectNameTruncateLength }) : activity.data.projectFromName;
        const toProjectName = isTruncated ? truncate(activity.data.projectToName, { length: projectNameTruncateLength }) : activity.data.projectToName;

        let key;

        if (activity.data.projectFromId !== activity.data.projectToId) {
          key = isCardLinked ? 'activity.cardTransferProject' : 'activity.cardTransferProjectShort';
        } else {
          key = isCardLinked ? 'activity.cardTransferBoard' : 'activity.cardTransferBoardShort';
        }

        return (
          <Trans
            i18nKey={key}
            values={{
              card: cardName,
              fromList: fromListName,
              fromBoard: fromBoardName,
              toList: toListName,
              toBoard: toBoardName,
              fromProject: fromProjectName,
              toProject: toProjectName,
            }}
          >
            {cardNode}
            <span className={s.data} title={fromListName} />
            <span className={s.data} title={fromBoardName} />
            <span className={s.data} title={toListName} />
            <span className={s.data} title={toBoardName} />
            <span className={s.data} title={fromProjectName} />
            <span className={s.data} title={toProjectName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_DELETE: {
        const listName = isTruncated ? truncate(activity.data.listName, { length: listNameTruncateLength }) : activity.data.listName;

        return (
          <Trans
            i18nKey={isCardLinked ? 'activity.cardDelete' : 'activity.cardDeleteShort'}
            values={{
              card: cardName,
              list: listName,
            }}
          >
            {cardNode}
            <span className={s.data} title={listName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_COMMENT_CREATE: {
        const cardComment = isTruncated ? truncate(activity.data.commentActionText, { length: commentTruncateLength }) : activity.data.commentActionText;

        return (
          <Trans
            i18nKey={isCardLinked ? 'activity.cardCommentCreate' : 'activity.cardCommentCreateShort'}
            values={{
              comment: cardComment,
              card: cardName,
            }}
          >
            {cardNode}
            <span className={s.data} title={cardComment} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_COMMENT_UPDATE: {
        const prevCardComment = isTruncated ? truncate(activity.data.commentActionPrevText, { length: commentTruncateLength }) : activity.data.commentActionPrevText;
        const cardComment = isTruncated ? truncate(activity.data.commentActionText, { length: commentTruncateLength }) : activity.data.commentActionText;
        const userName = isTruncated ? truncate(activity.data.userName, { length: userNameTruncateLength }) : activity.data.userName;

        let key;
        if (activity.userId === activity.data.userId) {
          key = isCardLinked ? 'activity.cardCommentUpdateOwn' : 'activity.cardCommentUpdateOwnShort';
        } else {
          key = isCardLinked ? 'activity.cardCommentUpdate' : 'activity.cardCommentUpdateShort';
        }

        return (
          <Trans
            i18nKey={key}
            values={{
              prevComment: prevCardComment,
              comment: cardComment,
              card: cardName,
              user: userName,
            }}
          >
            {cardNode}
            <span className={s.data} title={prevCardComment} />
            <span className={s.data} title={cardComment} />
            <span className={s.data} title={userName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_COMMENT_DELETE: {
        const cardComment = isTruncated ? truncate(activity.data.commentActionText, { length: commentTruncateLength }) : activity.data.commentActionText;
        const userName = isTruncated ? truncate(activity.data.userName, { length: userNameTruncateLength }) : activity.data.userName;

        return (
          <Trans
            i18nKey={isCardLinked ? 'activity.cardCommentDelete' : 'activity.cardCommentDeleteShort'}
            values={{
              comment: cardComment,
              card: cardName,
              user: userName,
            }}
          >
            {cardNode}
            <span className={s.data} title={cardComment} />
            <span className={s.data} title={userName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_USER_ADD: {
        const userName = isTruncated ? truncate(activity.data.userName, { length: userNameTruncateLength }) : activity.data.userName;

        return (
          <Trans
            i18nKey={isCardLinked ? 'activity.cardUserAdd' : 'activity.cardUserAddShort'}
            values={{
              user: userName,
              card: cardName,
            }}
          >
            {cardNode}
            <span className={s.data} title={userName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_USER_REMOVE: {
        const userName = isTruncated ? truncate(activity.data.userName, { length: userNameTruncateLength }) : activity.data.userName;

        return (
          <Trans
            i18nKey={isCardLinked ? 'activity.cardUserRemove' : 'activity.cardUserRemoveShort'}
            values={{
              user: userName,
              card: cardName,
            }}
          >
            {cardNode}
            <span className={s.data} title={userName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_TASK_CREATE: {
        const taskName = isTruncated ? truncate(activity.data.taskName, { length: taskNameTruncateLength }) : activity.data.taskName;

        return (
          <Trans
            i18nKey={isCardLinked ? 'activity.cardTaskCreate' : 'activity.cardTaskCreateShort'}
            values={{
              task: taskName,
              card: cardName,
            }}
          >
            {cardNode}
            <span className={s.data} title={taskName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_TASK_UPDATE: {
        const taskName = isTruncated ? truncate(activity.data.taskName, { length: taskNameTruncateLength }) : activity.data.taskName;

        if (activity.data.taskPrevName) {
          const taskPrevName = isTruncated ? truncate(activity.data.taskPrevName, { length: taskNameTruncateLength }) : activity.data.taskPrevName;
          return (
            <Trans
              i18nKey={isCardLinked ? 'activity.cardTaskUpdateName' : 'activity.cardTaskUpdateNameShort'}
              values={{
                task: taskName,
                prevTask: taskPrevName,
                card: cardName,
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
              i18nKey={isCardLinked ? 'activity.cardTaskUpdateIsCompleted' : 'activity.cardTaskUpdateIsCompletedShort'}
              values={{
                task: taskName,
                card: cardName,
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
            key = isCardLinked ? 'activity.cardTaskUpdateDueDate' : 'activity.cardTaskUpdateDueDateShort';
          } else if (taskPrevDueDate === null && taskDueDate !== null) {
            key = isCardLinked ? 'activity.cardTaskUpdateDueDateAdd' : 'activity.cardTaskUpdateDueDateAddShort';
          } else if (taskPrevDueDate !== null && taskDueDate === null) {
            key = isCardLinked ? 'activity.cardTaskUpdateDueDateRemove' : 'activity.cardTaskUpdateDueDateRemoveShort';
          }

          return (
            <Trans
              i18nKey={key}
              values={{
                task: taskName,
                card: cardName,
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
        const taskName = isTruncated ? truncate(activity.data.taskName, { length: taskNameTruncateLength }) : activity.data.taskName;

        return (
          <Trans
            i18nKey={isCardLinked ? 'activity.cardTaskDuplicate' : 'activity.cardTaskDuplicateShort'}
            values={{
              task: taskName,
              card: cardName,
            }}
          >
            {cardNode}
            <span className={s.data} title={taskName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_TASK_MOVE: {
        const taskName = isTruncated ? truncate(activity.data.taskName, { length: taskNameTruncateLength }) : activity.data.taskName;

        return (
          <Trans
            i18nKey={isCardLinked ? 'activity.cardTaskMove' : 'activity.cardTaskMoveShort'}
            values={{
              task: taskName,
              card: cardName,
            }}
          >
            {cardNode}
            <span className={s.data} title={taskName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_TASK_DELETE: {
        const taskName = isTruncated ? truncate(activity.data.taskName, { length: taskNameTruncateLength }) : activity.data.taskName;

        return (
          <Trans
            i18nKey={isCardLinked ? 'activity.cardTaskDelete' : 'activity.cardTaskDeleteShort'}
            values={{
              task: taskName,
              card: cardName,
            }}
          >
            {cardNode}
            <span className={s.data} title={taskName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_TASK_USER_ADD: {
        const userName = isTruncated ? truncate(activity.data.userName, { length: userNameTruncateLength }) : activity.data.userName;
        const taskName = isTruncated ? truncate(activity.data.taskName, { length: taskNameTruncateLength }) : activity.data.taskName;

        return (
          <Trans
            i18nKey={isCardLinked ? 'activity.cardTaskUserAdd' : 'activity.cardTaskUserAddShort'}
            values={{
              user: userName,
              task: taskName,
              card: cardName,
            }}
          >
            {cardNode}
            <span className={s.data} title={taskName} />
            <span className={s.data} title={userName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_TASK_USER_REMOVE: {
        const userName = isTruncated ? truncate(activity.data.userName, { length: userNameTruncateLength }) : activity.data.userName;
        const taskName = isTruncated ? truncate(activity.data.taskName, { length: taskNameTruncateLength }) : activity.data.taskName;

        return (
          <Trans
            i18nKey={isCardLinked ? 'activity.cardTaskUserRemove' : 'activity.cardTaskUserRemoveShort'}
            values={{
              user: userName,
              task: taskName,
              card: cardName,
            }}
          >
            {cardNode}
            <span className={s.data} title={taskName} />
            <span className={s.data} title={userName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_ATTACHMENT_CREATE: {
        const attachmentName = isTruncated ? truncate(activity.data.attachmentName, { length: commentTruncateLength }) : activity.data.attachmentName;

        return (
          <Trans
            i18nKey={isCardLinked ? 'activity.cardAttachmentCreate' : 'activity.cardAttachmentCreateShort'}
            values={{
              attachment: attachmentName,
              card: cardName,
            }}
          >
            {cardNode}
            <span className={s.data} title={attachmentName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_ATTACHMENT_UPDATE: {
        const attachmentPrevName = isTruncated ? truncate(activity.data.attachmentPrevName, { length: commentTruncateLength }) : activity.data.attachmentPrevName;
        const attachmentName = isTruncated ? truncate(activity.data.attachmentName, { length: commentTruncateLength }) : activity.data.attachmentName;

        return (
          <Trans
            i18nKey={isCardLinked ? 'activity.cardAttachmentUpdate' : 'activity.cardAttachmentUpdateShort'}
            values={{
              prevAttachment: attachmentPrevName,
              attachment: attachmentName,
              card: cardName,
            }}
          >
            {cardNode}
            <span className={s.data} title={attachmentPrevName} />
            <span className={s.data} title={attachmentName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_ATTACHMENT_DELETE: {
        const attachmentName = isTruncated ? truncate(activity.data.attachmentName, { length: commentTruncateLength }) : activity.data.attachmentName;

        return (
          <Trans
            i18nKey={isCardLinked ? 'activity.cardAttachmentDelete' : 'activity.cardAttachmentDeleteShort'}
            values={{
              attachment: attachmentName,
              card: cardName,
            }}
          >
            {cardNode}
            <span className={s.data} title={attachmentName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_LABEL_ADD: {
        const labelName = isTruncated ? truncate(activity.data.labelName, { length: commentTruncateLength }) : activity.data.labelName;

        return (
          <Trans
            i18nKey={isCardLinked ? 'activity.cardLabelAdd' : 'activity.cardLabelAddShort'}
            values={{
              label: labelName,
              card: cardName,
            }}
          >
            {cardNode}
            <span className={s.data} title={labelName} />
          </Trans>
        );
      }

      case ActivityTypes.CARD_LABEL_REMOVE: {
        const labelName = isTruncated ? truncate(activity.data.labelName, { length: commentTruncateLength }) : activity.data.labelName;

        return (
          <Trans
            i18nKey={isCardLinked ? 'activity.cardLabelRemove' : 'activity.cardLabelRemoveShort'}
            values={{
              label: labelName,
              card: cardName,
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
  }
  return null;
});

ActivityMessage.propTypes = {
  activity: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  card: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  isTruncated: PropTypes.bool,
  isCardLinked: PropTypes.bool,
  onClose: PropTypes.func,
};

ActivityMessage.defaultProps = {
  card: undefined,
  isTruncated: false,
  isCardLinked: false,
  onClose: () => {},
};

export default ActivityMessage;
