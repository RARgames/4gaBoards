import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import TextareaAutosize from 'react-textarea-autosize';

import styles from './TextArea.module.scss';
import gStyles from '../../../globalStyles.module.scss';

const TextArea = React.forwardRef(({ disableSpellcheck, className, ...props }, ref) => {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <TextareaAutosize ref={ref} spellCheck={!disableSpellcheck} className={classNames(styles.base, gStyles.scrollableY, className)} {...props} />
  );
});

TextArea.propTypes = {
  disableSpellcheck: PropTypes.bool,
  className: PropTypes.string,
};

TextArea.defaultProps = {
  disableSpellcheck: false,
  className: undefined,
};

export default React.memo(TextArea);
