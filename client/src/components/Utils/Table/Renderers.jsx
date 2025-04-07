/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';

import ActionsHeader from './ActionsHeader';
import BoolCell from './BoolCell';
import DateCell from './DateCell';
import DefaultCell from './DefaultCell';
import ImageCell from './ImageCell';
import MarkdownCell from './MarkdownCell';
import TableStyle from './TableStyle';

import * as ts from './Table.module.scss';

const listViewPropTypes = {
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

const listViewHeaderPropTypes = {
  table: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  column: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

function DefaultCellRenderer({ table, column, cell }) {
  return <DefaultCell value={cell.getValue()} title={cell.getValue()} cellClassName={ts[table.options.style]} {...column.columnDef.cellProps} />;
}
DefaultCellRenderer.propTypes = listViewPropTypes;

function NumberCellRenderer({ table, column, getValue }) {
  return <DefaultCell value={getValue()} title={getValue().toString()} cellClassName={ts[table.options.style]} {...column.columnDef.cellProps} />;
}
NumberCellRenderer.propTypes = listViewPropTypes;

function BoolCellRenderer({ table, column, getValue }) {
  return <BoolCell value={getValue()} cellClassName={ts[table.options.style]} {...column.columnDef.cellProps} />;
}
BoolCellRenderer.propTypes = listViewPropTypes;

function ImageCellRenderer({ table, column, getValue }) {
  return <ImageCell value={getValue()} cellClassName={ts[table.options.style]} {...column.columnDef.cellProps} />;
}
ImageCellRenderer.propTypes = listViewPropTypes;

function MarkdownCellRenderer({ table, column, getValue }) {
  return <MarkdownCell value={getValue()} cellClassName={ts[table.options.style]} {...column.columnDef.cellProps} />;
}
MarkdownCellRenderer.propTypes = listViewPropTypes;

function DateCellRenderer({ table, column, getValue }) {
  return <DateCell date={getValue()} cellClassName={ts[table.options.style]} {...column.columnDef.cellProps} />;
}
DateCellRenderer.propTypes = listViewPropTypes;

function ActionsHeaderRenderer({ table, column }) {
  return <ActionsHeader table={table} {...column.columnDef.headerProps} />;
}
ActionsHeaderRenderer.propTypes = listViewHeaderPropTypes;

export { DefaultCellRenderer, NumberCellRenderer, BoolCellRenderer, ImageCellRenderer, MarkdownCellRenderer, DateCellRenderer, ActionsHeaderRenderer };
