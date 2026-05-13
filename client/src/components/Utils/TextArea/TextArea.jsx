import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import TextAreaVariant from './TextAreaVariant';

import * as gs from '../../../global.module.scss';
import * as s from './TextArea.module.scss';

const TextArea = React.forwardRef(({ disableSpellcheck, variant, className, isError, ...props }, ref) => {
  const variants = Array.isArray(variant) ? variant.map((v) => s[v]) : variant && s[variant];
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <TextareaAutosize ref={ref} spellCheck={!disableSpellcheck} className={clsx(s.textarea, gs.scrollableY, variants, className, isError && s.textareaError)} {...props} />
  );
});

TextArea.propTypes = {
  disableSpellcheck: PropTypes.bool,
  variant: PropTypes.oneOfType([PropTypes.oneOf(Object.values(TextAreaVariant)), PropTypes.arrayOf(PropTypes.oneOf(Object.values(TextAreaVariant)))]),
  className: PropTypes.string,
  isError: PropTypes.bool,
};

TextArea.defaultProps = {
  disableSpellcheck: false,
  variant: undefined,
  className: undefined,
  isError: false,
};

export default React.memo(TextArea);
