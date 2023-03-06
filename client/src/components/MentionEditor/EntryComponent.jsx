import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import classNames from 'classnames';
import globalStyles from '../../styles.module.scss';

export default function Entry({ mention, isFocused, id, onMouseUp, onMouseDown, onMouseEnter }) {
  const entryRef = useRef(null);
  let className = 'mention-text';

  if (isFocused) {
    className += ' mention-focused';
  }

  useEffect(() => {
    if (isFocused) {
      if ('scrollIntoViewIfNeeded' in document.body) {
        entryRef.current.scrollIntoViewIfNeeded(false);
      } else {
        entryRef.current.scrollIntoView(false);
      }
    }
  }, [isFocused]);

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div style={{ display: 'flex', alignItems: 'center' }} ref={entryRef} className={className} id={id} onMouseUp={onMouseUp} onMouseEnter={onMouseEnter} onMouseDown={onMouseDown}>
      {mention.prefix === '@' && <img src={mention.avatar} alt="avatar" style={{ border: '1px solid #ebebec', borderRadius: '50%', height: '25px', width: '25px' }} />}
      {mention.prefix === '#' && (
        <div className={classNames(globalStyles[`background${upperFirst(camelCase(mention.color))}`])} style={{ border: '1px solid #ebebec', height: '17px', width: '17px' }} />
      )}
      <div style={{ marginLeft: '10px' }}>{mention.name}</div>
    </div>
  );
}

Entry.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  mention: PropTypes.any.isRequired, // eslint-disable-next-line react/forbid-prop-types
  isFocused: PropTypes.any.isRequired, // eslint-disable-next-line react/forbid-prop-types
  id: PropTypes.any.isRequired, // eslint-disable-next-line react/forbid-prop-types
  onMouseUp: PropTypes.any.isRequired, // eslint-disable-next-line react/forbid-prop-types
  onMouseDown: PropTypes.any.isRequired, // eslint-disable-next-line react/forbid-prop-types
  onMouseEnter: PropTypes.any.isRequired,
};
