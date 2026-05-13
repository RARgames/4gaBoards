import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { Button, ButtonVariant } from '../Button';
import { Icon, IconType, IconSize } from '../Icon';
import MessageVariant from './MessageVariant';

import * as s from './Message.module.scss';

const Message = React.forwardRef(({ title, variant, content, className, onDismiss, ...props }, ref) => {
  const [t] = useTranslation();
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <div ref={ref} title={content} className={clsx(s.message, variant && s[variant], className)} {...props}>
      {content}
      <Button variant={ButtonVariant.Icon} title={title || t('common.close')} onClick={onDismiss} className={s.closeButton}>
        <Icon type={IconType.Close} size={IconSize.Size14} />
      </Button>
    </div>
  );
});

Message.propTypes = {
  title: PropTypes.string,
  variant: PropTypes.oneOf(Object.values(MessageVariant)),
  content: PropTypes.string,
  className: PropTypes.string,
  onDismiss: PropTypes.func,
};

Message.defaultProps = {
  title: undefined,
  variant: undefined,
  content: undefined,
  className: undefined,
  onDismiss: undefined,
};

export default React.memo(Message);
