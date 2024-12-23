import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useFloating, shift, flip, offset as posOffset, useClick, useInteractions, autoUpdate, useDismiss, useRole, FloatingFocusManager, FloatingPortal } from '@floating-ui/react';
import classNames from 'classnames';
import { Button, ButtonStyle } from '../Button';
import { Icon, IconType, IconSize } from '../Icon';

import * as s from './Popup.module.scss';

export default (WrappedComponent, defaultProps) => {
  const Popup = React.memo(({ children, className, hideCloseButton, offset, position, closeButtonClassName, wrapperClassName, onClose, ...props }) => {
    const [t] = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const { refs, floatingStyles, context } = useFloating({
      open: isOpen,
      onOpenChange: setIsOpen,
      whileElementsMounted: autoUpdate,
      placement: defaultProps?.position ?? position,
      middleware: [posOffset(defaultProps?.offset ?? offset), flip(), shift({ padding: 6 })],
    });

    const click = useClick(context);
    const dismiss = useDismiss(context);
    const role = useRole(context, { role: 'dialog' });

    const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

    const handleClose = useCallback(() => {
      setIsOpen(false);

      if (onClose) {
        onClose();
      }
    }, [onClose]);

    const toggleOpen = useCallback(() => {
      setIsOpen(!isOpen);
    }, [isOpen]);

    const handleWithinPopupClick = useCallback((e) => {
      e.stopPropagation(); // TODO Prevent e.g. switching card - change how popup handles key input
    }, []);

    return (
      <>
        {/* TODO temp removed: s.wrapper */}
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <div ref={refs.setReference} {...getReferenceProps({ onClick: toggleOpen })} className={classNames(wrapperClassName, defaultProps?.wrapperClassName)}>
          {children}
        </div>
        {isOpen && (
          <FloatingPortal>
            <FloatingFocusManager context={context} modal={false} returnFocus={false}>
              {/* eslint-disable-next-line react/jsx-props-no-spreading, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
              <div className={classNames(s.popup, className, defaultProps?.className)} ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()} onClick={handleWithinPopupClick}>
                {!(defaultProps?.hideCloseButton || hideCloseButton) && (
                  <Button style={ButtonStyle.Icon} title={t('common.close')} onClick={handleClose} className={classNames(s.closeButton, closeButtonClassName, defaultProps?.closeButtonClassName)}>
                    <Icon type={IconType.Close} size={IconSize.Size14} />
                  </Button>
                )}
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <WrappedComponent {...props} onClose={handleClose} />
              </div>
            </FloatingFocusManager>
          </FloatingPortal>
        )}
      </>
    );
  });

  Popup.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    hideCloseButton: PropTypes.bool,
    offset: PropTypes.number,
    position: PropTypes.string,
    closeButtonClassName: PropTypes.string,
    wrapperClassName: PropTypes.string,
    onClose: PropTypes.func,
  };

  Popup.defaultProps = {
    className: undefined,
    hideCloseButton: false,
    offset: 10,
    position: 'bottom',
    closeButtonClassName: undefined,
    wrapperClassName: undefined,
    onClose: undefined,
  };

  return Popup;
};
