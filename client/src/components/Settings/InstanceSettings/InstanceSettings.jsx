import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { Radio, RadioSize, Table } from '../../Utils';

import * as gs from '../../../global.module.scss';
import * as sShared from '../SettingsShared.module.scss';
import * as s from './InstanceSettings.module.scss';

const InstanceSettings = React.memo(({ registrationEnabled, localRegistrationEnabled, ssoRegistrationEnabled, demoMode, onCoreSettingsUpdate }) => {
  const [t] = useTranslation();
  const tableRef = useRef(null);

  const handleRegistrationEnabledChange = useCallback(() => {
    onCoreSettingsUpdate({
      registrationEnabled: !registrationEnabled,
    });
  }, [onCoreSettingsUpdate, registrationEnabled]);

  const handleLocalRegistrationEnabledChange = useCallback(() => {
    onCoreSettingsUpdate({
      localRegistrationEnabled: !localRegistrationEnabled,
    });
  }, [localRegistrationEnabled, onCoreSettingsUpdate]);

  const handleSsoRegistrationEnabledChange = useCallback(() => {
    onCoreSettingsUpdate({
      ssoRegistrationEnabled: !ssoRegistrationEnabled,
    });
  }, [onCoreSettingsUpdate, ssoRegistrationEnabled]);

  const data = useMemo(
    () => [
      {
        id: 'enableRegistration',
        instanceSettings: t('common.enableRegistration'),
        modifySettings: <Radio size={RadioSize.Size12} checked={registrationEnabled} disabled={demoMode} onChange={handleRegistrationEnabledChange} title={t('common.toggleUserRegistration')} />,
        currentValue: registrationEnabled ? t('common.enabled') : t('common.disabled'),
        description: t('common.descriptionUserRegistration'),
      },
      {
        id: 'enableLocalRegistration',
        instanceSettings: t('common.enableLocalRegistration'),
        modifySettings: (
          <Radio
            size={RadioSize.Size12}
            checked={registrationEnabled && localRegistrationEnabled}
            disabled={!registrationEnabled || demoMode}
            onChange={handleLocalRegistrationEnabledChange}
            title={t('common.toggleLocalUserRegistration')}
          />
        ),
        currentValue: registrationEnabled && localRegistrationEnabled ? t('common.enabled') : t('common.disabled'),
        description: t('common.descriptionLocalRegistration'),
      },
      {
        id: 'enableSsoRegistration',
        instanceSettings: t('common.enableSsoRegistration'),
        modifySettings: (
          <Radio
            size={RadioSize.Size12}
            checked={registrationEnabled && ssoRegistrationEnabled}
            disabled={!registrationEnabled || demoMode}
            onChange={handleSsoRegistrationEnabledChange}
            title={t('common.toggleSsoUserRegistration')}
          />
        ),
        currentValue: registrationEnabled && ssoRegistrationEnabled ? t('common.enabled') : t('common.disabled'),
        description: t('common.descriptionSsoRegistration'),
      },
    ],
    [demoMode, handleLocalRegistrationEnabledChange, handleRegistrationEnabledChange, handleSsoRegistrationEnabledChange, localRegistrationEnabled, registrationEnabled, ssoRegistrationEnabled, t],
  );

  const table = useReactTable({
    data,
    columns: [],
    getCoreRowModel: getCoreRowModel(),
    style: Table.Style.Default,
  });

  const { handleResetColumnWidthsClick } = Table.HooksPre(tableRef, table);

  const resetColumnsWidths = useCallback(() => {
    handleResetColumnWidthsClick(false, true);
  }, [handleResetColumnWidthsClick]);

  useEffect(() => {
    resetColumnsWidths();
  }, [resetColumnsWidths]);

  useEffect(() => {
    window.addEventListener('resize', resetColumnsWidths);

    return () => {
      window.removeEventListener('resize', resetColumnsWidths);
    };
  }, [resetColumnsWidths]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'instanceSettings',
        header: t('common.instanceSettings'),
        cell: Table.Renderers.DefaultCellRenderer,
        enableSorting: false,
        meta: { headerTitle: t('common.instanceSettings') },
        cellProps: { cellClassNameInner: s.cell },
      },
      {
        accessorKey: 'modifySettings',
        header: t('common.modifySettings'),
        cell: Table.Renderers.DivCellRenderer,
        enableSorting: false,
        meta: { headerTitle: t('common.modifySettings'), suggestedSize: 200 },
        cellProps: { ariaLabel: t('common.toggleSettings') },
      },
      {
        accessorKey: 'currentValue',
        header: t('common.currentValue'),
        cell: Table.Renderers.DefaultCellRenderer,
        enableSorting: false,
        meta: { headerTitle: t('common.currentValue') },
        cellProps: { cellClassNameInner: s.cell },
      },
      {
        accessorKey: 'description',
        header: t('common.description'),
        cell: Table.Renderers.DefaultCellRenderer,
        enableSorting: false,
        meta: { headerTitle: t('common.description') },
        cellProps: { cellClassNameInner: s.cell },
      },
    ],
    [t],
  );

  table.setOptions((prev) => ({ ...prev, columns }));

  return (
    <div className={sShared.wrapper}>
      <div className={sShared.header}>
        <div className={sShared.headerFlex}>
          <h2 className={sShared.headerText}>{t('common.settings')}</h2>
        </div>
        {demoMode && <p className={sShared.demoMode}>{t('common.demoModeExplanation')}</p>}
      </div>
      <Table.Container className={s.container}>
        <Table.Wrapper className={classNames(gs.scrollableX)}>
          <Table ref={tableRef} style={{ width: `${table.getCenterTotalSize()}px` }}>
            <Table.Header style={Table.Style.Default}>
              {table.getHeaderGroups().map((headerGroup) => (
                <Table.HeaderRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => (
                    <Table.HeaderCell key={header.id} style={{ width: `${header.getSize()}px` }} colSpan={header.colSpan} title={header.column.columnDef.meta?.headerTitle} isCentered>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {index + 1 < headerGroup.headers.length && <Table.Resizer />}
                    </Table.HeaderCell>
                  ))}
                </Table.HeaderRow>
              ))}
            </Table.Header>
            <Table.Body className={classNames(gs.scrollableY)} style={Table.Style.Default}>
              {table.getRowModel().rows.map((row) => (
                <Table.Row key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <Table.Cell key={cell.id} style={{ width: `${cell.column.getSize()}px` }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Table.Wrapper>
      </Table.Container>
    </div>
  );
});

InstanceSettings.propTypes = {
  registrationEnabled: PropTypes.bool.isRequired,
  localRegistrationEnabled: PropTypes.bool.isRequired,
  ssoRegistrationEnabled: PropTypes.bool.isRequired,
  demoMode: PropTypes.bool.isRequired,
  onCoreSettingsUpdate: PropTypes.func.isRequired,
};

export default InstanceSettings;
