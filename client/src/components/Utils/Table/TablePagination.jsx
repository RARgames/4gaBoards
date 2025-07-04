import React, { useRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { useForm } from '../../../hooks';
import { Button, ButtonStyle } from '../Button';
import { Dropdown } from '../Dropdown';
import { Icon, IconSize, IconType } from '../Icon';
import { Input } from '../Input';
import ActionsPopup from './ActionsHeader/ActionsPopup';

import * as s from './Table.module.scss';

const TablePagination = React.memo(
  React.forwardRef(({ table, itemsPerPage, rowsCount, children, className, fitScreen, userPrefsKeys, onResetColumnSorting, onResetColumnWidths, onResetColumnVisibility, onUserPrefsUpdate, ...props }, ref) => {
    const [t] = useTranslation();
    const dropdown = useRef(null);
    const currentPageIndex = table.getState().pagination.pageIndex + 1;
    const [data, handleFieldChange, setData] = useForm(() => ({ page: '' }));
    const pageField = useRef(null);
    const itemsPerPageOptions = ['25', '50', '100', '250', '500', '1000', 'all'].map((item) => ({
      name: `${item} ${t('common.perPage')}`,
      id: item,
    }));
    const [selectedItemsPerPage, setSelectedItemsPerPage] = useState(itemsPerPageOptions.find((item) => item.id === itemsPerPage));

    const handleItemsPerPageSwitch = useCallback(
      (item) => {
        onUserPrefsUpdate({ [userPrefsKeys.itemsPerPage]: item.id });
        setSelectedItemsPerPage(item);
        if (item.id === 'all') {
          table.setPageSize(Number.MAX_SAFE_INTEGER);
        } else {
          table.setPageSize(Number(item.id));
        }
      },
      [onUserPrefsUpdate, table, userPrefsKeys.itemsPerPage],
    );

    const handleSubmit = useCallback(() => {
      const pageNumber = parseInt(data.page, 10);
      const maxPage = itemsPerPage === 'all' ? 1 : Math.ceil(rowsCount / Number(itemsPerPage));
      if (Number.isNaN(pageNumber) || pageNumber < 1 || pageNumber > maxPage) {
        pageField.current?.focus();
        setData({ page: '' });
        return;
      }

      setData({ page: '' });
      table.setPageIndex(pageNumber - 1);
    }, [data.page, itemsPerPage, rowsCount, setData, table]);

    const handleCancel = useCallback(() => {
      setData({ page: '' });
    }, [setData]);

    const handleFieldKeyDown = useCallback(
      (e) => {
        switch (e.key) {
          case 'Enter':
            handleSubmit();
            break;
          case 'Escape':
            handleCancel();
            break;
          default:
        }
      },
      [handleCancel, handleSubmit],
    );

    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <div ref={ref} className={clsx(s.pagination, className)} {...props}>
        <Button style={ButtonStyle.Icon} title={t('common.firstPage')} onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
          <Icon type={IconType.AngleLeftDouble} size={IconSize.Size13} />
        </Button>
        <Button style={ButtonStyle.Icon} title={t('common.previousPage')} onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          <Icon type={IconType.AngleLeft} size={IconSize.Size13} />
        </Button>
        <Input ref={pageField} name="page" placeholder={currentPageIndex} value={data.page} onKeyDown={handleFieldKeyDown} onChange={handleFieldChange} className={s.paginationPageInput} />
        <span>/{table.getPageCount() || 1}</span>
        <Button style={ButtonStyle.Icon} title={t('common.nextPage')} onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          <Icon type={IconType.AngleLeft} size={IconSize.Size13} className={s.paginationIconRotated} />
        </Button>
        <Button style={ButtonStyle.Icon} title={t('common.lastPage')} onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
          <Icon type={IconType.AngleLeftDouble} size={IconSize.Size13} className={s.paginationIconRotated} />
        </Button>
        <Dropdown
          ref={dropdown}
          options={itemsPerPageOptions}
          placeholder={selectedItemsPerPage.name}
          defaultItem={selectedItemsPerPage}
          isSearchable
          onChange={(item) => handleItemsPerPageSwitch(item)}
          selectFirstOnSearch
          className={s.paginationDropdown}
          inputClassName={s.paginationDropdownInput}
          buttonClassName={s.paginationDropdownButton}
        />
        <ActionsPopup
          table={table}
          fitScreen={fitScreen}
          userPrefsKeys={userPrefsKeys}
          onResetColumnWidths={onResetColumnWidths}
          onResetColumnSorting={onResetColumnSorting}
          onResetColumnVisibility={onResetColumnVisibility}
          onUserPrefsUpdate={onUserPrefsUpdate}
          position="top"
          offset={4}
          hideCloseButton
          keepOnScroll
        >
          <Button style={ButtonStyle.Icon} title={t('common.editListView')} className={s.tableSettingsButton}>
            <Icon type={IconType.Settings} size={IconSize.Size13} className={s.iconTableSettingsButton} />
          </Button>
        </ActionsPopup>
        {children}
      </div>
    );
  }),
);

TablePagination.propTypes = {
  table: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  itemsPerPage: PropTypes.string.isRequired,
  rowsCount: PropTypes.number.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
  fitScreen: PropTypes.bool.isRequired,
  userPrefsKeys: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onResetColumnSorting: PropTypes.func.isRequired,
  onResetColumnWidths: PropTypes.func.isRequired,
  onResetColumnVisibility: PropTypes.func.isRequired,
  onUserPrefsUpdate: PropTypes.func.isRequired,
};

TablePagination.defaultProps = {
  children: undefined,
  className: undefined,
};

export default TablePagination;
