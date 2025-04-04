import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import ActionsCellContainer from '../../../../containers/ActionsCellContainer';
import DueDateCellContainer from '../../../../containers/DueDateCellContainer';
import LabelsCellContainer from '../../../../containers/LabelsCellContainer';
import MembersCellContainer from '../../../../containers/MembersCellContainer';
import TasksCellContainer from '../../../../containers/TasksCellContainer';
import TimerCellContainer from '../../../../containers/TimerCellContainer';
import ActionsHeader from '../ActionsHeader';
import BoolCell from '../BoolCell';
import DateCell from '../DateCell';
import DefaultCell from '../DefaultCell';
import ImageCell from '../ImageCell';
import ListViewStyle from '../ListViewStyle';
import MarkdownCell from '../MarkdownCell';

import * as s from './Renderers.module.scss';

const listViewPropTypes = {
  table: PropTypes.shape({
    options: PropTypes.shape({
      listViewStyle: PropTypes.oneOf(Object.values(ListViewStyle)).isRequired,
    }).isRequired,
  }).isRequired,
  column: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      coverUrl: PropTypes.string,
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
      tasks: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
      notificationsCount: PropTypes.number.isRequired,
      description: PropTypes.string,
    }).isRequired,
  }).isRequired,
  cell: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  getValue: PropTypes.func.isRequired,
};

const listViewHeaderPropTypes = {
  table: PropTypes.shape({
    options: PropTypes.shape({
      listViewStyle: PropTypes.oneOf(Object.values(ListViewStyle)).isRequired,
    }).isRequired,
  }).isRequired,
  column: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

function DefaultCellRenderer({ table, column, cell }) {
  return <DefaultCell value={cell.getValue()} title={cell.getValue()} cellClassName={s[table.options.listViewStyle]} {...column.columnDef.cellProps} />; // eslint-disable-line react/jsx-props-no-spreading
}
DefaultCellRenderer.propTypes = listViewPropTypes;

function NumberCellRenderer({ table, column, getValue }) {
  return <DefaultCell value={getValue()} title={getValue().toString()} cellClassName={s[table.options.listViewStyle]} {...column.columnDef.cellProps} />; // eslint-disable-line react/jsx-props-no-spreading
}
NumberCellRenderer.propTypes = listViewPropTypes;

function ImageCellRenderer({ table, column, getValue }) {
  return <ImageCell value={getValue()} cellClassName={s[table.options.listViewStyle]} {...column.columnDef.cellProps} />; // eslint-disable-line react/jsx-props-no-spreading
}
ImageCellRenderer.propTypes = listViewPropTypes;

function MarkdownCellRenderer({ table, column, cell }) {
  return <MarkdownCell value={cell.getValue()} cellClassName={s[table.options.listViewStyle]} {...column.columnDef.cellProps} />; // eslint-disable-line react/jsx-props-no-spreading
}
MarkdownCellRenderer.propTypes = listViewPropTypes;

function LabelsCellRenderer({ table, column, row }) {
  return <LabelsCellContainer id={row.original.id} labels={row.original.labels} cellClassName={s[table.options.listViewStyle]} {...column.columnDef.cellProps} />; // eslint-disable-line react/jsx-props-no-spreading
}
LabelsCellRenderer.propTypes = listViewPropTypes;

function MembersCellRenderer({ table, column, row }) {
  return <MembersCellContainer id={row.original.id} users={row.original.users} cellClassName={s[table.options.listViewStyle]} {...column.columnDef.cellProps} />; // eslint-disable-line react/jsx-props-no-spreading
}
MembersCellRenderer.propTypes = listViewPropTypes;

function ListNameCellRenderer({ table, column, row }) {
  return <DefaultCell value={row.original.listName} title={row.original.listName} cellClassName={s[table.options.listViewStyle]} {...column.columnDef.cellProps} />; // eslint-disable-line react/jsx-props-no-spreading
}
ListNameCellRenderer.propTypes = listViewPropTypes;

function HasDescriptionCellRenderer({ table, column, row }) {
  const [t] = useTranslation();
  return <BoolCell value={row.original.hasDescription} title={t('common.detailsDescription')} cellClassName={s[table.options.listViewStyle]} {...column.columnDef.cellProps} />; // eslint-disable-line react/jsx-props-no-spreading
}
HasDescriptionCellRenderer.propTypes = listViewPropTypes;

function DueDateCellRenderer({ table, column, row }) {
  return <DueDateCellContainer id={row.original.id} dueDate={row.original.dueDate} cellClassName={s[table.options.listViewStyle]} {...column.columnDef.cellProps} />; // eslint-disable-line react/jsx-props-no-spreading
}
DueDateCellRenderer.propTypes = listViewPropTypes;

function TimerCellRenderer({ table, column, row }) {
  return <TimerCellContainer id={row.original.id} timer={row.original.timer} cellClassName={s[table.options.listViewStyle]} {...column.columnDef.cellProps} />; // eslint-disable-line react/jsx-props-no-spreading
}
TimerCellRenderer.propTypes = listViewPropTypes;

function TasksCellRenderer({ table, column, row, cell }) {
  return <TasksCellContainer id={row.original.id} tasks={cell.getValue()} cellClassName={s[table.options.listViewStyle]} {...column.columnDef.cellProps} />; // eslint-disable-line react/jsx-props-no-spreading
}
TasksCellRenderer.propTypes = listViewPropTypes;

function DateCellRenderer({ table, column, cell }) {
  return <DateCell date={cell.getValue()} cellClassName={s[table.options.listViewStyle]} {...column.columnDef.cellProps} />; // eslint-disable-line react/jsx-props-no-spreading
}
DateCellRenderer.propTypes = listViewPropTypes;

function ActionsHeaderRenderer({ table, column }) {
  return (
    <ActionsHeader
      table={table}
      {...column.columnDef.headerProps} // eslint-disable-line react/jsx-props-no-spreading
    />
  );
}
ActionsHeaderRenderer.propTypes = listViewHeaderPropTypes;

function ActionsCellRenderer({ row, column }) {
  return <ActionsCellContainer id={row.original.id} {...column.columnDef.cellProps} />; // eslint-disable-line react/jsx-props-no-spreading
}
ActionsCellRenderer.propTypes = listViewPropTypes;

export {
  DefaultCellRenderer,
  NumberCellRenderer,
  ImageCellRenderer,
  MarkdownCellRenderer,
  LabelsCellRenderer,
  MembersCellRenderer,
  ListNameCellRenderer,
  HasDescriptionCellRenderer,
  DueDateCellRenderer,
  TimerCellRenderer,
  TasksCellRenderer,
  DateCellRenderer,
  ActionsCellRenderer,
  ActionsHeaderRenderer,
};
