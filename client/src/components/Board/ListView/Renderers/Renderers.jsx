/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
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
  return <DefaultCell value={cell.getValue()} title={cell.getValue()} cellClassName={s[table.options.listViewStyle]} {...column.columnDef.cellProps} />;
}
DefaultCellRenderer.propTypes = listViewPropTypes;

function NumberCellRenderer({ table, column, getValue }) {
  return <DefaultCell value={getValue()} title={getValue().toString()} cellClassName={s[table.options.listViewStyle]} {...column.columnDef.cellProps} />;
}
NumberCellRenderer.propTypes = listViewPropTypes;

function BoolCellRenderer({ table, column, getValue }) {
  return <BoolCell value={getValue()} cellClassName={s[table.options.listViewStyle]} {...column.columnDef.cellProps} />;
}
BoolCellRenderer.propTypes = listViewPropTypes;

function ImageCellRenderer({ table, column, getValue }) {
  return <ImageCell value={getValue()} cellClassName={s[table.options.listViewStyle]} {...column.columnDef.cellProps} />;
}
ImageCellRenderer.propTypes = listViewPropTypes;

function MarkdownCellRenderer({ table, column, getValue }) {
  return <MarkdownCell value={getValue()} cellClassName={s[table.options.listViewStyle]} {...column.columnDef.cellProps} />;
}
MarkdownCellRenderer.propTypes = listViewPropTypes;

function LabelsCellRenderer({ table, column, row, getValue }) {
  return <LabelsCellContainer id={row.original.id} labels={getValue()} cellClassName={s[table.options.listViewStyle]} {...column.columnDef.cellProps} />;
}
LabelsCellRenderer.propTypes = listViewPropTypes;

function MembersCellRenderer({ table, column, row, getValue }) {
  return <MembersCellContainer id={row.original.id} users={getValue()} cellClassName={s[table.options.listViewStyle]} {...column.columnDef.cellProps} />;
}
MembersCellRenderer.propTypes = listViewPropTypes;

function ListNameCellRenderer({ table, column, getValue }) {
  return <DefaultCell value={getValue()} title={getValue()} cellClassName={s[table.options.listViewStyle]} {...column.columnDef.cellProps} />;
}
ListNameCellRenderer.propTypes = listViewPropTypes;

function DueDateCellRenderer({ table, column, row, getValue }) {
  return <DueDateCellContainer id={row.original.id} dueDate={getValue()} cellClassName={s[table.options.listViewStyle]} {...column.columnDef.cellProps} />;
}
DueDateCellRenderer.propTypes = listViewPropTypes;

function TimerCellRenderer({ table, column, row, getValue }) {
  return <TimerCellContainer id={row.original.id} timer={getValue()} cellClassName={s[table.options.listViewStyle]} {...column.columnDef.cellProps} />;
}
TimerCellRenderer.propTypes = listViewPropTypes;

function TasksCellRenderer({ table, column, row, getValue }) {
  return <TasksCellContainer id={row.original.id} tasks={getValue()} cellClassName={s[table.options.listViewStyle]} {...column.columnDef.cellProps} />;
}
TasksCellRenderer.propTypes = listViewPropTypes;

function DateCellRenderer({ table, column, getValue }) {
  return <DateCell date={getValue()} cellClassName={s[table.options.listViewStyle]} {...column.columnDef.cellProps} />;
}
DateCellRenderer.propTypes = listViewPropTypes;

function ActionsHeaderRenderer({ table, column }) {
  return <ActionsHeader table={table} {...column.columnDef.headerProps} />;
}
ActionsHeaderRenderer.propTypes = listViewHeaderPropTypes;

function ActionsCellRenderer({ row, column }) {
  return <ActionsCellContainer id={row.original.id} {...column.columnDef.cellProps} />;
}
ActionsCellRenderer.propTypes = listViewPropTypes;

export {
  DefaultCellRenderer,
  NumberCellRenderer,
  BoolCellRenderer,
  ImageCellRenderer,
  MarkdownCellRenderer,
  LabelsCellRenderer,
  MembersCellRenderer,
  ListNameCellRenderer,
  DueDateCellRenderer,
  TimerCellRenderer,
  TasksCellRenderer,
  DateCellRenderer,
  ActionsCellRenderer,
  ActionsHeaderRenderer,
};
