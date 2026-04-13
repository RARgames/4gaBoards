import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { getActivityTransProps } from '@4gaboards/locales/renderer';
import PropTypes from 'prop-types';

import Paths from '../../constants/Paths';
import { ExternalLink } from '../Utils';

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

  const transProps = getActivityTransProps(t, activity, {
    boardNameTruncateLength,
    cardNameTruncateLength,
    commentTruncateLength,
    defaultTruncateLength,
    descriptionTruncateLength,
    hideBoardDetails,
    hideCardDetails,
    hideLabelDetails,
    hideListDetails,
    hideProjectDetails,
    isDescriptionTruncated,
    isTruncated,
    listNameTruncateLength,
    projectNameTruncateLength,
    taskNameTruncateLength,
    userNameTruncateLength,
  });
  if (!transProps) {
    return null;
  }

  const components = {};

  (transProps.components || []).forEach(({ slot, title = '' }) => {
    let node;

    if (slot === 'user') {
      node = <span className={s.data} title={title} />;
    } else if (slot === 'project') {
      if (activity.project) {
        node = <Link to={Paths.PROJECTS.replace(':id', activity.project.id)} className={s.linked} title={title} onClick={onClose} />;
      } else {
        node = <Link to={Paths.PROJECTS.replace(':id', activity.projectId)} className={s.linkedDeleted} title={t('activity.deletedProject', { project: title })} onClick={onClose} />;
      }
    } else if (slot === 'card') {
      if (activity.card) {
        node = <Link to={Paths.CARDS.replace(':id', activity.card.id)} className={s.linked} title={title} onClick={onClose} />;
      } else {
        node = <Link to={Paths.CARDS.replace(':id', activity.cardId)} className={s.linkedDeleted} title={t('activity.deletedCard', { card: title })} onClick={onClose} />;
      }
    } else if (slot === 'board') {
      if (activity.board) {
        node = <Link to={Paths.BOARDS.replace(':id', activity.board.id)} className={s.linked} title={title} onClick={onClose} />;
      } else {
        node = <Link to={Paths.BOARDS.replace(':id', activity.boardId)} className={s.linkedDeleted} title={t('activity.deletedBoard', { board: title })} onClick={onClose} />;
      }
    } else if (slot.toLowerCase().includes('mail')) {
      if (title) {
        node = <ExternalLink href={`mailto:${title}`} className={s.linked} title={title} />;
      } else {
        node = <span className={s.data} title={title} />;
      }
    } else {
      node = <span className={s.data} title={title} />;
    }

    if (node) {
      components[slot] = node;
    }
  });

  return <Trans i18nKey={transProps.i18nKey} values={transProps.values} components={components} />;
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
