import React, { useCallback, useImperativeHandle, useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Icon, IconType, IconSize, FlagType } from '../Icon';

import styles from './Dropdown.module.scss';
import gStyles from '../../../globalStyles.module.scss';

const Dropdown = React.forwardRef(({ children, options, defaultItem, placeholder, isSearchable, onChange, onBlur, onClose, onCancel, submitOnBlur, stayOpenOnBlur, selectFirstOnSearch }, ref) => {
  const [isOpened, setIsOpened] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
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
    if (selectFirstOnSearch && searchValue) {
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
      if (item && item.id !== defaultItem.id) {
        onChange(item.id);
      }
      close();
    },
    [close, defaultItem.id, onChange],
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
    const defaultItemIndex = getOptions()
      .map((item) => item.id)
      .indexOf(defaultItem.id);
    selectItemByIndex(defaultItemIndex >= 0 ? defaultItemIndex : 0);
  }, [defaultItem.id, getOptions, isOpened, open, selectItemByIndex]);

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
    return placeholder;
  }, [isOpened, placeholder, selectedItem]);

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
    <div className={styles.dropdownContainer}>
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
        />
        <Icon type={IconType.TriangleDown} size={IconSize.Size10} className={styles.dropdownIcon} />
      </div>
      {isOpened && (
        <div className={classNames(styles.dropdownMenu, gStyles.scrollableYList, getOptions().length > 0 && styles.dropdownMenuWithChildren)}>
          {getOptions().map((item, index) => (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
            <div
              // eslint-disable-next-line no-return-assign
              ref={(el) => (itemsRef.current[index] = el)}
              key={item.id}
              id={item.id}
              name={item.name}
              className={classNames(styles.dropdownItem, defaultItem.id === item.id && styles.dropdownItemDefault, isSelected(item) && styles.dropdownItemSelected)}
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
});

Dropdown.propTypes = {
  children: PropTypes.node,
  // eslint-disable-next-line react/forbid-prop-types
  options: PropTypes.array.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  defaultItem: PropTypes.object.isRequired,
  placeholder: PropTypes.string.isRequired,
  isSearchable: PropTypes.bool,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onClose: PropTypes.func,
  onCancel: PropTypes.func,
  submitOnBlur: PropTypes.bool,
  stayOpenOnBlur: PropTypes.bool,
  selectFirstOnSearch: PropTypes.bool,
};

Dropdown.defaultProps = {
  children: null,
  isSearchable: false,
  onChange: () => {},
  onBlur: undefined,
  onClose: () => {},
  onCancel: undefined,
  submitOnBlur: false,
  stayOpenOnBlur: false,
  selectFirstOnSearch: false,
};

export default React.memo(Dropdown);
