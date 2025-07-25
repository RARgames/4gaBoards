import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { Button, ButtonStyle } from '../Button';
import { Icon, IconType, IconSize } from '../Icon';
import MessageStyle from './MessageStyle';

import * as s from './Message.module.scss';

const Message = React.forwardRef(({ title, style, content, className, onDismiss, ...props }, ref) => {
  const [t] = useTranslation();
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <div ref={ref} title={content} className={clsx(s.message, style && s[style], className)} {...props}>
      {content}
      <Button style={ButtonStyle.Icon} title={title || t('common.close')} onClick={onDismiss} className={s.closeButton}>
        <Icon type={IconType.Close} size={IconSize.Size14} />
      </Button>
    </div>
  );
});

Message.propTypes = {
  title: PropTypes.string,
  style: PropTypes.oneOf(Object.values(MessageStyle)),
  content: PropTypes.string,
  className: PropTypes.string,
  onDismiss: PropTypes.func,
};

Message.defaultProps = {
  title: undefined,
  style: undefined,
  content: undefined,
  className: undefined,
  onDismiss: undefined,
};

export default React.memo(Message);
