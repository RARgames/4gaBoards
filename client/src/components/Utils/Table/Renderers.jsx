/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';

import ActionsHeader from './ActionsHeader';
import BoolCell from './BoolCell';
import DateCell from './DateCell';
import DefaultCell from './DefaultCell';
import ImageCell from './ImageCell';
import MarkdownCell from './MarkdownCell';
import RadioCell from './RadioCell';
import SettingsCell from './SettingsCell';
import TableStyle from './TableStyle';

import * as ts from './Table.module.scss';

const listPropTypes = {
  table: PropTypes.shape({
    options: PropTypes.shape({
      style: PropTypes.oneOf(Object.values(TableStyle)).isRequired,
    }).isRequired,
  }).isRequired,
  column: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  row: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  cell: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  getValue: PropTypes.func.isRequired,
};

const listHeaderPropTypes = {
  table: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  column: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

function DefaultCellRenderer({ table, column, cell }) {
  return <DefaultCell value={cell.getValue()} title={cell.getValue()} cellClassName={ts[table.options.style]} {...column.columnDef.cellProps} />;
}
DefaultCellRenderer.propTypes = listPropTypes;

function NumberCellRenderer({ table, column, getValue }) {
  return <DefaultCell value={getValue()} title={getValue().toString()} cellClassName={ts[table.options.style]} {...column.columnDef.cellProps} />;
}
NumberCellRenderer.propTypes = listPropTypes;

function BoolCellRenderer({ table, column, getValue }) {
  return <BoolCell value={getValue()} cellClassName={ts[table.options.style]} {...column.columnDef.cellProps} />;
}
BoolCellRenderer.propTypes = listPropTypes;

function SettingsCellRenderer({ table, column, row, cell }) {
  const props = row.original?.[`${column.id}Props`];
  return <SettingsCell value={cell.getValue()} cellClassName={ts[table.options.style]} {...column.columnDef.cellProps} {...props} />;
}
SettingsCellRenderer.propTypes = listPropTypes;

function ImageCellRenderer({ table, column, getValue }) {
  return <ImageCell value={getValue()} cellClassName={ts[table.options.style]} {...column.columnDef.cellProps} />;
}
ImageCellRenderer.propTypes = listPropTypes;

function MarkdownCellRenderer({ table, column, getValue }) {
  return <MarkdownCell value={getValue()} cellClassName={ts[table.options.style]} {...column.columnDef.cellProps} />;
}
MarkdownCellRenderer.propTypes = listPropTypes;

function DateCellRenderer({ table, column, getValue }) {
  return <DateCell date={getValue()} cellClassName={ts[table.options.style]} {...column.columnDef.cellProps} />;
}
DateCellRenderer.propTypes = listPropTypes;

function RadioCellRenderer({ table, column, row, getValue }) {
  return <RadioCell id={row.original.id} checked={getValue()} cellClassName={ts[table.options.style]} {...column.columnDef.cellProps} />;
}
RadioCellRenderer.propTypes = listPropTypes;

function ActionsHeaderRenderer({ table, column }) {
  return <ActionsHeader table={table} {...column.columnDef.headerProps} />;
}
ActionsHeaderRenderer.propTypes = listHeaderPropTypes;

export { DefaultCellRenderer, NumberCellRenderer, BoolCellRenderer, SettingsCellRenderer, ImageCellRenderer, MarkdownCellRenderer, DateCellRenderer, RadioCellRenderer, ActionsHeaderRenderer };
