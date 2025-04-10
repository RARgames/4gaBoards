import React, { useRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { useForm } from '../../../hooks';
import { Button, ButtonStyle } from '../Button';
import { Dropdown } from '../Dropdown';
import { Icon, IconSize, IconType } from '../Icon';
import { Input } from '../Input';

import * as s from './Table.module.scss';

const TablePagination = React.memo(
  React.forwardRef(({ table, itemsPerPage, rowsCount, userPrefsKey, children, className, onUserPrefsUpdate, ...props }, ref) => {
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
        onUserPrefsUpdate({ [userPrefsKey]: item.id });
        setSelectedItemsPerPage(item);
        if (item.id === 'all') {
          table.setPageSize(Number.MAX_SAFE_INTEGER);
        } else {
          table.setPageSize(Number(item.id));
        }
      },
      [onUserPrefsUpdate, table, userPrefsKey],
    );

    const handleSubmit = useCallback(() => {
      const pageNumber = parseInt(data.page, 10);
      const maxPage = itemsPerPage === 'all' ? 1 : Math.ceil(rowsCount / Number(itemsPerPage));
      if (Number.isNaN(pageNumber) || pageNumber < 1 || pageNumber > maxPage) {
        pageField.current.focus();
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
      <div ref={ref} className={classNames(s.pagination, className)} {...props}>
        <Button style={ButtonStyle.Icon} title={t('common.firstPage')} onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
          <Icon type={IconType.AngleLeftDouble} size={IconSize.Size13} />
        </Button>
        <Button style={ButtonStyle.Icon} title={t('common.previousPage')} onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          <Icon type={IconType.AngleLeft} size={IconSize.Size13} />
        </Button>
        <Input ref={pageField} name="page" placeholder={currentPageIndex} value={data.page} onKeyDown={handleFieldKeyDown} onChange={handleFieldChange} className={s.paginationPageInput} />
        <span>/{table.getPageCount()}</span>
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
        {children}
      </div>
    );
  }),
);

TablePagination.propTypes = {
  table: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  itemsPerPage: PropTypes.string.isRequired,
  rowsCount: PropTypes.number.isRequired,
  userPrefsKey: PropTypes.string.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
  onUserPrefsUpdate: PropTypes.func.isRequired,
};

TablePagination.defaultProps = {
  children: undefined,
  className: undefined,
};

export default TablePagination;
