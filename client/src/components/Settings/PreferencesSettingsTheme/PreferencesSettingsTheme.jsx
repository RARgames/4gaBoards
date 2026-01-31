import React, { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { Themes } from '../../../constants/Enums';
import { readCSSVars } from '../../../utils/color-utils';
import { Button, ButtonStyle, Dropdown, Table } from '../../Utils';

import * as gs from '../../../global.module.scss';
import * as sShared from '../SettingsShared.module.scss';
import * as s from './PreferencesSettingsTheme.module.scss';

const PreferencesSettingsTheme = React.memo(({ themeCustomColors, onUpdate }) => {
  const [t] = useTranslation();
  const tableRef = useRef(null);
  const [presets, setPresets] = useState({});

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
    ],
    [t],
  );

  const [theme, setTheme] = useState(Themes.DEFAULT);
  const selectedTheme = useMemo(() => themes.find((th) => th.id === theme), [themes, theme]);
  const { sorting, setSorting } = Table.HooksState({}, 0, Number.MAX_SAFE_INTEGER);

  const effectiveTheme = useMemo(
    () => ({
      ...presets[Themes.DEFAULT],
      ...themeCustomColors,
    }),
    [presets, themeCustomColors],
  );

  const getPresetVars = useCallback((themeId) => {
    const el = document.createElement('div');
    el.style.all = 'initial';
    el.setAttribute('data-theme', themeId);
    document.body.appendChild(el);
    const vars = readCSSVars(el);
    document.body.removeChild(el);
    return vars;
  }, []);

  const applyPreset = useCallback(
    (presetId) => {
      const preset = presets[presetId];
      if (!preset) return;

      // Get differences from default theme
      const filteredPreset = Object.fromEntries(Object.entries(preset).filter(([key, val]) => presets[Themes.DEFAULT][key] !== val));

      onUpdate({
        themeCustomColors: filteredPreset,
      });
    },
    [presets, onUpdate],
  );

  const handleThemeColorUpdate = useCallback(
    (name, value) => {
      onUpdate({
        themeCustomColors: {
          ...themeCustomColors,
          [name]: value,
        },
      });
    },
    [onUpdate, themeCustomColors],
  );

  useEffect(() => {
    const allPresets = {};
    themes.forEach((th) => {
      allPresets[th.id] = getPresetVars(th.id);
    });
    setPresets(allPresets);
  }, [getPresetVars, themes]);

  const data = useMemo(
    () =>
      Object.entries(effectiveTheme).map(([name, val]) => ({
        id: name,
        colorName: name
          .replace(/^--/, '')
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .toLowerCase(),
        name,
        value: val,
      })),
    [effectiveTheme],
  );

  const table = useReactTable({
    data,
    columns: [],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
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
        accessorKey: 'value',
        header: t('common.value'),
        enableSorting: false,
        cell: Table.Renderers.ColorCellRenderer,
        cellProps: {
          onUpdate: handleThemeColorUpdate,
          title: t('common.selectColor'),
        },
        meta: { headerTitle: t('common.value'), size: 80, headerSize: 80 },
      },
      {
        accessorKey: 'colorName',
        header: t('common.colorName'),
        cell: Table.Renderers.DefaultCellRenderer,
        enableSorting: true,
        sortDescFirst: true,
        meta: { headerTitle: t('common.colorName'), suggestedSize: 200 },
      },
    ],
    [handleThemeColorUpdate, t],
  );

  const { handleSortingChange } = Table.HooksPost(columns, setSorting);
  table.setOptions((prev) => ({ ...prev, onSortingChange: handleSortingChange, columns }));

  return (
    <div className={sShared.wrapper}>
      <div className={sShared.header}>
        <h2 className={sShared.headerText}>{t('common.themeEditor')}</h2>
        <div className={s.presets}>
          <Dropdown options={themes} placeholder={selectedTheme.name} defaultItem={selectedTheme} onChange={(item) => setTheme(item.id)} className={s.dropdown} />
          <Button style={ButtonStyle.DefaultBorder} onClick={() => applyPreset(selectedTheme.id)} content={t('common.applyTheme', { theme: selectedTheme.name })} className={s.button} />
        </div>
      </div>
      <Table.Container className={s.container}>
        <Table.Wrapper className={clsx(gs.scrollableX)}>
          <Table ref={tableRef}>
            <Table.Header style={Table.Style.Default}>
              {table.getHeaderGroups().map((hg) => (
                <Table.HeaderRow key={hg.id}>
                  {hg.headers.map((header, index) => {
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
                        {index + 1 < hg.headers.length && <Table.Resizer />}
                      </Table.HeaderCell>
                    );
                  })}
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
});

PreferencesSettingsTheme.propTypes = {
  themeCustomColors: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func,
};

PreferencesSettingsTheme.defaultProps = {
  onUpdate: () => {},
};

export default PreferencesSettingsTheme;
