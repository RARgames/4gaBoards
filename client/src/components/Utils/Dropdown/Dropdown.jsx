import React, { useCallback, useImperativeHandle, useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Icon, IconType, IconSize, FlagType } from '../Icon';

import styles from './Dropdown.module.scss';
import gStyles from '../../../globalStyles.module.scss';

const Dropdown = React.forwardRef(
  (
    {
      children,
      options,
      defaultItem,
      placeholder,
      isSearchable,
      className,
      onChange,
      onBlur,
      onClose,
      onCancel,
      submitOnBlur,
      stayOpenOnBlur,
      selectFirstOnSearch,
      keepState,
      returnOnChangeEvent,
      ...props
    },
    ref,
  ) => {
    const [isOpened, setIsOpened] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [savedDefaultItem, setSavedDefaultItem] = useState(defaultItem);
    const [searchValue, setSearchValue] = useState('');
    const dropdown = useRef(null);
    const itemsRef = useRef([]);

    const open = useCallback(() => {
      setIsOpened(true);
      setSearchValue('');
    }, []);

    const close = useCallback(() => {
      setIsOpened(false);
      setSearchValue('');
      dropdown.current.blur();
      onClose();
    }, [onClose]);

    useImperativeHandle(
      ref,
      () => ({
        open,
        close,
        clearSavedDefaultItem: () => setSavedDefaultItem(null),
      }),
      [open, close],
    );

    useEffect(() => {
      if (isOpened) {
        dropdown.current.focus();
      }
    }, [isOpened]);

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
        .indexOf(selectedItem.id);
      return currIndex >= 0 ? currIndex : 0;
    }, [getOptions, selectedItem]);

    const getCurrItem = useCallback(() => {
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
          if (savedDefaultItem && savedDefaultItem.id === item.id) {
            return;
          }
          if (returnOnChangeEvent) {
            onChange({ target: { name: dropdown.current.name, value: item.id } });
          } else {
            onChange(item.id);
          }
          setSavedDefaultItem(null);
          if (keepState) {
            setSavedDefaultItem(item);
          }
        }
        close();
      },
      [close, keepState, onChange, returnOnChangeEvent, savedDefaultItem],
    );

    const handleCancel = useCallback(() => {
      if (onCancel) {
        onCancel();
      }
      close();
    }, [close, onCancel]);

    const handleFocus = useCallback(() => {
      if (!isOpened) {
        open();
      }
      if (!savedDefaultItem) {
        setSavedDefaultItem(defaultItem);
      }
      if (savedDefaultItem) {
        const index = getOptions()
          .map((item) => item.id)
          .indexOf(savedDefaultItem.id);
        selectItemByIndex(index >= 0 ? index : 0);
      }
    }, [defaultItem, getOptions, isOpened, open, savedDefaultItem, selectItemByIndex]);

    const handleBlur = useCallback(() => {
      if (onBlur) {
        onBlur();
      }
      if (submitOnBlur) {
        handleSubmit(getCurrItem());
      }
      if (!stayOpenOnBlur) {
        close();
      }
    }, [close, stayOpenOnBlur, getCurrItem, handleSubmit, onBlur, submitOnBlur]);

    const getDisplay = useCallback(() => {
      if (isOpened && selectedItem) {
        return selectedItem.name;
      }
      if (savedDefaultItem) {
        return savedDefaultItem.name;
      }
      return placeholder;
    }, [isOpened, placeholder, savedDefaultItem, selectedItem]);

    const handleItemClick = useCallback(
      (item) => {
        handleSubmit(item);
      },
      [handleSubmit],
    );

    const isSelected = useCallback(
      (item) => {
        return selectedItem === item;
      },
      [selectedItem],
    );

    const handleSearch = useCallback((e) => {
      setSearchValue(e.target.value);
    }, []);

    const handleKeyDown = useCallback(
      (event) => {
        switch (event.key) {
          case 'ArrowUp': {
            event.preventDefault();
            const currIndex = getCurrItemIndex();
            const prevIndex = Math.max(0, currIndex - 1);
            selectItemByIndex(prevIndex);
            break;
          }
          case 'ArrowDown': {
            event.preventDefault();
            const currIndex = getCurrItemIndex();
            const nextIndex = Math.min(getOptions(0).length - 1, currIndex + 1);
            selectItemByIndex(nextIndex);
            break;
          }
          case 'Enter': {
            event.preventDefault();
            handleSubmit(getCurrItem());
            break;
          }
          case 'Tab': {
            event.preventDefault();
            handleSubmit(getCurrItem());
            break;
          }
          case 'Escape': {
            event.preventDefault();
            handleCancel();
            break;
          }
          default:
        }
      },
      [getCurrItem, getCurrItemIndex, getOptions, handleCancel, handleSubmit, selectItemByIndex],
    );

    if (!isOpened && children) {
      return children;
    }

    return (
      <div className={classNames(styles.dropdownContainer, className)}>
        <div className={styles.dropdownInputWrapper}>
          <input
            onChange={handleSearch}
            value={searchValue}
            ref={dropdown}
            className={styles.dropdownSearchInput}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            readOnly={!isSearchable}
            placeholder={getDisplay()}
            {...props} // eslint-disable-line react/jsx-props-no-spreading
          />
          <Icon type={IconType.TriangleDown} size={IconSize.Size10} className={styles.dropdownIcon} />
        </div>
        {isOpened && (
          <div className={classNames(styles.dropdownMenu, gStyles.scrollableYList, getOptions().length > 0 && styles.dropdownMenuWithChildren)}>
            {getOptions().map((item, index) => (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
              <div
                ref={(el) => (itemsRef.current[index] = el)} // eslint-disable-line no-return-assign
                key={item.id}
                id={item.id}
                name={item.name}
                className={classNames(styles.dropdownItem, savedDefaultItem && savedDefaultItem.id === item.id && styles.dropdownItemDefault, isSelected(item) && styles.dropdownItemSelected)}
                onClick={() => handleItemClick(item)}
                onMouseDown={(e) => e.preventDefault()} // Prevent input onBlur
              >
                {item.flag && <Icon type={FlagType[item.flag]} size={IconSize.Size14} className={styles.icon} />}
                {item.icon && <Icon type={IconType[item.icon]} size={IconSize.Size14} className={styles.icon} />}
                {item.name}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
);

Dropdown.propTypes = {
  children: PropTypes.node,
  options: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  defaultItem: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  placeholder: PropTypes.string.isRequired,
  isSearchable: PropTypes.bool,
  className: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onClose: PropTypes.func,
  onCancel: PropTypes.func,
  submitOnBlur: PropTypes.bool,
  stayOpenOnBlur: PropTypes.bool,
  selectFirstOnSearch: PropTypes.bool,
  keepState: PropTypes.bool,
  returnOnChangeEvent: PropTypes.bool,
};

Dropdown.defaultProps = {
  children: null,
  defaultItem: null,
  isSearchable: false,
  onChange: () => {},
  onBlur: undefined,
  onClose: () => {},
  onCancel: undefined,
  submitOnBlur: false,
  stayOpenOnBlur: false,
  selectFirstOnSearch: false,
  keepState: false,
  returnOnChangeEvent: false,
  className: undefined,
};

export default React.memo(Dropdown);
