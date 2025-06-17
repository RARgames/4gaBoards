import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFloating, shift, flip, offset as posOffset, size, useClick, useInteractions, autoUpdate, useDismiss, useRole, FloatingFocusManager, FloatingPortal } from '@floating-ui/react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { Button, ButtonStyle } from '../Button';
import { Icon, IconType, IconSize } from '../Icon';

import * as s from './Popup.module.scss';

export default (WrappedComponent, defaultProps) => {
  const Popup = React.memo(({ children, disabled, keepOnScroll, className, hideCloseButton, offset, position, disableShiftCrossAxis, closeButtonClassName, wrapperClassName, onClose, ...props }) => {
    const [t] = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

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

    const { refs, floatingStyles, context } = useFloating({
      open: isOpen,
      onOpenChange,
      whileElementsMounted: autoUpdate,
      placement: defaultProps?.position ?? position,
      middleware: [
        posOffset(defaultProps?.offset ?? offset),
        flip({
          padding: 12,
        }),
        shift({
          crossAxis: !(defaultProps?.disableShiftCrossAxis ?? disableShiftCrossAxis),
          padding: 6,
        }),
        size({
          apply({ availableWidth, availableHeight, elements }) {
            Object.assign(elements.floating.style, {
              maxWidth: `${availableWidth - 12}px`,
              maxHeight: `${availableHeight - 12}px`,
            });
          },
        }),
      ],
    });

    const click = useClick(context, { enabled: !disabled });
    const dismiss = useDismiss(context, { ancestorScroll: !keepOnScroll });
    const role = useRole(context, { role: 'dialog' });

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

    return (
      <>
        {/* TODO temp removed: s.wrapper */}
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <div ref={refs.setReference} {...getReferenceProps()} className={clsx(wrapperClassName, defaultProps?.wrapperClassName)} data-prevent-card-switch={disabled ? undefined : true}>
          {children}
        </div>
        {isOpen && (
          <FloatingPortal>
            <FloatingFocusManager context={context} modal={false} returnFocus={false}>
              {/* eslint-disable-next-line react/jsx-props-no-spreading */}
              <div className={clsx(s.popup, className, defaultProps?.className)} ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()} data-prevent-card-switch>
                {!(defaultProps?.hideCloseButton || hideCloseButton) && (
                  <Button style={ButtonStyle.Icon} title={t('common.close')} onClick={handleCloseClick} className={clsx(s.closeButton, closeButtonClassName, defaultProps?.closeButtonClassName)}>
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
    disabled: PropTypes.bool,
    keepOnScroll: PropTypes.bool,
    className: PropTypes.string,
    hideCloseButton: PropTypes.bool,
    offset: PropTypes.number,
    position: PropTypes.string,
    disableShiftCrossAxis: PropTypes.bool,
    closeButtonClassName: PropTypes.string,
    wrapperClassName: PropTypes.string,
    onClose: PropTypes.func,
  };

  Popup.defaultProps = {
    disabled: false,
    keepOnScroll: false,
    className: undefined,
    hideCloseButton: false,
    offset: 10,
    position: 'bottom',
    disableShiftCrossAxis: false,
    closeButtonClassName: undefined,
    wrapperClassName: undefined,
    onClose: undefined,
  };

  return Popup;
};
