import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useReactTable, getCoreRowModel, getGroupedRowModel, getExpandedRowModel, flexRender } from '@tanstack/react-table';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { ThemeShapes, Themes } from '../../../constants/Enums';
import locales from '../../../locales';
import { Table } from '../../Utils';
import CustomThemeButton from './CustomThemeButton';
import ThemeShapeSelector from './ThemeShapeSelector';

import * as gs from '../../../global.module.scss';
import * as sShared from '../SettingsShared.module.scss';
import * as s from './PreferencesSettings.module.scss';

const PreferencesSettings = React.memo(
  ({
    isAdmin,
    subscribeToOwnCards,
    subscribeToNewBoards,
    subscribeToNewProjects,
    subscribeToUsers,
    subscribeToInstance,
    sidebarCompact,
    language,
    defaultView,
    listViewStyle,
    usersSettingsStyle,
    preferredDetailsFont,
    hideCardModalActivity,
    hideClosestDueDate,
    theme,
    themeShape,
    onUpdate,
  }) => {
    const [t] = useTranslation();
    const tableRef = useRef(null);

    const Groups = {
      NOTIFICATIONS: 'notifications',
      GENERAL: 'general',
    };

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

    const preferredFonts = useMemo(
      () => [
        {
          id: 'default',
          name: t('common.default'),
        },
        {
          id: 'monospace',
          name: t('common.monospace'),
        },
      ],
      [t],
    );

    const selectedPreferredDetailsFont = useMemo(() => preferredFonts.find((style) => style.id === preferredDetailsFont), [preferredDetailsFont, preferredFonts]);

    const themes = useMemo(
      () => [
        {
          id: Themes.DEFAULT,
          name: t('common.themeDefault'),
        },
        {
          id: Themes.GITHUB_DARK,
          name: t('common.themeGithubDark'),
          badge: t('common.beta'),
        },
        {
          id: Themes.CUSTOM,
          name: t('common.themeCustom'),
          badge: t('common.beta'),
        },
      ],
      [t],
    );

    const selectedTheme = useMemo(() => themes.find((th) => th.id === theme), [themes, theme]);

    const themeShapes = useMemo(
      () => [
        {
          id: ThemeShapes.DEFAULT,
          name: t('common.themeShapeDefault'),
        },
        {
          id: ThemeShapes.ROUNDED,
          name: t('common.themeShapeRounded'),
        },
      ],
      [t],
    );

    const selectedThemeShape = useMemo(() => themeShapes.find((shape) => shape.id === themeShape), [themeShapes, themeShape]);

    const handleSubscribeToOwnCardsChange = useCallback(() => {
      onUpdate({
        subscribeToOwnCards: !subscribeToOwnCards,
      });
    }, [subscribeToOwnCards, onUpdate]);

    const handleSubscribeToNewBoardsChange = useCallback(() => {
      onUpdate({
        subscribeToNewBoards: !subscribeToNewBoards,
      });
    }, [subscribeToNewBoards, onUpdate]);

    const handleSubscribeToNewProjectsChange = useCallback(() => {
      onUpdate({
        subscribeToNewProjects: !subscribeToNewProjects,
      });
    }, [subscribeToNewProjects, onUpdate]);

    const handleSubscribeToUsersChange = useCallback(() => {
      onUpdate({
        subscribeToUsers: !subscribeToUsers,
      });
    }, [subscribeToUsers, onUpdate]);

    const handleSubscribeToInstanceChange = useCallback(() => {
      onUpdate({
        subscribeToInstance: !subscribeToInstance,
      });
    }, [subscribeToInstance, onUpdate]);

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

    const handlePreferredDetailsFontChange = useCallback(
      (value) => {
        onUpdate({ preferredDetailsFont: value.id });
      },
      [onUpdate],
    );

    const handleHideCardModalActivityChange = useCallback(() => {
      onUpdate({
        hideCardModalActivity: !hideCardModalActivity,
      });
    }, [onUpdate, hideCardModalActivity]);

    const handleHideClosestDueDateChange = useCallback(() => {
      onUpdate({
        hideClosestDueDate: !hideClosestDueDate,
      });
    }, [onUpdate, hideClosestDueDate]);

    const handleLanguageChange = useCallback(
      (value) => {
        onUpdate({ language: value.id === 'auto' ? null : value.id }); // FIXME: hack
      },
      [onUpdate],
    );

    const handleThemeChange = useCallback(
      (value) => {
        onUpdate({ theme: value.id });
      },
      [onUpdate],
    );

    const handleThemeShapeChange = useCallback(
      (value) => {
        onUpdate({ themeShape: value.id });
      },
      [onUpdate],
    );

    const data = useMemo(
      () =>
        [
          {
            id: 'language',
            preferences: t('common.language', { context: 'title' }),
            modifySettings: selectedLanguage,
            modifySettingsProps: { onChange: handleLanguageChange, options: languages, placeholder: selectedLanguage.name, isSearchable: true, selectFirstOnSearch: true },
            currentValue: selectedLanguage.name,
            description: t('common.descriptionLanguage'),
            group: Groups.GENERAL,
          },
          {
            id: 'theme',
            preferences: t('common.theme'),
            modifySettings: selectedTheme,
            modifySettingsProps: {
              onChange: handleThemeChange,
              options: themes,
              placeholder: selectedTheme.name,
              isSearchable: true,
              selectFirstOnSearch: true,
            },
            currentValue: selectedTheme.name,
            description: t('common.descriptionTheme'),
            group: Groups.GENERAL,
          },
          theme === Themes.CUSTOM && {
            id: 'customTheme',
            preferences: t('common.customTheme'),
            modifySettings: selectedTheme,
            modifySettingsProps: {
              isCustomComponent: true,
              CustomComponent: CustomThemeButton,
            },
            currentValue: t('common.customized'),
            description: t('common.descriptionCustomTheme'),
            group: Groups.GENERAL,
          },
          {
            id: 'themeShape',
            preferences: t('common.themeShape'),
            modifySettings: selectedThemeShape,
            modifySettingsProps: {
              isCustomComponent: true,
              CustomComponent: ThemeShapeSelector,
              onChange: handleThemeShapeChange,
              options: themeShapes,
            },
            currentValue: selectedThemeShape.name,
            description: t('common.descriptionThemeShape'),
            group: Groups.GENERAL,
          },
          {
            id: 'preferredDetailsFont',
            preferences: t('common.preferredDetailsFont'),
            modifySettings: selectedPreferredDetailsFont,
            modifySettingsProps: {
              onChange: handlePreferredDetailsFontChange,
              options: preferredFonts,
              placeholder: selectedPreferredDetailsFont.name,
              isSearchable: true,
              selectFirstOnSearch: true,
            },
            currentValue: selectedPreferredDetailsFont.name,
            description: t('common.descriptionPreferredDetailsFont'),
            group: Groups.GENERAL,
          },
          {
            id: 'defaultView',
            preferences: t('common.defaultView'),
            modifySettings: selectedDefaultView,
            modifySettingsProps: { onChange: handleDefaultViewChange, options: defaultViews, placeholder: selectedDefaultView.name, isSearchable: true, selectFirstOnSearch: true },
            currentValue: selectedDefaultView.name,
            description: t('common.descriptionDefaultView'),
            group: Groups.GENERAL,
          },
          {
            id: 'sidebarCompact',
            preferences: t('common.sidebarCompact'),
            modifySettings: sidebarCompact,
            modifySettingsProps: { onChange: handleCompactSidebarChange, title: t('common.toggleCompactSidebar') },
            currentValue: sidebarCompact ? t('common.enabled') : t('common.disabled'),
            description: t('common.descriptionCompactSidebar'),
            group: Groups.GENERAL,
          },
          {
            id: 'listViewStyle',
            preferences: t('common.listViewStyle'),
            modifySettings: selectedListViewStyle,
            modifySettingsProps: { onChange: handleListViewStyleChange, options: listStyles, placeholder: selectedListViewStyle.name, isSearchable: true, selectFirstOnSearch: true },
            currentValue: selectedListViewStyle.name,
            description: t('common.descriptionListViewStyle'),
            group: Groups.GENERAL,
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
            },
            currentValue: selectedUsersSettingsStyle.name,
            description: t('common.descriptionUsersSettingsStyle'),
            group: Groups.GENERAL,
          },
          {
            id: 'hideCardModalActivity',
            preferences: t('common.hideCardModalActivity'),
            modifySettings: hideCardModalActivity,
            modifySettingsProps: { onChange: handleHideCardModalActivityChange, title: t('common.toggleHideCardModalActivity') },
            currentValue: hideCardModalActivity ? t('common.enabled') : t('common.disabled'),
            description: t('common.descriptionHideCardModalActivity'),
            group: Groups.GENERAL,
          },
          {
            id: 'hideClosestDueDate',
            preferences: t('common.hideClosestDueDate'),
            modifySettings: hideClosestDueDate,
            modifySettingsProps: { onChange: handleHideClosestDueDateChange, title: t('common.toggleHideClosestDueDate') },
            currentValue: hideClosestDueDate ? t('common.enabled') : t('common.disabled'),
            description: t('common.descriptionHideClosestDueDate'),
            group: Groups.GENERAL,
          },
          {
            id: 'subscribeToOwnCards',
            preferences: t('common.subscribeToOwnCards'),
            modifySettings: subscribeToOwnCards,
            modifySettingsProps: { onChange: handleSubscribeToOwnCardsChange, title: t('common.toggleSubscribeToOwnCards') },
            currentValue: subscribeToOwnCards ? t('common.enabled') : t('common.disabled'),
            description: t('common.descriptionSubscribeToOwnCards'),
            group: Groups.NOTIFICATIONS,
          },
          {
            id: 'subscribeToNewBoards',
            preferences: t('common.subscribeToNewBoards'),
            modifySettings: subscribeToNewBoards,
            modifySettingsProps: { onChange: handleSubscribeToNewBoardsChange, title: t('common.toggleSubscribeToNewBoards') },
            currentValue: subscribeToNewBoards ? t('common.enabled') : t('common.disabled'),
            description: t('common.descriptionSubscribeToNewBoards'),
            group: Groups.NOTIFICATIONS,
          },
          {
            id: 'subscribeToNewProjects',
            preferences: t('common.subscribeToNewProjects'),
            modifySettings: subscribeToNewProjects,
            modifySettingsProps: { onChange: handleSubscribeToNewProjectsChange, title: t('common.toggleSubscribeToNewProjects') },
            currentValue: subscribeToNewProjects ? t('common.enabled') : t('common.disabled'),
            description: t('common.descriptionSubscribeToNewProjects'),
            group: Groups.NOTIFICATIONS,
          },
          isAdmin && {
            id: 'subscribeToUsers',
            preferences: t('common.subscribeToUsers'),
            modifySettings: subscribeToUsers,
            modifySettingsProps: { onChange: handleSubscribeToUsersChange, title: t('common.toggleSubscribeToUsers') },
            currentValue: subscribeToUsers ? t('common.enabled') : t('common.disabled'),
            description: t('common.descriptionSubscribeToUsers'),
            group: Groups.NOTIFICATIONS,
          },
          isAdmin && {
            id: 'subscribeToInstance',
            preferences: t('common.subscribeToInstance'),
            modifySettings: subscribeToInstance,
            modifySettingsProps: { onChange: handleSubscribeToInstanceChange, title: t('common.toggleSubscribeToInstance') },
            currentValue: subscribeToInstance ? t('common.enabled') : t('common.disabled'),
            description: t('common.descriptionSubscribeToInstance'),
            group: Groups.NOTIFICATIONS,
          },
        ].filter(Boolean),
      [
        t,
        selectedLanguage,
        handleLanguageChange,
        languages,
        Groups.GENERAL,
        Groups.NOTIFICATIONS,
        selectedTheme,
        handleThemeChange,
        themes,
        theme,
        selectedThemeShape,
        handleThemeShapeChange,
        themeShapes,
        selectedPreferredDetailsFont,
        handlePreferredDetailsFontChange,
        preferredFonts,
        selectedDefaultView,
        handleDefaultViewChange,
        defaultViews,
        sidebarCompact,
        handleCompactSidebarChange,
        selectedListViewStyle,
        handleListViewStyleChange,
        listStyles,
        selectedUsersSettingsStyle,
        handleUsersSettingsStyleChange,
        hideCardModalActivity,
        handleHideCardModalActivityChange,
        hideClosestDueDate,
        handleHideClosestDueDateChange,
        subscribeToOwnCards,
        handleSubscribeToOwnCardsChange,
        subscribeToNewBoards,
        handleSubscribeToNewBoardsChange,
        subscribeToNewProjects,
        handleSubscribeToNewProjectsChange,
        isAdmin,
        subscribeToUsers,
        handleSubscribeToUsersChange,
        subscribeToInstance,
        handleSubscribeToInstanceChange,
      ],
    );

    const table = useReactTable({
      data,
      columns: [],
      initialState: {
        grouping: ['preferences'],
        expanded: true,
      },
      getCoreRowModel: getCoreRowModel(),
      getGroupedRowModel: getGroupedRowModel(),
      getExpandedRowModel: getExpandedRowModel(),
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
          getGroupingValue: (row) => row.group,
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
                {table.getRowModel().rows.map((row) => {
                  if (row.getIsGrouped()) {
                    return (
                      <Table.Row key={row.id} className={s.groupRow}>
                        <Table.Cell colSpan={columns.length}>
                          <strong>{row.groupingValue === 'notifications' ? t('common.notifications') : t('common.general')}</strong>
                        </Table.Cell>
                      </Table.Row>
                    );
                  }
                  return (
                    <Table.Row key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <Table.Cell key={cell.id} style={{ width: `${cell.column.getSize()}px` }}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </Table.Wrapper>
        </Table.Container>
      </div>
    );
  },
);

PreferencesSettings.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  subscribeToOwnCards: PropTypes.bool.isRequired,
  subscribeToNewBoards: PropTypes.bool.isRequired,
  subscribeToNewProjects: PropTypes.bool.isRequired,
  subscribeToUsers: PropTypes.bool.isRequired,
  subscribeToInstance: PropTypes.bool.isRequired,
  sidebarCompact: PropTypes.bool.isRequired,
  language: PropTypes.string,
  defaultView: PropTypes.string.isRequired,
  listViewStyle: PropTypes.string.isRequired,
  usersSettingsStyle: PropTypes.string.isRequired,
  preferredDetailsFont: PropTypes.string.isRequired,
  hideCardModalActivity: PropTypes.bool.isRequired,
  hideClosestDueDate: PropTypes.bool.isRequired,
  theme: PropTypes.string.isRequired,
  themeShape: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

PreferencesSettings.defaultProps = {
  language: undefined,
};

export default PreferencesSettings;
