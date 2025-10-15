import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import clsx from 'clsx';
import uniq from 'lodash/uniq';
import PropTypes from 'prop-types';

import { useForm } from '../../../hooks';
import { Table } from '../../Utils';

import * as gs from '../../../global.module.scss';
import * as sShared from '../SettingsShared.module.scss';
import * as s from './InstanceSettings.module.scss';

const InstanceSettings = React.memo(
  ({ registrationEnabled, localRegistrationEnabled, ssoRegistrationEnabled, projectCreationAllEnabled, syncSsoDataOnAuth, syncSsoAdminOnAuth, demoMode, allowedRegisterDomains, onCoreSettingsUpdate }) => {
    const [t] = useTranslation();
    const tableRef = useRef(null);
    const [allowedRegisterDomainsData, handleAllowedRegisterDomainsFieldChange] = useForm(() => ({
      text: allowedRegisterDomains,
    }));
    const [isErrorAllowedRegisterDomains, setIsErrorAllowedRegisterDomains] = useState(false);

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

    const handleProjectCreationAllEnabledChange = useCallback(() => {
      onCoreSettingsUpdate({
        projectCreationAllEnabled: !projectCreationAllEnabled,
      });
    }, [onCoreSettingsUpdate, projectCreationAllEnabled]);

    const handleSyncSsoDataOnAuthChange = useCallback(() => {
      onCoreSettingsUpdate({
        syncSsoDataOnAuth: !syncSsoDataOnAuth,
      });
    }, [onCoreSettingsUpdate, syncSsoDataOnAuth]);

    const handleSyncSsoAdminOnAuthChange = useCallback(() => {
      onCoreSettingsUpdate({
        syncSsoAdminOnAuth: !syncSsoAdminOnAuth,
      });
    }, [onCoreSettingsUpdate, syncSsoAdminOnAuth]);

    const handleAllowedRegisterDomainsSubmit = useCallback(
      (e) => {
        const allowedDomains = uniq(
          e.target.value
            .split(';')
            .map((d) => d.trim())
            .filter(Boolean),
        );
        const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
        const isValid = allowedDomains.every((d) => domainRegex.test(d));

        if (!isValid) {
          setIsErrorAllowedRegisterDomains(true);
          return;
        }

        onCoreSettingsUpdate({ allowedRegisterDomains: allowedDomains });
        handleAllowedRegisterDomainsFieldChange({ target: { name: 'text', value: allowedDomains.join(';') } });
      },
      [handleAllowedRegisterDomainsFieldChange, onCoreSettingsUpdate],
    );

    const handleAllowedRegisterDomainsChange = useCallback(
      (e) => {
        setIsErrorAllowedRegisterDomains(false);
        handleAllowedRegisterDomainsFieldChange(e);
      },
      [handleAllowedRegisterDomainsFieldChange],
    );

    const data = useMemo(
      () => [
        {
          id: 'enableRegistration',
          instanceSettings: t('common.enableRegistration'),
          modifySettings: registrationEnabled,
          modifySettingsProps: { onChange: handleRegistrationEnabledChange, disabled: demoMode, title: t('common.toggleUserRegistration') },
          currentValue: registrationEnabled ? t('common.enabled') : t('common.disabled'),
          description: t('common.descriptionUserRegistration'),
        },
        {
          id: 'enableLocalRegistration',
          instanceSettings: t('common.enableLocalRegistration'),
          modifySettings: registrationEnabled && localRegistrationEnabled,
          modifySettingsProps: { onChange: handleLocalRegistrationEnabledChange, disabled: !registrationEnabled || demoMode, title: t('common.toggleLocalUserRegistration') },
          currentValue: registrationEnabled && localRegistrationEnabled ? t('common.enabled') : t('common.disabled'),
          description: t('common.descriptionLocalRegistration'),
        },
        {
          id: 'enableSsoRegistration',
          instanceSettings: t('common.enableSsoRegistration'),
          modifySettings: registrationEnabled && ssoRegistrationEnabled,
          modifySettingsProps: { onChange: handleSsoRegistrationEnabledChange, disabled: !registrationEnabled || demoMode, title: t('common.toggleSsoUserRegistration') },
          currentValue: registrationEnabled && ssoRegistrationEnabled ? t('common.enabled') : t('common.disabled'),
          description: t('common.descriptionSsoRegistration'),
        },
        {
          id: 'enableProjectCreationAll',
          instanceSettings: t('common.enableProjectCreationAll'),
          modifySettings: projectCreationAllEnabled,
          modifySettingsProps: { onChange: handleProjectCreationAllEnabledChange, disabled: demoMode, title: t('common.toggleProjectCreationAll') },
          currentValue: projectCreationAllEnabled ? t('common.enabled') : t('common.disabled'),
          description: t('common.descriptionProjectCreationAll'),
        },
        {
          id: 'syncSsoDataOnAuth',
          instanceSettings: t('common.syncSsoDataOnAuth'),
          modifySettings: syncSsoDataOnAuth,
          modifySettingsProps: { onChange: handleSyncSsoDataOnAuthChange, title: t('common.toggleSyncSsoDataOnAuth') },
          currentValue: syncSsoDataOnAuth ? t('common.enabled') : t('common.disabled'),
          description: t('common.descriptionSyncSsoDataOnAuth'),
        },
        {
          id: 'syncSsoAdminOnAuth',
          instanceSettings: t('common.syncSsoAdminOnAuth'),
          modifySettings: syncSsoAdminOnAuth,
          modifySettingsProps: { onChange: handleSyncSsoAdminOnAuthChange, title: t('common.toggleSyncSsoAdminOnAuth') },
          currentValue: syncSsoAdminOnAuth ? t('common.enabled') : t('common.disabled'),
          description: t('common.descriptionSyncSsoAdminOnAuth'),
        },
        {
          id: 'allowedRegisterDomains',
          instanceSettings: t('common.allowedRegisterDomains'),
          modifySettings: allowedRegisterDomainsData.text,
          modifySettingsProps: {
            name: 'text',
            onSubmit: handleAllowedRegisterDomainsSubmit,
            onChange: handleAllowedRegisterDomainsChange,
            disabled: demoMode,
            placeholder: t('common.allowedRegisterDomainsPlaceholder'),
            title: t('common.editAllowedRegisterDomains'),
            isError: isErrorAllowedRegisterDomains,
          },
          currentValue: allowedRegisterDomains.length > 0 ? allowedRegisterDomains.replace(/;/g, '\n') : t('common.anyDomain'),
          description: t('common.descriptionAllowedRegisterDomains'),
        },
      ],
      [
        allowedRegisterDomains,
        allowedRegisterDomainsData.text,
        demoMode,
        handleAllowedRegisterDomainsChange,
        handleAllowedRegisterDomainsSubmit,
        handleLocalRegistrationEnabledChange,
        handleProjectCreationAllEnabledChange,
        handleRegistrationEnabledChange,
        handleSsoRegistrationEnabledChange,
        handleSyncSsoAdminOnAuthChange,
        handleSyncSsoDataOnAuthChange,
        isErrorAllowedRegisterDomains,
        localRegistrationEnabled,
        projectCreationAllEnabled,
        registrationEnabled,
        ssoRegistrationEnabled,
        syncSsoAdminOnAuth,
        syncSsoDataOnAuth,
        t,
      ],
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
          cell: Table.Renderers.SettingsCellRenderer,
          enableSorting: false,
          meta: { headerTitle: t('common.modifySettings'), suggestedSize: 200 },
          cellProps: { ariaLabel: t('common.toggleSettings') },
        },
        {
          accessorKey: 'currentValue',
          header: t('common.currentValue'),
          cell: Table.Renderers.DefaultCellRenderer,
          enableSorting: false,
          meta: { headerTitle: t('common.currentValue'), suggestedSize: 110 },
          cellProps: { cellClassNameInner: clsx(s.cell, s.currentValueCell) },
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
          <Table.Wrapper className={clsx(gs.scrollableX)}>
            <Table ref={tableRef} style={{ width: `${table.getCenterTotalSize()}px` }}>
              <Table.Header style={Table.Style.Default}>
                {table.getHeaderGroups().map((headerGroup) => (
                  <Table.HeaderRow key={headerGroup.id}>
                    {headerGroup.headers.map((header, index) => (
                      <Table.HeaderCell
                        key={header.id}
                        style={{ width: `${header.getSize()}px` }}
                        colSpan={header.colSpan}
                        title={header.column.columnDef.meta?.headerTitle}
                        aria-label={header.column.columnDef.meta?.headerAriaLabel}
                        isCentered
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {index + 1 < headerGroup.headers.length && <Table.Resizer />}
                      </Table.HeaderCell>
                    ))}
                  </Table.HeaderRow>
                ))}
              </Table.Header>
              <Table.Body className={clsx(gs.scrollableY)} style={Table.Style.Default}>
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
  },
);

InstanceSettings.propTypes = {
  registrationEnabled: PropTypes.bool.isRequired,
  localRegistrationEnabled: PropTypes.bool.isRequired,
  ssoRegistrationEnabled: PropTypes.bool.isRequired,
  projectCreationAllEnabled: PropTypes.bool.isRequired,
  syncSsoDataOnAuth: PropTypes.bool.isRequired,
  syncSsoAdminOnAuth: PropTypes.bool.isRequired,
  demoMode: PropTypes.bool.isRequired,
  allowedRegisterDomains: PropTypes.string.isRequired,
  onCoreSettingsUpdate: PropTypes.func.isRequired,
};

export default InstanceSettings;
