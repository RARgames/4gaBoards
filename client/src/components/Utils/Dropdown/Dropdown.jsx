import React, { useCallback, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFloating, shift, flip, offset, size, useInteractions, autoUpdate, useDismiss, useRole, FloatingFocusManager, FloatingPortal } from '@floating-ui/react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { Button, ButtonStyle } from '../Button';
import { Icon, IconType, IconSize, FlagType } from '../Icon';
import DropdownStyle from './DropdownStyle';

import * as gs from '../../../global.module.scss';
import * as s from './Dropdown.module.scss';

const Dropdown = React.forwardRef(
  (
    {
      children,
      style,
      options,
      defaultItem,
      isMultiple,
      defaultItems,
      placeholder,
      isSearchable,
      isError,
      className,
      dropdownMenuClassName,
      inputClassName,
      buttonClassName,
      onChange,
      onBlur,
      onOpen,
      onClose,
      onCancel,
      onErrorClear,
      submitOnBlur,
      stayOpenOnBlur,
      selectFirstOnSearch,
      returnOnChangeEvent,
      keepOnScroll,
      ...props
    },
    ref,
  ) => {
    const [t] = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedItems, setSelectedItems] = useState(defaultItems);
    const [searchValue, setSearchValue] = useState('');
    const dropdown = useRef(null);
    const itemsRef = useRef([]);
    const styles = Array.isArray(style) ? style.map((st) => s[st]) : style && s[style];

    const open = useCallback(() => {
      setIsOpen(true);
      setSearchValue('');
      onErrorClear();
      dropdown.current?.focus();
      onOpen();
    }, [onErrorClear, onOpen]);

    const close = useCallback(() => {
      setIsOpen(false);
      setSearchValue('');
      dropdown.current?.blur();
      onClose();
    }, [onClose]);

    useImperativeHandle(
      ref,
      () => ({
        open,
        close,
      }),
      [open, close],
    );

    useEffect(() => {
      if (isOpen) {
        dropdown.current?.focus();
      }
    }, [isOpen]);

    const getOptions = useCallback(() => {
      if (!searchValue) {
        return options;
      }
      return options.filter((item) => item.name.toLowerCase().startsWith(searchValue.toLowerCase()));
    }, [options, searchValue]);

    useEffect(() => {
      if (selectFirstOnSearch && searchValue && searchValue.length > 0) {
        const firstItem = getOptions()[0];
        if (firstItem) {
          setSelectedItem(firstItem);
        }
      }
    }, [searchValue, selectFirstOnSearch, getOptions]);

    const getCurrItemIndex = useCallback(() => {
      const currIndex = getOptions()
        .map((item) => item.id)
        .indexOf(selectedItem?.id);
      return currIndex >= 0 ? currIndex : 0;
    }, [getOptions, selectedItem]);

    const getCurrItem = useCallback(() => {
      if (!selectedItem) {
        return null;
      }
      return getOptions().find((item) => item.id === selectedItem.id);
    }, [getOptions, selectedItem]);

    const scrollItemIntoView = useCallback((itemRef) => {
      if (itemRef) {
        itemRef.scrollIntoView({
          behavior: 'auto',
          block: 'center',
          inline: 'center',
        });
      }
    }, []);

    const selectItemByIndex = useCallback(
      (index) => {
        setSelectedItem(getOptions()[index]);
        scrollItemIntoView(itemsRef.current[index]);
      },
      [getOptions, scrollItemIntoView],
    );

    const handleSubmit = useCallback(
      (item) => {
        if (item) {
          if (defaultItem && defaultItem.id === item.id) {
            close();
            return;
          }
          if (returnOnChangeEvent) {
            onChange({ target: { name: dropdown.current.name, value: item.id } });
          } else {
            onChange(item);
          }
        }
        close();
      },
      [close, onChange, returnOnChangeEvent, defaultItem],
    );

    const handleCancel = useCallback(() => {
      if (onCancel) {
        onCancel();
      }
      close();
    }, [close, onCancel]);

    const handleFocus = useCallback(() => {
      if (!isOpen) {
        open();
      }
      if (defaultItem) {
        const index = getOptions()
          .map((item) => item.id)
          .indexOf(defaultItem.id);
        selectItemByIndex(index >= 0 ? index : 0);
      }
    }, [getOptions, isOpen, open, defaultItem, selectItemByIndex]);

    const handleBlur = useCallback(
      (e) => {
        if (e.relatedTarget && (e.relatedTarget.closest(`.${s.dropdownMenu}`) || e.relatedTarget.closest(`.${s.dropdownContainer}`))) {
          return;
        }
        if (onBlur) {
          onBlur();
        }
        if (submitOnBlur && selectedItem) {
          handleSubmit(getCurrItem());
        }
        if (!stayOpenOnBlur) {
          close();
        }
      },
      [close, getCurrItem, handleSubmit, onBlur, selectedItem, stayOpenOnBlur, submitOnBlur],
    );

    const toggleMultipleItem = useCallback(
      (item) => {
        setSelectedItems((prevSelectedItems) => {
          const nextSelectedItems = prevSelectedItems.some((prevItem) => prevItem.id === item.id) ? prevSelectedItems.filter((prevItem) => prevItem.id !== item.id) : [...prevSelectedItems, item];
          onChange(nextSelectedItems);
          return nextSelectedItems;
        });
      },
      [onChange],
    );

    const getDisplay = useCallback(() => {
      if (isMultiple) {
        if (selectedItems.length === 0) {
          return placeholder;
        }
        if (selectedItems.length === 1) {
          return selectedItems[0].name;
        }
        return t('common.nSelected', { count: selectedItems.length });
      }
      if (isOpen && selectedItem) {
        return selectedItem.name;
      }
      if (defaultItem) {
        return defaultItem.name;
      }
      return placeholder;
    }, [isMultiple, selectedItems, isOpen, placeholder, defaultItem, selectedItem, t]);

    const handleItemClick = useCallback(
      (item) => {
        if (!item) {
          if (!isMultiple) {
            handleSubmit(item);
          }
          return;
        }
        if (isMultiple) {
          toggleMultipleItem(item);
          return;
        }
        setSelectedItem(item);
        handleSubmit(item);
      },
      [isMultiple, toggleMultipleItem, handleSubmit],
    );

    const isSelected = useCallback(
      (item) => {
        if (isMultiple) {
          return selectedItems.some((selectedItemItem) => selectedItemItem.id === item.id);
        }
        return selectedItem === item;
      },
      [isMultiple, selectedItems, selectedItem],
    );

    const handleSearch = useCallback((e) => {
      setSearchValue(e.target.value);
    }, []);

    const handleKeyDown = useCallback(
      (e) => {
        switch (e.key) {
          case 'ArrowUp': {
            const currIndex = getCurrItemIndex();
            const prevIndex = Math.max(0, currIndex - 1);
            selectItemByIndex(prevIndex);
            break;
          }
          case 'ArrowDown': {
            const currIndex = getCurrItemIndex();
            const nextIndex = Math.min(getOptions(0).length - 1, currIndex + 1);
            selectItemByIndex(nextIndex);
            break;
          }
          case 'Enter': {
            e.stopPropagation(); // TODO Prevent accepting popup - change how popup handles key input
            handleItemClick(getCurrItem());
            break;
          }
          case 'Tab': {
            e.stopPropagation(); // TODO Prevent accepting popup - change how popup handles key input
            e.preventDefault(); // Prevent switching focus
            if (isMultiple) {
              close();
            } else {
              handleSubmit(getCurrItem());
            }
            break;
          }
          case 'Escape': {
            e.stopPropagation(); // TODO Prevent closing whole popup - change how popup handles key input
            handleCancel();
            break;
          }
          default:
        }
      },
      [getCurrItem, getCurrItemIndex, getOptions, handleCancel, handleItemClick, handleSubmit, isMultiple, close, selectItemByIndex],
    );

    const handleDropdownToggleClick = useCallback(() => {
      if (isOpen) {
        if (isMultiple) {
          close();
        } else {
          handleSubmit(selectedItem);
        }
      } else {
        open();
      }
    }, [open, close, handleSubmit, isOpen, isMultiple, selectedItem]);

    const onOpenChange = useCallback(
      // eslint-disable-next-line no-unused-vars
      (nextOpen, event, reason) => {
        setIsOpen(nextOpen);

        if (!nextOpen) {
          setSearchValue('');
          onClose();
        }
      },
      [onClose],
    );

    const { refs, floatingStyles, context } = useFloating({
      open: isOpen,
      onOpenChange,
      whileElementsMounted: autoUpdate,
      placement: 'bottom',
      middleware: [
        offset(0),
        flip(),
        shift({ padding: 10 }),
        size({
          apply({ rects, elements }) {
            Object.assign(elements.floating.style, {
              width: `${rects.reference.width}px`,
            });
          },
        }),
      ],
    });

    const dismiss = useDismiss(context, { ancestorScroll: !keepOnScroll });
    const role = useRole(context, { role: 'dialog' });
    const { getReferenceProps, getFloatingProps } = useInteractions([dismiss, role]);

    if (!isOpen && children) {
      return children;
    }

    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <div ref={refs.setReference} {...getReferenceProps()} className={clsx(s.dropdownContainer, styles, className)}>
        <div>
          <input
            onChange={handleSearch}
            value={searchValue}
            ref={dropdown}
            className={clsx(s.dropdownSearchInput, isError && s.dropdownSearchInputError, inputClassName)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            readOnly={!isSearchable}
            placeholder={getDisplay()}
            title={getDisplay()}
            {...props} // eslint-disable-line react/jsx-props-no-spreading
          />
          <Button
            style={ButtonStyle.Icon}
            title={isOpen ? t('common.closeDropdown') : t('common.openDropdown')}
            onClick={handleDropdownToggleClick}
            className={clsx(s.dropdownButton, isError && s.dropdownButtonError, buttonClassName)}
          >
            <Icon type={IconType.TriangleDown} size={IconSize.Size10} />
          </Button>
        </div>
        {isOpen && (
          <FloatingPortal>
            <FloatingFocusManager context={context} initialFocus={-1} returnFocus={false}>
              <div
                {...getFloatingProps()} // eslint-disable-line react/jsx-props-no-spreading
                ref={refs.setFloating}
                style={floatingStyles}
                className={clsx(s.dropdownMenu, gs.scrollableY, getOptions().length > 0 && s.dropdownMenuWithChildren, dropdownMenuClassName)}
              >
                {getOptions().map((item, index) => (
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                  <div
                    ref={(el) => (itemsRef.current[index] = el)} // eslint-disable-line no-return-assign
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    className={clsx(s.dropdownItem, isMultiple && s.dropdownItemMultiple, defaultItem && defaultItem.id === item.id && s.dropdownItemDefault, isSelected(item) && s.dropdownItemSelected)}
                    onClick={() => handleItemClick(item)}
                    onMouseDown={(e) => e.preventDefault()} // Prevent input onBlur
                    data-prevent-card-switch
                  >
                    {isMultiple && <Icon type={IconType.Check} size={IconSize.Size12} className={clsx(s.multiCheckIcon, !isSelected(item) && s.multiCheckIconHidden)} />}
                    {item.flags && item.flags.map((flag) => <Icon key={flag} type={FlagType[flag]} size={IconSize.Size14} className={s.icon} />)}
                    {item.icon && <Icon type={IconType[item.icon]} size={IconSize.Size14} className={s.icon} />}
                    {item.name}
                    {item.badge && <span className={s.badge}>{item.badge}</span>}
                  </div>
                ))}
              </div>
            </FloatingFocusManager>
          </FloatingPortal>
        )}
      </div>
    );
  },
);

