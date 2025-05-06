import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import locales from '../../../locales';
import { Dropdown, DropdownStyle, Radio, RadioSize, Table } from '../../Utils';

import * as gs from '../../../global.module.scss';
import * as sShared from '../SettingsShared.module.scss';
import * as s from './PreferencesSettings.module.scss';

const PreferencesSettings = React.memo(({ subscribeToOwnCards, sidebarCompact, language, defaultView, listViewStyle, usersSettingsStyle, onUpdate }) => {
  const [t] = useTranslation();
  const tableRef = useRef(null);

  const languages = useMemo(
    () => [
      {
        id: 'auto',
        name: t('common.detectAutomatically'),
      },
      ...locales.map((locale) => ({
        id: locale.language,
        flags: locale.flags,
        name: locale.name,
      })),
    ],
    [t],
  );
  const selectedLanguage = useMemo(() => languages.find((lang) => lang.id === (language || 'auto')), [languages, language]);

  const defaultViews = useMemo(
    () => [
      {
        id: 'list',
        name: t('common.listView'),
      },
      {
        id: 'board',
        name: t('common.boardView'),
      },
    ],
    [t],
  );
  const selectedDefaultView = useMemo(() => defaultViews.find((view) => view.id === defaultView), [defaultViews, defaultView]);

  const listStyles = useMemo(
    () => [
      {
        id: 'default',
        name: t('common.default'),
      },
      {
        id: 'compact',
        name: t('common.compact'),
      },
    ],
    [t],
  );

  const selectedListViewStyle = useMemo(() => listStyles.find((style) => style.id === listViewStyle), [listStyles, listViewStyle]);

  const selectedUsersSettingsStyle = useMemo(() => listStyles.find((style) => style.id === usersSettingsStyle), [listStyles, usersSettingsStyle]);

  const handleSubscribeToOwnCardsChange = useCallback(() => {
    onUpdate({
      subscribeToOwnCards: !subscribeToOwnCards,
    });
  }, [subscribeToOwnCards, onUpdate]);

  const handleCompactSidebarChange = useCallback(() => {
    onUpdate({
      sidebarCompact: !sidebarCompact,
    });
  }, [onUpdate, sidebarCompact]);

  const handleDefaultViewChange = useCallback(
    (value) => {
      onUpdate({ defaultView: value.id });
    },
    [onUpdate],
  );

  const handleListViewStyleChange = useCallback(
    (value) => {
      onUpdate({ listViewStyle: value.id });
    },
    [onUpdate],
  );

  const handleUsersSettingsStyleChange = useCallback(
    (value) => {
      onUpdate({ usersSettingsStyle: value.id });
    },
    [onUpdate],
  );

  const handleLanguageChange = useCallback(
    (value) => {
      onUpdate({ language: value.id === 'auto' ? null : value.id }); // FIXME: hack
    },
    [onUpdate],
  );

  const data = useMemo(
    () => [
      {
        id: 'subscribeToOwnCards',
        preferences: t('common.subscribeToMyOwnCards'),
        modifySettings: subscribeToOwnCards,
        modifySettingsProps: { onChange: handleSubscribeToOwnCardsChange, title: t('common.toggleSubscribeToMyOwnCards') },
        currentValue: subscribeToOwnCards ? t('common.enabled') : t('common.disabled'),
        description: t('common.descriptionSubscribeToMyOwnCards'),
      },
      {
        id: 'sidebarCompact',
        preferences: t('common.sidebarCompact'),
        modifySettings: sidebarCompact,
        modifySettingsProps: { onChange: handleCompactSidebarChange, title: t('common.toggleCompactSidebar') },
        currentValue: sidebarCompact ? t('common.enabled') : t('common.disabled'),
        description: t('common.descriptionCompactSidebar'),
      },
      {
        id: 'defaultView',
        preferences: t('common.defaultView'),
        modifySettings: selectedDefaultView,
        modifySettingsProps: { onChange: handleDefaultViewChange, options: defaultViews, placeholder: selectedDefaultView.name, isSearchable: true, selectFirstOnSearch: true, forcePlaceholder: true },
        currentValue: selectedDefaultView.name,
        description: t('common.descriptionDefaultView'),
      },
      {
        id: 'listViewStyle',
        preferences: t('common.listViewStyle'),
        modifySettings: selectedListViewStyle,
        modifySettingsProps: { onChange: handleListViewStyleChange, options: listStyles, placeholder: selectedListViewStyle.name, isSearchable: true, selectFirstOnSearch: true, forcePlaceholder: true },
        currentValue: selectedListViewStyle.name,
        description: t('common.descriptionListViewStyle'),
      },
      {
        id: 'usersSettingsStyle',
        preferences: t('common.usersSettingsStyle'),
        modifySettings: selectedUsersSettingsStyle,
        modifySettingsProps: {
          onChange: handleUsersSettingsStyleChange,
          options: listStyles,
          placeholder: selectedUsersSettingsStyle.name,
          isSearchable: true,
          selectFirstOnSearch: true,
          forcePlaceholder: true,
        },
        currentValue: selectedUsersSettingsStyle.name,
        description: t('common.descriptionUsersSettingsStyle'),
      },
      {
        id: 'language',
        preferences: t('common.language', { context: 'title' }),
        modifySettings: selectedLanguage,
        modifySettingsProps: { onChange: handleLanguageChange, options: languages, placeholder: selectedLanguage.name, isSearchable: true, selectFirstOnSearch: true, forcePlaceholder: true },
        currentValue: selectedLanguage.name,
        description: t('common.descriptionSLanguage'),
      },
    ],
    [
      t,
      subscribeToOwnCards,
      handleSubscribeToOwnCardsChange,
      sidebarCompact,
      handleCompactSidebarChange,
      selectedDefaultView,
      handleDefaultViewChange,
      defaultViews,
      selectedListViewStyle,
      handleListViewStyleChange,
      listStyles,
      selectedUsersSettingsStyle,
      handleUsersSettingsStyleChange,
      selectedLanguage,
      handleLanguageChange,
      languages,
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
  }, [resetColumnsWidths, sidebarCompact]);

  useEffect(() => {
    window.addEventListener('resize', resetColumnsWidths);

    return () => {
      window.removeEventListener('resize', resetColumnsWidths);
    };
  }, [resetColumnsWidths]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'preferences',
        header: t('common.preferences'),
        cell: Table.Renderers.DefaultCellRenderer,
        enableSorting: false,
        meta: { headerTitle: t('common.preferences') },
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
        <h2 className={sShared.headerText}>{t('common.preferences')}</h2>
      </div>
      <Table.Container className={s.container}>
        <Table.Wrapper className={classNames(gs.scrollableX)}>
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

PreferencesSettings.propTypes = {
  subscribeToOwnCards: PropTypes.bool.isRequired,
  sidebarCompact: PropTypes.bool.isRequired,
  language: PropTypes.string,
  defaultView: PropTypes.string.isRequired,
  listViewStyle: PropTypes.string.isRequired,
  usersSettingsStyle: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

PreferencesSettings.defaultProps = {
  language: undefined,
};

export default PreferencesSettings;
