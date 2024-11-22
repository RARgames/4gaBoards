import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import TextareaAutosize from 'react-textarea-autosize';

import * as styles from './TextArea.module.scss';
import * as gStyles from '../../../globalStyles.module.scss';

const TextArea = React.forwardRef(({ disableSpellcheck, className, isError, ...props }, ref) => {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <TextareaAutosize ref={ref} spellCheck={!disableSpellcheck} className={classNames(styles.textarea, gStyles.scrollableY, className, isError && styles.textareaError)} {...props} />
  );
});

TextArea.propTypes = {
  disableSpellcheck: PropTypes.bool,
  className: PropTypes.string,
  isError: PropTypes.bool,
};

TextArea.defaultProps = {
  disableSpellcheck: false,
  className: undefined,
  isError: false,
};

export default React.memo(TextArea);
