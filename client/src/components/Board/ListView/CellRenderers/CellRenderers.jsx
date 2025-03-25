import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import ActionsCellContainer from '../../../../containers/ActionsCellContainer';
import DueDateCellContainer from '../../../../containers/DueDateCellContainer';
import LabelsCellContainer from '../../../../containers/LabelsCellContainer';
import TimerCellContainer from '../../../../containers/TimerCellContainer';
import BoolCell from '../BoolCell';
import DefaultCell from '../DefaultCell';

import * as s from './CellRenderers.module.scss';

function NameCellRenderer({ row }) {
  return <DefaultCell value={row.original.name} title={row.original.name} cellClassName={s.cellDefault} />;
}

NameCellRenderer.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

function LabelsCellRenderer({ row }) {
  return <LabelsCellContainer id={row.original.id} labels={row.original.labels} cellClassName={s.cellDefault} />;
}

LabelsCellRenderer.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      labels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    }).isRequired,
  }).isRequired,
};

function ListNameCellRenderer({ row }) {
  return <DefaultCell value={row.original.listName} title={row.original.listName} cellClassName={s.cellDefault} />;
}

ListNameCellRenderer.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      listName: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

function HasDescriptionCellRenderer({ row }) {
  const [t] = useTranslation();
  return <BoolCell value={row.original.hasDescription} title={t('common.detailsDescription')} cellClassName={s.cellDefault} />;
}

HasDescriptionCellRenderer.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      hasDescription: PropTypes.bool.isRequired,
    }).isRequired,
  }).isRequired,
};

function AttachmentsCountCellRenderer({ row }) {
  const [t] = useTranslation();
  return <DefaultCell value={row.original.attachmentsCount} title={t('common.detailsAttachments', { count: row.original.attachmentsCount })} cellClassName={s.cellDefault} />;
}

AttachmentsCountCellRenderer.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      attachmentsCount: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};

function CommentCountCellRenderer({ row }) {
  const [t] = useTranslation();
  return <DefaultCell value={row.original.commentCount} title={t('common.detailsComments', { count: row.original.commentCount })} cellClassName={s.cellDefault} />;
}

CommentCountCellRenderer.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      commentCount: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};

function DueDateCellRenderer({ row }) {
  return <DueDateCellContainer id={row.original.id} dueDate={row.original.dueDate} cellClassName={s.cellDefault} />;
}

DueDateCellRenderer.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      dueDate: PropTypes.instanceOf(Date),
    }).isRequired,
  }).isRequired,
};

function TimerCellRenderer({ row }) {
  return <TimerCellContainer id={row.original.id} timer={row.original.timer} cellClassName={s.cellDefault} />;
}

TimerCellRenderer.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      timer: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    }).isRequired,
  }).isRequired,
};

function ActionsCellRenderer({ row }) {
  return <ActionsCellContainer id={row.original.id} />;
}

ActionsCellRenderer.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export {
  NameCellRenderer,
  LabelsCellRenderer,
  ListNameCellRenderer,
  HasDescriptionCellRenderer,
  AttachmentsCountCellRenderer,
  CommentCountCellRenderer,
  DueDateCellRenderer,
  TimerCellRenderer,
  ActionsCellRenderer,
};
