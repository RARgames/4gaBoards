import React from 'react';
import PropTypes from 'prop-types';

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import classNames from 'classnames';
import globalStyles from '../../styles.module.scss';

const userStyles = {
  background: '#1e1e1e',
  color: '#fff',
  width: 'fit-content',
  display: 'inline',
  padding: '2px',
  borderRadius: '3px',
};

function MentionComponent({ mention, children, decoratedText }) {
  let className;
  if (mention.prefix === '#') {
    className = classNames(globalStyles[`background${upperFirst(camelCase(mention.color))}`]);
  }

  return (
    <div style={userStyles} className={className}>
      {decoratedText}
      <span style={{ display: 'none' }}>{children}</span>
    </div>
  );
}

MentionComponent.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  mention: PropTypes.object.isRequired, // eslint-disable-next-line react/forbid-prop-types
  children: PropTypes.array.isRequired,
  decoratedText: PropTypes.string.isRequired,
};

export default MentionComponent;
