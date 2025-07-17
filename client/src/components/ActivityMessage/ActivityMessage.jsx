import React from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router';
import truncate from 'lodash/truncate';
import PropTypes from 'prop-types';

import { ActivityTypes } from '../../constants/Enums';
import Paths from '../../constants/Paths';

import * as s from './ActivityMessage.module.scss';

const cardNameTruncateLength = 30;
const commentTruncateLength = 50;
const listNameTruncateLength = 30;

const ActivityMessage = React.memo(({ activity, card, isTruncated, isCardLinked, onClose }) => {
  switch (activity.type) {
    case ActivityTypes.CARD_CREATE: {
      const cardName = isTruncated ? truncate(card?.name, { length: cardNameTruncateLength }) : card?.name;
      const listName = isTruncated ? truncate(activity.data.list.name, { length: listNameTruncateLength }) : activity.data.list.name;

      return (
        <Trans
          i18nKey={card ? 'activity.cardCreate' : 'activity.cardCreateShort'}
          values={{
            user: activity.user.name,
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
            user: activity.user.name,
            card: cardName,
            list: listName,
          }}
        >
          {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
          <span className={s.data} />
        </Trans>
      );
    }

    case ActivityTypes.CARD_MOVE: {
      const cardName = isTruncated ? truncate(card?.name, { length: cardNameTruncateLength }) : card?.name;
      const fromListName = isTruncated ? truncate(activity.data.fromList.name, { length: listNameTruncateLength }) : activity.data.fromList.name;
      const toListName = isTruncated ? truncate(activity.data.toList.name, { length: listNameTruncateLength }) : activity.data.toList.name;

      return (
        <Trans
          i18nKey={card ? 'activity.cardMove' : 'activity.cardMoveShort'}
          values={{
            user: activity.user.name,
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

    case ActivityTypes.CARD_COMMENT_CREATE: {
      const cardName = isTruncated ? truncate(card?.name, { length: cardNameTruncateLength }) : card?.name;
      const cardComment = isTruncated ? truncate(activity.data.text, { length: commentTruncateLength }) : activity.data.text;

      return (
        <Trans
          i18nKey={card ? 'activity.cardCommentCreate' : 'activity.cardCommentCreateShort'}
          values={{
            user: activity.user.name,
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

      return (
        <Trans
          i18nKey={card ? 'activity.cardCommentUpdate' : 'activity.cardCommentUpdateShort'}
          values={{
            user: activity.user.name,
            prevComment: prevCardComment,
            comment: cardComment,
            card: cardName,
          }}
        >
          {isCardLinked ? <Link to={Paths.CARDS.replace(':id', card.id)} className={s.linked} onClick={onClose} /> : <span />}
          <span className={s.data} />
          <span className={s.data} />
        </Trans>
      );
    }

    case ActivityTypes.CARD_COMMENT_DELETE: {
      const cardName = isTruncated ? truncate(card?.name, { length: cardNameTruncateLength }) : card?.name;
      const cardComment = isTruncated ? truncate(activity.data.text, { length: commentTruncateLength }) : activity.data.text;

      return (
        <Trans
          i18nKey={card ? 'activity.cardCommentDelete' : 'activity.cardCommentDeleteShort'}
          values={{
            user: activity.user.name,
            comment: cardComment,
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
            user: activity.user.name,
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
            user: activity.user.name,
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
