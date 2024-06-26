import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

import styles from './FilePicker.module.scss';

const FilePicker = React.memo(({ children, accept, onSelect }) => {
  const field = useRef(null);

  const handleTriggerClick = useCallback(() => {
    field.current.click();
  }, []);

  const handleFieldChange = useCallback(
    ({ target }) => {
      if (target.files.length > 0) {
        Array.from(target.files).forEach((file) => {
          onSelect(file);
        });

        target.value = null; // eslint-disable-line no-param-reassign
      }
    },
    [onSelect],
  );

  const tigger = React.cloneElement(children, {
    onClick: handleTriggerClick,
  });

  return (
    <>
      {tigger}
      <input ref={field} type="file" accept={accept} className={styles.field} onChange={handleFieldChange} multiple />
    </>
  );
});

FilePicker.propTypes = {
  children: PropTypes.element.isRequired,
  accept: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};

FilePicker.defaultProps = {
  accept: undefined,
};

export default FilePicker;
