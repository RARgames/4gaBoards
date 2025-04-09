/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';

import ActionsCellContainer from '../../../containers/ActionsCellContainer';
import DueDateCellContainer from '../../../containers/DueDateCellContainer';
import LabelsCellContainer from '../../../containers/LabelsCellContainer';
import ListNameCellContainer from '../../../containers/ListNameCellContainer';
import MembersCellContainer from '../../../containers/MembersCellContainer';
import NameCellContainer from '../../../containers/NameCellContainer';
import TasksCellContainer from '../../../containers/TasksCellContainer';
import TimerCellContainer from '../../../containers/TimerCellContainer';
import { Table } from '../../Utils';

import * as ts from '../../Utils/Table/Table.module.scss';

const listViewPropTypes = {
  table: PropTypes.shape({
    options: PropTypes.shape({
      style: PropTypes.oneOf(Object.values(Table.Style)).isRequired,
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

function NameCellRenderer({ table, column, row, getValue }) {
  return <NameCellContainer id={row.original.id} defaultValue={getValue()} cellClassName={ts[table.options.style]} {...column.columnDef.cellProps} />;
}
NameCellRenderer.propTypes = listViewPropTypes;

function LabelsCellRenderer({ table, column, row, getValue }) {
  return <LabelsCellContainer id={row.original.id} labels={getValue()} cellClassName={ts[table.options.style]} {...column.columnDef.cellProps} />;
}
LabelsCellRenderer.propTypes = listViewPropTypes;

function MembersCellRenderer({ table, column, row, getValue }) {
  return <MembersCellContainer id={row.original.id} users={getValue()} cellClassName={ts[table.options.style]} {...column.columnDef.cellProps} />;
}
MembersCellRenderer.propTypes = listViewPropTypes;

function ListNameCellRenderer({ table, column, row, getValue }) {
  return <ListNameCellContainer id={row.original.id} value={getValue()} cellClassName={ts[table.options.style]} {...column.columnDef.cellProps} />;
}
ListNameCellRenderer.propTypes = listViewPropTypes;

function DueDateCellRenderer({ table, column, row, getValue }) {
  return <DueDateCellContainer id={row.original.id} dueDate={getValue()} cellClassName={ts[table.options.style]} {...column.columnDef.cellProps} />;
}
DueDateCellRenderer.propTypes = listViewPropTypes;

function TimerCellRenderer({ table, column, row, getValue }) {
  return <TimerCellContainer id={row.original.id} timer={getValue()} cellClassName={ts[table.options.style]} {...column.columnDef.cellProps} />;
}
TimerCellRenderer.propTypes = listViewPropTypes;

function TasksCellRenderer({ table, column, row, getValue }) {
  return <TasksCellContainer id={row.original.id} tasks={getValue()} cellClassName={ts[table.options.style]} {...column.columnDef.cellProps} />;
}
TasksCellRenderer.propTypes = listViewPropTypes;

function ActionsCellRenderer({ table, row, column }) {
  return <ActionsCellContainer id={row.original.id} cellClassName={ts[table.options.style]} {...column.columnDef.cellProps} />;
}
ActionsCellRenderer.propTypes = listViewPropTypes;

export { NameCellRenderer, LabelsCellRenderer, MembersCellRenderer, ListNameCellRenderer, DueDateCellRenderer, TimerCellRenderer, TasksCellRenderer, ActionsCellRenderer };
