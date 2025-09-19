import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import truncate from 'lodash/truncate';
import PropTypes from 'prop-types';

import { ActivityTypes } from '../../constants/Enums';
import Paths from '../../constants/Paths';
import { formatTimerActivities } from '../../utils/timer';

import * as s from './ActivityMessage.module.scss';

const cardNameTruncateLength = 30;
const commentTruncateLength = 50;
const listNameTruncateLength = 30;
const taskNameTruncateLength = 30;
const userNameTruncateLength = 20;
const descriptionTruncateLength = 100;
const defaultTruncateLength = 30;
const isDescriptionTruncated = true;

const ActivityMessage = React.memo(({ activity, card, isTruncated, isCardLinked, onClose }) => {
  const [t] = useTranslation();
  switch (activity.type) {
    case ActivityTypes.CARD_CREATE: {
      const cardName = isTruncated ? truncate(card?.name, { length: cardNameTruncateLength }) : card?.name;
      const listName = isTruncated ? truncate(activity.data.listName, { length: listNameTruncateLength }) : activity.data.listName;

      return (
        <Trans
          i18nKey={card ? 'activity.cardCreate' : 'activity.cardCreateShort'}
          values={{
            card: cardName,
            list: listName,
          }}
        >
          {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
          <span className={s.data} />
        </Trans>
      );
    }

    case ActivityTypes.CARD_DUPLICATE: {
      const cardName = isTruncated ? truncate(card?.name, { length: cardNameTruncateLength }) : card?.name;
      const listName = isTruncated ? truncate(activity.data.listName, { length: listNameTruncateLength }) : activity.data.listName;

      return (
        <Trans
          i18nKey={card ? 'activity.cardDuplicate' : 'activity.cardDuplicateShort'}
          values={{
            card: cardName,
            list: listName,
          }}
        >
          {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
          <span className={s.data} />
        </Trans>
      );
    }

    case ActivityTypes.CARD_UPDATE: {
      const cardName = isTruncated ? truncate(activity.data.cardName, { length: cardNameTruncateLength }) : activity.data.cardName;

      if (activity.data.cardPrevName) {
        const prevCardName = isTruncated ? truncate(activity.data.cardPrevName, { length: cardNameTruncateLength }) : activity.data.cardPrevName;
        return (
          <Trans
            i18nKey={card ? 'activity.cardUpdateName' : 'activity.cardUpdateNameShort'}
            values={{
              prevCard: prevCardName,
              card: cardName,
            }}
          >
            {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span className={s.data} />}
            <span className={s.data} />
          </Trans>
        );
      }
      if (activity.data.cardDescription !== undefined) {
        const { cardPrevDescription, cardDescription } = activity.data;
        const prevDescriptionTruncated = isTruncated || isDescriptionTruncated ? truncate(cardPrevDescription, { length: descriptionTruncateLength }) : cardPrevDescription;
        const descriptionTruncated = isTruncated || isDescriptionTruncated ? truncate(cardDescription, { length: descriptionTruncateLength }) : cardDescription;

        let firstTitle = '';
        let secondTitle = '';

        let key;
        if (cardPrevDescription !== null && cardDescription !== null) {
          key = card ? 'activity.cardUpdateDescription' : 'activity.cardUpdateDescriptionShort';
          firstTitle = cardPrevDescription;
          secondTitle = cardDescription;
        } else if (cardPrevDescription === null && cardDescription !== null) {
          key = card ? 'activity.cardUpdateDescriptionAdd' : 'activity.cardUpdateDescriptionAddShort';
          firstTitle = cardDescription;
        } else if (cardPrevDescription !== null && cardDescription === null) {
          key = card ? 'activity.cardUpdateDescriptionRemove' : 'activity.cardUpdateDescriptionRemoveShort';
          firstTitle = cardPrevDescription;
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
            {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
            <span className={s.data} title={firstTitle} />
            <span className={s.data} title={secondTitle} />
          </Trans>
        );
      }
      if (activity.data.cardDueDate !== undefined) {
        const { cardPrevDueDate, cardDueDate } = activity.data;
        let key;
        if (cardPrevDueDate !== null && cardDueDate !== null) {
          key = card ? 'activity.cardUpdateDueDate' : 'activity.cardUpdateDueDateShort';
        } else if (cardPrevDueDate === null && cardDueDate !== null) {
          key = card ? 'activity.cardUpdateDueDateAdd' : 'activity.cardUpdateDueDateAddShort';
        } else if (cardPrevDueDate !== null && cardDueDate === null) {
          key = card ? 'activity.cardUpdateDueDateRemove' : 'activity.cardUpdateDueDateRemoveShort';
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
            {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
            <span className={s.data} />
            <span className={s.data} />
          </Trans>
        );
      }
      if (activity.data.cardTimer !== undefined) {
        const { cardPrevTimer, cardTimer } = activity.data;
        let key;
        if (cardPrevTimer !== null && cardTimer !== null) {
          key = card ? 'activity.cardUpdateTimer' : 'activity.cardUpdateTimerShort';
        } else if (cardPrevTimer === null && cardTimer !== null) {
          key = card ? 'activity.cardUpdateTimerAdd' : 'activity.cardUpdateTimerAddShort';
        } else if (cardPrevTimer !== null && cardTimer === null) {
          key = card ? 'activity.cardUpdateTimerRemove' : 'activity.cardUpdateTimerRemoveShort';
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
            {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
            <span className={s.data} />
            <span className={s.data} />
          </Trans>
        );
      }
      if (activity.data.cardCoverAttachmentName !== undefined) {
        const { cardPrevCoverAttachmentName, cardCoverAttachmentName } = activity.data;
        const cardCoverAttachmentNameTruncated = isTruncated ? truncate(cardCoverAttachmentName, { length: defaultTruncateLength }) : cardCoverAttachmentName;
        const cardPrevCoverAttachmentNameTruncated = isTruncated ? truncate(cardPrevCoverAttachmentName, { length: defaultTruncateLength }) : cardPrevCoverAttachmentName;

        let firstTitle = '';
        let secondTitle = '';

        let key;
        if (cardPrevCoverAttachmentName !== null && cardCoverAttachmentName !== null) {
          key = card ? 'activity.cardUpdateCoverAttachment' : 'activity.cardUpdateCoverAttachmentShort';
          firstTitle = cardPrevCoverAttachmentNameTruncated;
          secondTitle = cardCoverAttachmentNameTruncated;
        } else if (cardPrevCoverAttachmentName === null && cardCoverAttachmentName !== null) {
          key = card ? 'activity.cardUpdateCoverAttachmentAdd' : 'activity.cardUpdateCoverAttachmentAddShort';
          firstTitle = cardCoverAttachmentNameTruncated;
        } else if (cardPrevCoverAttachmentName !== null && cardCoverAttachmentName === null) {
          key = card ? 'activity.cardUpdateCoverAttachmentRemove' : 'activity.cardUpdateCoverAttachmentRemoveShort';
          firstTitle = cardPrevCoverAttachmentNameTruncated;
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
            {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} title={cardName} /> : <span />}
            <span className={s.data} title={firstTitle} />
            <span className={s.data} title={secondTitle} />
          </Trans>
        );
      }
      if (activity.data.cardPosition !== undefined) {
        const listName = isTruncated ? truncate(activity.data.listName, { length: listNameTruncateLength }) : activity.data.listName;

        return (
          <Trans
            i18nKey={card ? 'activity.cardUpdatePosition' : 'activity.cardUpdatePositionShort'}
            values={{
              card: cardName,
              list: listName,
            }}
          >
            {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} title={cardName} /> : <span />}
            <span className={s.data} />
          </Trans>
        );
      }

      return null;
    }

    case ActivityTypes.CARD_MOVE: {
      const cardName = isTruncated ? truncate(card?.name, { length: cardNameTruncateLength }) : card?.name;
      const fromListName = isTruncated ? truncate(activity.data.listFromName, { length: listNameTruncateLength }) : activity.data.listFromName;
      const toListName = isTruncated ? truncate(activity.data.listToName, { length: listNameTruncateLength }) : activity.data.listToName;

      return (
        <Trans
          i18nKey={card ? 'activity.cardMove' : 'activity.cardMoveShort'}
          values={{
            card: cardName,
            fromList: fromListName,
            toList: toListName,
          }}
        >
          {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
          <span className={s.data} />
          <span className={s.data} />
        </Trans>
      );
    }

    case ActivityTypes.CARD_DELETE: {
      const cardName = isTruncated ? truncate(card?.name, { length: cardNameTruncateLength }) : card?.name;

      return (
        <Trans
          i18nKey={card ? 'activity.cardDelete' : 'activity.cardDeleteShort'}
          values={{
            card: cardName,
          }}
        >
          {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
        </Trans>
      );
    }

    case ActivityTypes.CARD_COMMENT_CREATE: {
      const cardName = isTruncated ? truncate(card?.name, { length: cardNameTruncateLength }) : card?.name;
      const cardComment = isTruncated ? truncate(activity.data.commentActionText, { length: commentTruncateLength }) : activity.data.commentActionText;

      return (
        <Trans
          i18nKey={card ? 'activity.cardCommentCreate' : 'activity.cardCommentCreateShort'}
          values={{
            comment: cardComment,
            card: cardName,
          }}
        >
          {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
          <span className={s.data} />
        </Trans>
      );
    }

    case ActivityTypes.CARD_COMMENT_UPDATE: {
      const cardName = isTruncated ? truncate(card?.name, { length: cardNameTruncateLength }) : card?.name;
      const prevCardComment = isTruncated ? truncate(activity.data.prevCommentActionText, { length: commentTruncateLength }) : activity.data.prevCommentActionText;
      const cardComment = isTruncated ? truncate(activity.data.commentActionText, { length: commentTruncateLength }) : activity.data.commentActionText;
      const userName = isTruncated ? truncate(activity.data.userName, { length: userNameTruncateLength }) : activity.data.userName;

      return (
        <Trans
          i18nKey={card ? 'activity.cardCommentUpdate' : 'activity.cardCommentUpdateShort'}
          values={{
            prevComment: prevCardComment,
            comment: cardComment,
            card: cardName,
            user: userName,
          }}
        >
          {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
          <span className={s.data} />
          <span className={s.data} />
          <span className={s.data} />
        </Trans>
      );
    }

    case ActivityTypes.CARD_COMMENT_DELETE: {
      const cardName = isTruncated ? truncate(card?.name, { length: cardNameTruncateLength }) : card?.name;
      const cardComment = isTruncated ? truncate(activity.data.commentActionText, { length: commentTruncateLength }) : activity.data.commentActionText;
      const userName = isTruncated ? truncate(activity.data.userName, { length: userNameTruncateLength }) : activity.data.userName;

      return (
        <Trans
          i18nKey={card ? 'activity.cardCommentDelete' : 'activity.cardCommentDeleteShort'}
          values={{
            comment: cardComment,
            card: cardName,
            user: userName,
          }}
        >
          {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
          <span className={s.data} />
          <span className={s.data} />
        </Trans>
      );
    }

    case ActivityTypes.CARD_USER_ADD: {
      const cardName = isTruncated ? truncate(card?.name, { length: cardNameTruncateLength }) : card?.name;
      const userName = isTruncated ? truncate(activity.data.userName, { length: userNameTruncateLength }) : activity.data.userName;

      return (
        <Trans
          i18nKey={card ? 'activity.cardUserAdd' : 'activity.cardUserAddShort'}
          values={{
            user: userName,
            card: cardName,
          }}
        >
          {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
          <span className={s.data} />
        </Trans>
      );
    }

    case ActivityTypes.CARD_USER_REMOVE: {
      const cardName = isTruncated ? truncate(card?.name, { length: cardNameTruncateLength }) : card?.name;
      const userName = isTruncated ? truncate(activity.data.userName, { length: userNameTruncateLength }) : activity.data.userName;

      return (
        <Trans
          i18nKey={card ? 'activity.cardUserRemove' : 'activity.cardUserRemoveShort'}
          values={{
            user: userName,
            card: cardName,
          }}
        >
          {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
          <span className={s.data} />
        </Trans>
      );
    }

    case ActivityTypes.CARD_TASK_CREATE: {
      const cardName = isTruncated ? truncate(card?.name, { length: cardNameTruncateLength }) : card?.name;
      const taskName = isTruncated ? truncate(activity.data.taskName, { length: taskNameTruncateLength }) : activity.data.taskName;

      return (
        <Trans
          i18nKey={card ? 'activity.cardTaskCreate' : 'activity.cardTaskCreateShort'}
          values={{
            task: taskName,
            card: cardName,
          }}
        >
          {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
          <span className={s.data} />
        </Trans>
      );
    }

    case ActivityTypes.CARD_TASK_UPDATE: {
      const cardName = isTruncated ? truncate(card?.name, { length: cardNameTruncateLength }) : card?.name;
      const taskName = isTruncated ? truncate(activity.data.taskName, { length: taskNameTruncateLength }) : activity.data.taskName;

      if (activity.data.prevName) {
        const prevTaskName = isTruncated ? truncate(activity.data.prevTaskName, { length: taskNameTruncateLength }) : activity.data.prevTaskName;
        return (
          <Trans
            i18nKey={card ? 'activity.cardTaskUpdateName' : 'activity.cardTaskUpdateNameShort'}
            values={{
              task: taskName,
              prevTask: prevTaskName,
              card: cardName,
            }}
          >
            {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
            <span className={s.data} />
            <span className={s.data} />
          </Trans>
        );
      }
      if (activity.data.taskIsCompleted !== undefined) {
        return (
          <Trans
            i18nKey={card ? 'activity.cardTaskUpdateIsCompleted' : 'activity.cardTaskUpdateIsCompletedShort'}
            values={{
              task: taskName,
              card: cardName,
              isCompleted: activity.data.taskIsCompleted ? t('activity.cardTaskCompleted') : t('activity.cardTaskUncompleted'),
            }}
          >
            {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
            <span className={s.data} />
            <span className={s.data} />
          </Trans>
        );
      }
      if (activity.data.taskDueDate !== undefined) {
        const { taskPrevDueDate, taskDueDate } = activity.data;
        let key;
        if (taskPrevDueDate !== null && taskDueDate !== null) {
          key = card ? 'activity.cardTaskUpdateDueDate' : 'activity.cardTaskUpdateDueDateShort';
        } else if (taskPrevDueDate === null && taskDueDate !== null) {
          key = card ? 'activity.cardTaskUpdateDueDateAdd' : 'activity.cardTaskUpdateDueDateAddShort';
        } else if (taskPrevDueDate !== null && taskDueDate === null) {
          key = card ? 'activity.cardTaskUpdateDueDateRemove' : 'activity.cardTaskUpdateDueDateRemoveShort';
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
            {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
            <span className={s.data} />
            <span className={s.data} />
            <span className={s.data} />
          </Trans>
        );
      }
      return null;
    }

    case ActivityTypes.CARD_TASK_DUPLICATE: {
      const cardName = isTruncated ? truncate(card?.name, { length: cardNameTruncateLength }) : card?.name;
      const taskName = isTruncated ? truncate(activity.data.taskName, { length: taskNameTruncateLength }) : activity.data.taskName;

      return (
        <Trans
          i18nKey={card ? 'activity.cardTaskDuplicate' : 'activity.cardTaskDuplicateShort'}
          values={{
            task: taskName,
            card: cardName,
          }}
        >
          {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
          <span className={s.data} />
        </Trans>
      );
    }

    case ActivityTypes.CARD_TASK_MOVE: {
      const cardName = isTruncated ? truncate(card?.name, { length: cardNameTruncateLength }) : card?.name;
      const taskName = isTruncated ? truncate(activity.data.taskName, { length: taskNameTruncateLength }) : activity.data.taskName;

      return (
        <Trans
          i18nKey={card ? 'activity.cardTaskMove' : 'activity.cardTaskMoveShort'}
          values={{
            task: taskName,
            card: cardName,
          }}
        >
          {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
          <span className={s.data} />
        </Trans>
      );
    }

    case ActivityTypes.CARD_TASK_DELETE: {
      const cardName = isTruncated ? truncate(card?.name, { length: cardNameTruncateLength }) : card?.name;
      const taskName = isTruncated ? truncate(activity.data.taskName, { length: taskNameTruncateLength }) : activity.data.taskName;

      return (
        <Trans
          i18nKey={card ? 'activity.cardTaskDelete' : 'activity.cardTaskDeleteShort'}
          values={{
            task: taskName,
            card: cardName,
          }}
        >
          {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
          <span className={s.data} />
        </Trans>
      );
    }

    case ActivityTypes.CARD_TASK_USER_ADD: {
      const cardName = isTruncated ? truncate(card?.name, { length: cardNameTruncateLength }) : card?.name;
      const userName = isTruncated ? truncate(activity.data.userName, { length: userNameTruncateLength }) : activity.data.userName;
      const taskName = isTruncated ? truncate(activity.data.taskName, { length: taskNameTruncateLength }) : activity.data.taskName;

      return (
        <Trans
          i18nKey={card ? 'activity.cardTaskUserAdd' : 'activity.cardTaskUserAddShort'}
          values={{
            user: userName,
            task: taskName,
            card: cardName,
          }}
        >
          {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
          <span className={s.data} />
          <span className={s.data} />
        </Trans>
      );
    }

    case ActivityTypes.CARD_TASK_USER_REMOVE: {
      const cardName = isTruncated ? truncate(card?.name, { length: cardNameTruncateLength }) : card?.name;
      const userName = isTruncated ? truncate(activity.data.userName, { length: userNameTruncateLength }) : activity.data.userName;
      const taskName = isTruncated ? truncate(activity.data.taskName, { length: taskNameTruncateLength }) : activity.data.taskName;

      return (
        <Trans
          i18nKey={card ? 'activity.cardTaskUserRemove' : 'activity.cardTaskUserRemoveShort'}
          values={{
            user: userName,
            task: taskName,
            card: cardName,
          }}
        >
          {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
          <span className={s.data} />
          <span className={s.data} />
        </Trans>
      );
    }

    case ActivityTypes.CARD_ATTACHMENT_CREATE: {
      const cardName = isTruncated ? truncate(card?.name, { length: cardNameTruncateLength }) : card?.name;
      const attachmentName = isTruncated ? truncate(activity.data.attachmentName, { length: commentTruncateLength }) : activity.data.attachmentName;

      return (
        <Trans
          i18nKey={card ? 'activity.cardAttachmentCreate' : 'activity.cardAttachmentCreateShort'}
          values={{
            attachment: attachmentName,
            card: cardName,
          }}
        >
          {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
          <span className={s.data} />
        </Trans>
      );
    }

    case ActivityTypes.CARD_ATTACHMENT_UPDATE: {
      const cardName = isTruncated ? truncate(card?.name, { length: cardNameTruncateLength }) : card?.name;
      const attachmentPrevName = isTruncated ? truncate(activity.data.attachmentPrevName, { length: commentTruncateLength }) : activity.data.attachmentPrevName;
      const attachmentName = isTruncated ? truncate(activity.data.attachmentName, { length: commentTruncateLength }) : activity.data.attachmentName;

      return (
        <Trans
          i18nKey={card ? 'activity.cardAttachmentUpdate' : 'activity.cardAttachmentUpdateShort'}
          values={{
            prevAttachment: attachmentPrevName,
            attachment: attachmentName,
            card: cardName,
          }}
        >
          {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
          <span className={s.data} />
          <span className={s.data} />
        </Trans>
      );
    }

    case ActivityTypes.CARD_ATTACHMENT_DELETE: {
      const cardName = isTruncated ? truncate(card?.name, { length: cardNameTruncateLength }) : card?.name;
      const attachmentName = isTruncated ? truncate(activity.data.attachmentName, { length: commentTruncateLength }) : activity.data.attachmentName;

      return (
        <Trans
          i18nKey={card ? 'activity.cardAttachmentDelete' : 'activity.cardAttachmentDeleteShort'}
          values={{
            attachment: attachmentName,
            card: cardName,
          }}
        >
          {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
          <span className={s.data} />
        </Trans>
      );
    }

    case ActivityTypes.CARD_LABEL_ADD: {
      const cardName = isTruncated ? truncate(card?.name, { length: cardNameTruncateLength }) : card?.name;
      const labelName = isTruncated ? truncate(activity.data.labelName, { length: commentTruncateLength }) : activity.data.labelName;

      return (
        <Trans
          i18nKey={card ? 'activity.cardLabelAdd' : 'activity.cardLabelAddShort'}
          values={{
            label: labelName,
            card: cardName,
          }}
        >
          {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
          <span className={s.data} />
        </Trans>
      );
    }

    case ActivityTypes.CARD_LABEL_REMOVE: {
      const cardName = isTruncated ? truncate(card?.name, { length: cardNameTruncateLength }) : card?.name;
      const labelName = isTruncated ? truncate(activity.data.labelName, { length: commentTruncateLength }) : activity.data.labelName;

      return (
        <Trans
          i18nKey={card ? 'activity.cardLabelRemove' : 'activity.cardLabelRemoveShort'}
          values={{
            label: labelName,
            card: cardName,
          }}
        >
          {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
          <span className={s.data} />
        </Trans>
      );
    }

    default: {
      return null;
    }
  }
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