Dropdown.propTypes = {
  children: PropTypes.node,
  style: PropTypes.oneOfType([PropTypes.oneOf(Object.values(DropdownStyle)), PropTypes.arrayOf(PropTypes.oneOf(Object.values(DropdownStyle)))]),
  options: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  defaultItem: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  isMultiple: PropTypes.bool,
  defaultItems: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  placeholder: PropTypes.string.isRequired,
  isSearchable: PropTypes.bool,
  isError: PropTypes.bool,
  className: PropTypes.string,
  dropdownMenuClassName: PropTypes.string,
  inputClassName: PropTypes.string,
  buttonClassName: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  onCancel: PropTypes.func,
  onErrorClear: PropTypes.func,
  submitOnBlur: PropTypes.bool,
  stayOpenOnBlur: PropTypes.bool,
  selectFirstOnSearch: PropTypes.bool,
  returnOnChangeEvent: PropTypes.bool,
  keepOnScroll: PropTypes.bool,
};

Dropdown.defaultProps = {
  children: null,
  style: undefined,
  defaultItem: null,
  isMultiple: false,
  defaultItems: [],
  isSearchable: false,
  isError: false,
  onChange: () => {},
  onBlur: undefined,
  onOpen: () => {},
  onClose: () => {},
  onCancel: undefined,
  onErrorClear: () => {},
  submitOnBlur: false,
  stayOpenOnBlur: false,
  selectFirstOnSearch: false,
  returnOnChangeEvent: false,
  className: undefined,
  dropdownMenuClassName: undefined,
  inputClassName: undefined,
  buttonClassName: undefined,
  keepOnScroll: false,
};

export default React.memo(Dropdown);
