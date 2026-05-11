import React, { useCallback, useState, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { useFloating, useClick, useInteractions, useDismiss, useRole, FloatingFocusManager, FloatingOverlay, FloatingPortal } from '@floating-ui/react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { Button, ButtonStyle } from '../Button';
import { Icon, IconType, IconSize } from '../Icon';

import * as s from './Modal.module.scss';

export default (WrappedComponent, defaultProps) => {
  const Modal = React.forwardRef(({ children, disabled, className, hideCloseButton, closeButtonClassName, wrapperClassName, onClose, ...props }, ref) => {
    const [t] = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    useImperativeHandle(
      ref,
      () => ({
        setIsOpen,
      }),
      [setIsOpen],
    );

    const onOpenChange = useCallback(
      // eslint-disable-next-line no-unused-vars
      (nextOpen, event, reason) => {
        setIsOpen(nextOpen);

        if (!nextOpen) {
          if (onClose) {
            onClose();
          }
        }
      },
      [onClose],
    );

    const { refs, context } = useFloating({
      open: isOpen,
      onOpenChange,
    });

    const click = useClick(context, { enabled: !disabled });
    const dismiss = useDismiss(context);
    const role = useRole(context);

    const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

    const handleCloseClick = useCallback(
      (e) => {
        onOpenChange(false, e?.nativeEvent, 'close-button');
      },
      [onOpenChange],
    );

    const handleClose = useCallback(
      (e) => {
        onOpenChange(false, e?.nativeEvent, 'close-event');
      },
      [onOpenChange],
    );

    const modalContent = (
      <FloatingPortal>
        <FloatingOverlay lockScroll className={s.modalOverlay}>
          <FloatingFocusManager context={context} returnFocus={false}>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <div className={clsx(s.modal, className, defaultProps?.className)} ref={refs.setFloating} {...getFloatingProps()}>
              {!(defaultProps?.hideCloseButton || hideCloseButton) && (
                <Button style={ButtonStyle.Icon} title={t('common.close')} onClick={handleCloseClick} className={clsx(s.closeButton, closeButtonClassName, defaultProps?.closeButtonClassName)}>
                  <Icon type={IconType.Close} size={IconSize.Size14} />
                </Button>
              )}
              {/* eslint-disable-next-line react/jsx-props-no-spreading */}
              <WrappedComponent {...props} onClose={handleClose} />
            </div>
          </FloatingFocusManager>
        </FloatingOverlay>
      </FloatingPortal>
    );

    if (children !== undefined) {
      return (
        <>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <div ref={refs.setReference} {...getReferenceProps()} className={wrapperClassName}>
            {children}
          </div>
          {isOpen && modalContent}
        </>
      );
    }

    return isOpen ? modalContent : null;
  });

  Modal.propTypes = {
    children: PropTypes.node,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    hideCloseButton: PropTypes.bool,
    closeButtonClassName: PropTypes.string,
    wrapperClassName: PropTypes.string,
    onClose: PropTypes.func,
  };

  Modal.defaultProps = {
    children: undefined,
    disabled: false,
    className: undefined,
    hideCloseButton: false,
    closeButtonClassName: undefined,
    wrapperClassName: undefined,
    onClose: undefined,
  };

  return Modal;
};
