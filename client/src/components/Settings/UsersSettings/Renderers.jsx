/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';

import ActionsCellContainer from '../../../containers/UsersSettings/ActionsCellContainer';
import NameCellContainer from '../../../containers/UsersSettings/NameCellContainer';
import UserAvatarCellContainer from '../../../containers/UsersSettings/UserAvatarCellContainer';
import { Table } from '../../Utils';

import * as ts from '../../Utils/Table/Table.module.scss';

const usersSettingsPropTypes = {
  table: PropTypes.shape({
    options: PropTypes.shape({
      style: PropTypes.oneOf(Object.values(Table.Style)).isRequired,
    }).isRequired,
  }).isRequired,
  column: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      avatar: PropTypes.string,
      name: PropTypes.string.isRequired,
      username: PropTypes.string,
      email: PropTypes.string.isRequired,
      administrator: PropTypes.bool.isRequired,
      ssoGoogleEmail: PropTypes.string,
      lastLogin: PropTypes.instanceOf(Date),
    }).isRequired,
  }).isRequired,
  cell: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  getValue: PropTypes.func.isRequired,
};

function ActionsCellRenderer({ table, row, column }) {
  return <ActionsCellContainer id={row.original.id} cellClassName={ts[table.options.style]} {...column.columnDef.cellProps} />;
}
ActionsCellRenderer.propTypes = usersSettingsPropTypes;

function NameCellRenderer({ table, row, column, getValue }) {
  return <NameCellContainer id={row.original.id} name={getValue()} title={getValue()} cellClassName={ts[table.options.style]} {...column.columnDef.cellProps} />;
}
NameCellRenderer.propTypes = usersSettingsPropTypes;

function UserAvatarRenderer({ table, row, column, getValue }) {
  return <UserAvatarCellContainer id={row.original.id} avatarUrl={getValue()} name={row.original.name} title={getValue()} cellClassName={ts[table.options.style]} {...column.columnDef.cellProps} />;
}
UserAvatarRenderer.propTypes = usersSettingsPropTypes;

export { ActionsCellRenderer, NameCellRenderer, UserAvatarRenderer };
