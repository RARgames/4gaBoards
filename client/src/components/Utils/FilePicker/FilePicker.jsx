import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

import * as s from './FilePicker.module.scss';

const FilePicker = React.memo(({ children, accept, multiple, onSelect }) => {
  const field = useRef(null);

  const handleTriggerClick = useCallback(() => {
    field.current.click();
  }, []);

  const handleFieldChange = useCallback(
    ({ target }) => {
      if (target.files.length > 0) {
        [...target.files].forEach((file) => {
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
      <input ref={field} type="file" accept={accept} className={s.field} onChange={handleFieldChange} multiple={multiple} />
    </>
  );
});

FilePicker.propTypes = {
  children: PropTypes.element.isRequired,
  accept: PropTypes.string,
  multiple: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
};

FilePicker.defaultProps = {
  accept: undefined,
  multiple: false,
};

export default FilePicker;
