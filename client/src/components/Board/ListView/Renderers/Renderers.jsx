import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import ActionsCellContainer from '../../../../containers/ActionsCellContainer';
import DueDateCellContainer from '../../../../containers/DueDateCellContainer';
import LabelsCellContainer from '../../../../containers/LabelsCellContainer';
import MembersCellContainer from '../../../../containers/MembersCellContainer';
import TimerCellContainer from '../../../../containers/TimerCellContainer';
import ActionsHeader from '../ActionsHeader';
import BoolCell from '../BoolCell';
import DateCell from '../DateCell';
import DefaultCell from '../DefaultCell';
import ListViewStyle from '../ListViewStyle';

import * as s from './Renderers.module.scss';

const listViewPropTypes = {
  table: PropTypes.shape({
    options: PropTypes.shape({
      listViewStyle: PropTypes.oneOf(Object.values(ListViewStyle)).isRequired,
    }).isRequired,
  }).isRequired,
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      labels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
      users: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
      listName: PropTypes.string.isRequired,
      hasDescription: PropTypes.bool.isRequired,
      attachmentsCount: PropTypes.number.isRequired,
      commentCount: PropTypes.number.isRequired,
      dueDate: PropTypes.instanceOf(Date),
      timer: PropTypes.object, // eslint-disable-line react/forbid-prop-types
      createdAt: PropTypes.instanceOf(Date),
      updatedAt: PropTypes.instanceOf(Date),
    }).isRequired,
  }).isRequired,
  cell: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types, react/no-unused-prop-types
};

function DefaultCellRenderer({ table, cell }) {
  return <DefaultCell value={cell.getValue()} title={cell.getValue()} cellClassName={s[table.options.listViewStyle]} />;
}
DefaultCellRenderer.propTypes = listViewPropTypes;

function LabelsCellRenderer({ table, row }) {
  return <LabelsCellContainer id={row.original.id} labels={row.original.labels} cellClassName={s[table.options.listViewStyle]} />;
}
LabelsCellRenderer.propTypes = listViewPropTypes;

function MembersCellRenderer({ table, row }) {
  return <MembersCellContainer id={row.original.id} users={row.original.users} cellClassName={s[table.options.listViewStyle]} />;
}
MembersCellRenderer.propTypes = listViewPropTypes;

function ListNameCellRenderer({ table, row }) {
  return <DefaultCell value={row.original.listName} title={row.original.listName} cellClassName={s[table.options.listViewStyle]} />;
}
ListNameCellRenderer.propTypes = listViewPropTypes;

function HasDescriptionCellRenderer({ table, row }) {
  const [t] = useTranslation();
  return <BoolCell value={row.original.hasDescription} title={t('common.detailsDescription')} cellClassName={s[table.options.listViewStyle]} />;
}
HasDescriptionCellRenderer.propTypes = listViewPropTypes;

function AttachmentsCountCellRenderer({ table, row }) {
  const [t] = useTranslation();
  return <DefaultCell value={row.original.attachmentsCount} title={t('common.detailsAttachments', { count: row.original.attachmentsCount })} cellClassName={s[table.options.listViewStyle]} />;
}
AttachmentsCountCellRenderer.propTypes = listViewPropTypes;

function CommentCountCellRenderer({ table, row }) {
  const [t] = useTranslation();
  return <DefaultCell value={row.original.commentCount} title={t('common.detailsComments', { count: row.original.commentCount })} cellClassName={s[table.options.listViewStyle]} />;
}

CommentCountCellRenderer.propTypes = listViewPropTypes;

function DueDateCellRenderer({ table, row }) {
  return <DueDateCellContainer id={row.original.id} dueDate={row.original.dueDate} cellClassName={s[table.options.listViewStyle]} />;
}

DueDateCellRenderer.propTypes = listViewPropTypes;

function TimerCellRenderer({ table, row }) {
  return <TimerCellContainer id={row.original.id} timer={row.original.timer} cellClassName={s[table.options.listViewStyle]} />;
}

TimerCellRenderer.propTypes = listViewPropTypes;

function DateCellRenderer({ table, cell }) {
  return <DateCell date={cell.getValue()} cellClassName={s[table.options.listViewStyle]} />;
}
DateCellRenderer.propTypes = listViewPropTypes;

function ActionsHeaderRenderer({ table }, handleResetColumnSortingClick, handleResetColumnWidths, handleResetColumnVisibilityClick) {
  return <ActionsHeader table={table} onResetColumnSorting={handleResetColumnSortingClick} onResetColumnWidths={handleResetColumnWidths} onResetColumnVisibility={handleResetColumnVisibilityClick} />;
}
ActionsHeaderRenderer.propTypes = listViewPropTypes;

function ActionsCellRenderer({ row }) {
  return <ActionsCellContainer id={row.original.id} />;
}
ActionsCellRenderer.propTypes = listViewPropTypes;

export {
  DefaultCellRenderer,
  LabelsCellRenderer,
  MembersCellRenderer,
  ListNameCellRenderer,
  HasDescriptionCellRenderer,
  AttachmentsCountCellRenderer,
  CommentCountCellRenderer,
  DueDateCellRenderer,
  TimerCellRenderer,
  DateCellRenderer,
  ActionsCellRenderer,
  ActionsHeaderRenderer,
};
