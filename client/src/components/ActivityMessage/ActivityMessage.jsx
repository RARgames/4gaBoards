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
      const listName = isTruncated ? truncate(activity.data.list.name, { length: listNameTruncateLength }) : activity.data.list.name;

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
      const listName = isTruncated ? truncate(activity.data.list.name, { length: listNameTruncateLength }) : activity.data.list.name;

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
      const cardName = isTruncated ? truncate(activity.data.name, { length: cardNameTruncateLength }) : activity.data.name;

      if (activity.data.prevName) {
        const prevCardName = isTruncated ? truncate(activity.data.prevName, { length: cardNameTruncateLength }) : activity.data.prevName;
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
      if (activity.data.description !== undefined) {
        const { prevDescription, description } = activity.data;
        const prevDescriptionTruncated = isTruncated || isDescriptionTruncated ? truncate(prevDescription, { length: descriptionTruncateLength }) : prevDescription;
        const descriptionTruncated = isTruncated || isDescriptionTruncated ? truncate(description, { length: descriptionTruncateLength }) : description;

        let firstTitle = '';
        let secondTitle = '';

        let key;
        if (prevDescription !== null && description !== null) {
          key = card ? 'activity.cardUpdateDescription' : 'activity.cardUpdateDescriptionShort';
          firstTitle = prevDescription;
          secondTitle = description;
        } else if (prevDescription === null && description !== null) {
          key = card ? 'activity.cardUpdateDescriptionAdd' : 'activity.cardUpdateDescriptionAddShort';
          firstTitle = description;
        } else if (prevDescription !== null && description === null) {
          key = card ? 'activity.cardUpdateDescriptionRemove' : 'activity.cardUpdateDescriptionRemoveShort';
          firstTitle = prevDescription;
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
      if (activity.data.dueDate !== undefined) {
        const { prevDueDate, dueDate } = activity.data;
        let key;
        if (prevDueDate !== null && dueDate !== null) {
          key = card ? 'activity.cardUpdateDueDate' : 'activity.cardUpdateDueDateShort';
        } else if (prevDueDate === null && dueDate !== null) {
          key = card ? 'activity.cardUpdateDueDateAdd' : 'activity.cardUpdateDueDateAddShort';
        } else if (prevDueDate !== null && dueDate === null) {
          key = card ? 'activity.cardUpdateDueDateRemove' : 'activity.cardUpdateDueDateRemoveShort';
        }

        return (
          <Trans
            i18nKey={key}
            values={{
              card: cardName,
              dueDate: t(`format:date`, { value: dueDate, postProcess: 'formatDate' }),
              prevDueDate: t(`format:date`, { value: prevDueDate, postProcess: 'formatDate' }),
            }}
          >
            {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
            <span className={s.data} />
            <span className={s.data} />
          </Trans>
        );
      }
      if (activity.data.timer !== undefined) {
        const { prevTimer, timer } = activity.data;
        let key;
        if (prevTimer !== null && timer !== null) {
          key = card ? 'activity.cardUpdateTimer' : 'activity.cardUpdateTimerShort';
        } else if (prevTimer === null && timer !== null) {
          key = card ? 'activity.cardUpdateTimerAdd' : 'activity.cardUpdateTimerAddShort';
        } else if (prevTimer !== null && timer === null) {
          key = card ? 'activity.cardUpdateTimerRemove' : 'activity.cardUpdateTimerRemoveShort';
        }

        return (
          <Trans
            i18nKey={key}
            values={{
              card: cardName,
              timer: formatTimerActivities({ startedAt: timer?.startedAt, total: timer?.total }),
              prevTimer: formatTimerActivities({ startedAt: prevTimer?.startedAt, total: prevTimer?.total }),
            }}
          >
            {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
            <span className={s.data} />
            <span className={s.data} />
          </Trans>
        );
      }
      if (activity.data.coverAttachmentName !== undefined) {
        const { prevCoverAttachmentName, coverAttachmentName } = activity.data;
        const coverAttachmentNameTruncated = isTruncated ? truncate(coverAttachmentName, { length: defaultTruncateLength }) : coverAttachmentName;
        const prevCoverAttachmentNameTruncated = isTruncated ? truncate(prevCoverAttachmentName, { length: defaultTruncateLength }) : prevCoverAttachmentName;

        let firstTitle = '';
        let secondTitle = '';

        let key;
        if (prevCoverAttachmentName !== null && coverAttachmentName !== null) {
          key = card ? 'activity.cardUpdateCoverAttachment' : 'activity.cardUpdateCoverAttachmentShort';
          firstTitle = prevCoverAttachmentNameTruncated;
          secondTitle = coverAttachmentNameTruncated;
        } else if (prevCoverAttachmentName === null && coverAttachmentName !== null) {
          key = card ? 'activity.cardUpdateCoverAttachmentAdd' : 'activity.cardUpdateCoverAttachmentAddShort';
          firstTitle = coverAttachmentNameTruncated;
        } else if (prevCoverAttachmentName !== null && coverAttachmentName === null) {
          key = card ? 'activity.cardUpdateCoverAttachmentRemove' : 'activity.cardUpdateCoverAttachmentRemoveShort';
          firstTitle = prevCoverAttachmentNameTruncated;
        }

        return (
          <Trans
            i18nKey={key}
            values={{
              card: cardName,
              coverAttachment: coverAttachmentNameTruncated,
              prevCoverAttachment: prevCoverAttachmentNameTruncated,
            }}
          >
            {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} title={cardName} /> : <span />}
            <span className={s.data} title={firstTitle} />
            <span className={s.data} title={secondTitle} />
          </Trans>
        );
      }
      if (activity.data.position !== undefined) {
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
      const fromListName = isTruncated ? truncate(activity.data.fromList.name, { length: listNameTruncateLength }) : activity.data.fromList.name;
      const toListName = isTruncated ? truncate(activity.data.toList.name, { length: listNameTruncateLength }) : activity.data.toList.name;

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
      const cardComment = isTruncated ? truncate(activity.data.text, { length: commentTruncateLength }) : activity.data.text;

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
      const prevCardComment = isTruncated ? truncate(activity.data.prevText, { length: commentTruncateLength }) : activity.data.prevText;
      const cardComment = isTruncated ? truncate(activity.data.text, { length: commentTruncateLength }) : activity.data.text;
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
      const cardComment = isTruncated ? truncate(activity.data.text, { length: commentTruncateLength }) : activity.data.text;
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
      const userName = isTruncated ? truncate(activity.data.name, { length: userNameTruncateLength }) : activity.data.name;

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
      const userName = isTruncated ? truncate(activity.data.name, { length: userNameTruncateLength }) : activity.data.name;

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
      const taskName = isTruncated ? truncate(activity.data.name, { length: taskNameTruncateLength }) : activity.data.name;

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
      const taskName = isTruncated ? truncate(activity.data.name, { length: taskNameTruncateLength }) : activity.data.name;

      if (activity.data.prevName) {
        const prevTaskName = isTruncated ? truncate(activity.data.prevName, { length: taskNameTruncateLength }) : activity.data.prevName;
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
      if (activity.data.isCompleted !== undefined) {
        return (
          <Trans
            i18nKey={card ? 'activity.cardTaskUpdateIsCompleted' : 'activity.cardTaskUpdateIsCompletedShort'}
            values={{
              task: taskName,
              card: cardName,
              isCompleted: activity.data.isCompleted ? t('activity.cardTaskCompleted') : t('activity.cardTaskUncompleted'),
            }}
          >
            {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
            <span className={s.data} />
            <span className={s.data} />
          </Trans>
        );
      }
      if (activity.data.dueDate !== undefined) {
        const { prevDueDate, dueDate } = activity.data;
        let key;
        if (prevDueDate !== null && dueDate !== null) {
          key = card ? 'activity.cardTaskUpdateDueDate' : 'activity.cardTaskUpdateDueDateShort';
        } else if (prevDueDate === null && dueDate !== null) {
          key = card ? 'activity.cardTaskUpdateDueDateAdd' : 'activity.cardTaskUpdateDueDateAddShort';
        } else if (prevDueDate !== null && dueDate === null) {
          key = card ? 'activity.cardTaskUpdateDueDateRemove' : 'activity.cardTaskUpdateDueDateRemoveShort';
        }

        return (
          <Trans
            i18nKey={key}
            values={{
              task: taskName,
              card: cardName,
              dueDate: t(`format:date`, { value: dueDate, postProcess: 'formatDate' }),
              prevDueDate: t(`format:date`, { value: prevDueDate, postProcess: 'formatDate' }),
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
      const taskName = isTruncated ? truncate(activity.data.name, { length: taskNameTruncateLength }) : activity.data.name;

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
      const taskName = isTruncated ? truncate(activity.data.name, { length: taskNameTruncateLength }) : activity.data.name;

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
      const taskName = isTruncated ? truncate(activity.data.name, { length: taskNameTruncateLength }) : activity.data.name;

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
      const userName = isTruncated ? truncate(activity.data.name, { length: userNameTruncateLength }) : activity.data.name;
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
      const userName = isTruncated ? truncate(activity.data.name, { length: userNameTruncateLength }) : activity.data.name;
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
      const attachmentName = isTruncated ? truncate(activity.data.name, { length: commentTruncateLength }) : activity.data.name;

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
      const prevAttachmentName = isTruncated ? truncate(activity.data.prevName, { length: commentTruncateLength }) : activity.data.prevName;
      const attachmentName = isTruncated ? truncate(activity.data.name, { length: commentTruncateLength }) : activity.data.name;

      return (
        <Trans
          i18nKey={card ? 'activity.cardAttachmentUpdate' : 'activity.cardAttachmentUpdateShort'}
          values={{
            prevAttachment: prevAttachmentName,
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
      const attachmentName = isTruncated ? truncate(activity.data.name, { length: commentTruncateLength }) : activity.data.name;

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
      const labelName = isTruncated ? truncate(activity.data.name, { length: commentTruncateLength }) : activity.data.name;

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
      const labelName = isTruncated ? truncate(activity.data.name, { length: commentTruncateLength }) : activity.data.name;

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
