import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import UserAddPopup from '../../UserAddPopup';
import { Button, ButtonStyle, Icon, IconType, IconSize, Table } from '../../Utils';
import { ActionsCellRenderer, NameCellRenderer, UserAvatarRenderer } from './Renderers';

import * as gs from '../../../global.module.scss';
import * as sShared from '../SettingsShared.module.scss';
import * as s from './UsersSettings.module.scss';

const DEFAULT_COLUMN_VISIBILITY = {
  avatar: true,
  name: true,
  username: true,
  email: true,
  administrator: true,
  ssoGoogleEmail: false,
  ssoGithubUsername: false,
  ssoGithubEmail: false,
  ssoMicrosoftEmail: false,
  ssoOidcEmail: false,
  lastLogin: true,
  createdAt: false,
  createdBy: false,
  updatedAt: false,
  updatedBy: false,
  actions: true,
};

const UsersSettings = React.memo(
  ({
    currentUserId,
    userCreateDefaultData,
    userCreateIsSubmitting,
    userCreateError,
    items,
    demoMode,
    usersSettingsStyle,
    usersSettingsColumnVisibility,
    usersSettingsFitScreen,
    usersSettingsItemsPerPage,
    onUserCreate,
    onUserCreateMessageDismiss,
    onUpdate,
    onUserPrefsUpdate,
  }) => {
    const [t] = useTranslation();
    const tableRef = useRef(null);
    const tableBodyRef = useRef(null);
    const initialPageIndexRef = useRef(null);
    if (initialPageIndexRef.current === null) {
      const pageSize = usersSettingsItemsPerPage === 'all' ? Number.MAX_SAFE_INTEGER : Number(usersSettingsItemsPerPage);
      initialPageIndexRef.current = { pageIndex: 0, pageSize };
    }

    const { columnVisibility, setColumnVisibility, pagination, setPagination, sorting, setSorting, handleResetColumnSortingClick } = Table.HooksState(
      usersSettingsColumnVisibility,
      initialPageIndexRef.current.pageIndex,
      initialPageIndexRef.current.pageSize,
    );

    const handleResetColumnVisibilityClick = useCallback(() => {
      setColumnVisibility(DEFAULT_COLUMN_VISIBILITY);
    }, [setColumnVisibility]);

    const handleColumnVisibilityChange = useCallback(
      (updater) => {
        setColumnVisibility((prev) => {
          const next = typeof updater === 'function' ? updater(prev) : updater;
          const changedColumns = Object.keys(next).filter((key) => next[key] !== prev[key]);
          const nowHidden = changedColumns.filter((col) => next[col] === false);
          if (nowHidden.length > 0) {
            setSorting((prevSorting) => prevSorting.filter((sort) => !nowHidden.includes(sort.id)));
          }
          return next;
        });
      },
      [setColumnVisibility, setSorting],
    );

    const handlePaginationChange = useCallback(
      (updater) => {
        setPagination((prev) => {
          const next = typeof updater === 'function' ? updater(prev) : updater;
          if (next.pageSize !== prev.pageSize) {
            next.pageIndex = 0;
          }
          if (next.pageIndex !== prev.pageIndex) {
            tableBodyRef.current?.scrollTo({ top: 0 });
          }
          return next;
        });
      },
      [setPagination],
    );

    const handleIsAdminChange = useCallback(
      (id, isAdmin) => {
        onUpdate(id, {
          isAdmin: !isAdmin,
        });
      },
      [onUpdate],
    );

    const table = useReactTable({
      autoResetPageIndex: false,
      data: items,
      columns: [],
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      enableMultiSort: true,
      columnResizeMode: 'onChange',
      state: { sorting, columnVisibility, pagination },
      onColumnVisibilityChange: handleColumnVisibilityChange,
      onPaginationChange: handlePaginationChange,
      style: usersSettingsStyle === 'compact' ? Table.Style.Compact : Table.Style.Default,
    });

    const { handleResetColumnWidthsClick, handleResizerMouseDown } = Table.HooksPre(tableRef, table);
    const sortingFunctions = Table.HooksSorting(table);

    const resetColumnsWidths = useCallback(() => {
      handleResetColumnWidthsClick(false, usersSettingsFitScreen);
    }, [handleResetColumnWidthsClick, usersSettingsFitScreen]);

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
          accessorKey: 'avatar',
          header: Table.Renderers.EmptyHeaderRenderer,
          cell: UserAvatarRenderer,
          enableSorting: false,
          enableResizing: false,
          meta: { headerAriaLabel: t('common.userAvatar'), headerTitle: t('common.userAvatar'), size: 40 },
        },
        {
          accessorKey: 'name',
          header: t('common.name'),
          cell: NameCellRenderer,
          enableSorting: true,
          sortingFn: sortingFunctions.localeSortingFn,
          meta: { headerTitle: t('common.name') },
        },
        {
          accessorKey: 'username',
          header: t('common.username'),
          cell: Table.Renderers.DefaultCellRenderer,
          enableSorting: true,
          sortUndefined: 'last',
          sortingFn: sortingFunctions.localeSortingFn,
          meta: { headerTitle: t('common.username') },
          cellProps: { showEmpty: true, cellClassNameInner: s.cell },
        },
        {
          accessorKey: 'email',
          header: t('common.email'),
          cell: Table.Renderers.DefaultCellRenderer,
          enableSorting: true,
          sortingFn: sortingFunctions.localeSortingFn,
          meta: { headerTitle: t('common.email') },
          cellProps: { cellClassNameInner: s.cell },
        },
        {
          accessorKey: 'administrator',
          header: t('common.administrator'),
          cell: Table.Renderers.RadioCellRenderer,
          enableSorting: true,
          sortDescFirst: true,
          meta: { headerTitle: t('common.administrator') },
          cellProps: { title: t('common.toggleAdmin'), ariaLabel: t('common.toggleAdmin'), onChange: handleIsAdminChange, getIsDisabled: (id) => id === currentUserId || demoMode },
        },
        {
          accessorKey: 'ssoGoogleEmail',
          header: t('common.ssoGoogleEmail'),
          cell: Table.Renderers.DefaultCellRenderer,
          enableSorting: true,
          sortUndefined: 'last',
          sortingFn: sortingFunctions.localeSortingFn,
          meta: { headerTitle: t('common.ssoGoogleEmail') },
          cellProps: { showEmpty: true, cellClassNameInner: s.cell },
        },
        {
          accessorKey: 'ssoGithubUsername',
          header: t('common.ssoGithubUsername'),
          cell: Table.Renderers.DefaultCellRenderer,
          enableSorting: true,
          sortUndefined: 'last',
          sortingFn: sortingFunctions.localeSortingFn,
          meta: { headerTitle: t('common.ssoGithubUsername') },
          cellProps: { showEmpty: true, cellClassNameInner: s.cell },
        },
        {
          accessorKey: 'ssoGithubEmail',
          header: t('common.ssoGithubEmail'),
          cell: Table.Renderers.DefaultCellRenderer,
          enableSorting: true,
          sortUndefined: 'last',
          sortingFn: sortingFunctions.localeSortingFn,
          meta: { headerTitle: t('common.ssoGithubEmail') },
          cellProps: { showEmpty: true, cellClassNameInner: s.cell },
        },
        {
          accessorKey: 'ssoMicrosoftEmail',
          header: t('common.ssoMicrosoftEmail'),
          cell: Table.Renderers.DefaultCellRenderer,
          enableSorting: true,
          sortUndefined: 'last',
          sortingFn: sortingFunctions.localeSortingFn,
          meta: { headerTitle: t('common.ssoMicrosoftEmail') },
          cellProps: { showEmpty: true, cellClassNameInner: s.cell },
        },
        {
          accessorKey: 'ssoOidcEmail',
          header: t('common.ssoOidcEmail'),
          cell: Table.Renderers.DefaultCellRenderer,
          enableSorting: true,
          sortUndefined: 'last',
          sortingFn: sortingFunctions.localeSortingFn,
          meta: { headerTitle: t('common.ssoOidcEmail') },
          cellProps: { showEmpty: true, cellClassNameInner: s.cell },
        },
        {
          accessorKey: 'lastLogin',
          header: t('common.lastLogin'),
          cell: Table.Renderers.DateCellRenderer,
          enableSorting: true,
          sortDescFirst: true,
          sortUndefined: 'last',
          meta: { headerTitle: t('common.lastLogin'), suggestedSize: 110 },
          cellProps: { className: s.dateCell, showUndefined: true },
        },
        {
          accessorKey: 'createdAt',
          header: t('common.createdAt'),
          cell: Table.Renderers.DateCellRenderer,
          enableSorting: true,
          meta: { headerTitle: t('common.createdAt'), suggestedSize: 110 },
          cellProps: { className: s.dateCell },
        },
        {
          accessorKey: 'createdBy',
          header: t('common.createdBy'),
          cell: Table.Renderers.UserCellRenderer,
          enableSorting: true,
          sortingFn: sortingFunctions.recursiveNameSortingFn,
          meta: { headerTitle: t('common.createdBy') },
        },
        {
          accessorKey: 'updatedAt',
          header: t('common.updatedAt'),
          cell: Table.Renderers.DateCellRenderer,
          enableSorting: true,
          sortUndefined: 'last',
          meta: { headerTitle: t('common.updatedAt'), suggestedSize: 110 },
          cellProps: { className: s.dateCell },
        },
        {
          accessorKey: 'updatedBy',
          header: t('common.updatedBy'),
          cell: Table.Renderers.UserCellRenderer,
          enableSorting: true,
          sortingFn: sortingFunctions.recursiveNameSortingFn,
          meta: { headerTitle: t('common.updatedBy') },
        },
        {
          accessorKey: 'actions',
          header: Table.Renderers.ActionsHeaderRenderer,
          cell: ActionsCellRenderer,
          enableSorting: false,
          enableResizing: false,
          meta: { headerAriaLabel: t('common.editUser'), headerTitle: t('common.editUser'), size: 35 },
          headerProps: {
            fitScreen: usersSettingsFitScreen,
            userPrefsKeys: {
              columnVisibility: 'usersSettingsColumnVisibility',
              fitScreen: 'usersSettingsFitScreen',
            },
            onResetColumnSorting: handleResetColumnSortingClick,
            onResetColumnWidths: handleResetColumnWidthsClick,
            onResetColumnVisibility: handleResetColumnVisibilityClick,
            onUserPrefsUpdate,
          },
        },
      ],

      [
        currentUserId,
        demoMode,
        handleIsAdminChange,
        handleResetColumnSortingClick,
        handleResetColumnVisibilityClick,
        handleResetColumnWidthsClick,
        onUserPrefsUpdate,
        sortingFunctions,
        t,
        usersSettingsFitScreen,
      ],
    );

    const { handleSortingChange } = Table.HooksPost(columns, setSorting);
    table.setOptions((prev) => ({ ...prev, onSortingChange: handleSortingChange, columns }));

    return (
      <div className={clsx(sShared.wrapper, s.wrapper)}>
        <div className={sShared.header}>
          <div className={sShared.headerFlex}>
            <h2 className={sShared.headerText}>
              {t('common.users')} <span className={s.headerTextDetails}>({items.length})</span>
            </h2>
          </div>
          {demoMode && <p className={sShared.demoMode}>{t('common.demoModeExplanation')}</p>}
        </div>
        <Table.Container className={s.container}>
          <Table.Wrapper isPaginated className={clsx(gs.scrollableX)}>
            <Table ref={tableRef} style={{ width: `${table.getCenterTotalSize()}px` }}>
              <Table.Header style={usersSettingsStyle === 'compact' ? Table.Style.Compact : Table.Style.Default}>
                {table.getHeaderGroups().map((headerGroup) => (
                  <Table.HeaderRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const sortedState = header.column.getIsSorted();
                      const sortIndex = sorting.length > 1 ? sorting.findIndex((so) => so.id === header.column.id) + 1 : null;

                      return (
                        <Table.HeaderCell
                          key={header.id}
                          style={{ width: `${header.getSize()}px` }}
                          colSpan={header.colSpan}
                          onClick={(e) => handleSortingChange(e, header.column.getCanSort(), { id: header.column.id, desc: sortedState === 'asc' })}
                          className={clsx(header.column.getCanSort() && gs.cursorPointer)}
                          title={header.column.columnDef.meta?.headerTitle}
                          aria-label={header.column.columnDef.meta?.headerAriaLabel}
                          isCentered
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <Table.SortingIndicator sortedState={sortedState} sortIndex={sortIndex} />
                          <Table.Resizer
                            data-prevent-sorting
                            onMouseDown={(e) => handleResizerMouseDown(e, header)}
                            title={t('common.resizeColumn')}
                            className={clsx(!header.column.getCanResize() && gs.cursorDefault)}
                          />
                        </Table.HeaderCell>
                      );
                    })}
                  </Table.HeaderRow>
                ))}
              </Table.Header>
              <Table.Body ref={tableBodyRef} className={clsx(gs.scrollableY)} style={usersSettingsStyle === 'compact' ? Table.Style.Compact : Table.Style.Default}>
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
          <Table.Pagination
            table={table}
            itemsPerPage={usersSettingsItemsPerPage}
            rowsCount={items.length}
            fitScreen={usersSettingsFitScreen}
            userPrefsKeys={{
              itemsPerPage: 'usersSettingsItemsPerPage',
              columnVisibility: 'usersSettingsColumnVisibility',
              fitScreen: 'userSettingsFitScreen',
            }}
            onResetColumnSorting={handleResetColumnSortingClick}
            onResetColumnWidths={handleResetColumnWidthsClick}
            onResetColumnVisibility={handleResetColumnVisibilityClick}
            onUserPrefsUpdate={onUserPrefsUpdate}
          >
            <div className={s.paginationButtonsWrapper}>
              <UserAddPopup
                defaultData={userCreateDefaultData}
                isSubmitting={userCreateIsSubmitting}
                error={userCreateError}
                onCreate={onUserCreate}
                onMessageDismiss={onUserCreateMessageDismiss}
                offset={5}
                position="top"
                wrapperClassName={s.popupWrapper}
              >
                <Button style={ButtonStyle.DefaultBorder} title={t('common.addUser', { context: 'title' })} className={s.paginationButton}>
                  <Icon type={IconType.PlusMath} size={IconSize.Size13} className={s.paginationButtonIcon} />
                  <span className={s.paginationButtonText}>{t('common.addUser', { context: 'title' })}</span>
                </Button>
              </UserAddPopup>
            </div>
          </Table.Pagination>
        </Table.Container>
      </div>
    );
  },
);

UsersSettings.propTypes = {
  currentUserId: PropTypes.string.isRequired,
  userCreateDefaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  userCreateIsSubmitting: PropTypes.bool.isRequired,
  userCreateError: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  demoMode: PropTypes.bool.isRequired,
  usersSettingsStyle: PropTypes.string.isRequired,
  usersSettingsColumnVisibility: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  usersSettingsFitScreen: PropTypes.bool.isRequired,
  usersSettingsItemsPerPage: PropTypes.string.isRequired,
  onUserCreate: PropTypes.func.isRequired,
  onUserCreateMessageDismiss: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onUserPrefsUpdate: PropTypes.func.isRequired,
};

UsersSettings.defaultProps = {
  userCreateError: undefined,
};

export default UsersSettings;
