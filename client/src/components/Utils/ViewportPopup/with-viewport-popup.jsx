import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFloating, useDismiss, useRole, useInteractions, FloatingFocusManager, FloatingPortal } from '@floating-ui/react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { Button, ButtonStyle } from '../Button';
import { Icon, IconType, IconSize } from '../Icon';

import * as s from './ViewportPopup.module.scss';

const POSITION_VARIANTS = {
  BOTTOM_LEFT: 'bottomLeft',
  CENTER: 'center',
};

export default (WrappedComponent, defaultProps) => {
  const ViewportPopup = React.memo(({ isOpen, className, hideCloseButton, closeButtonClassName, durationSeconds, positionVariant, variant, onClose, ...props }) => {
    const [t] = useTranslation();
    const resolvedDurationSeconds = defaultProps?.durationSeconds ?? durationSeconds;
    const resolvedPositionVariant = defaultProps?.positionVariant ?? positionVariant;
    const resolvedVariant = defaultProps?.variant ?? variant;

    const handleClose = useCallback(
      (e) => {
        if (onClose) {
          onClose(e);
        }
      },
      [onClose],
    );

    const onOpenChange = useCallback(
      // eslint-disable-next-line no-unused-vars
      (nextOpen, event, reason) => {
        if (!nextOpen && onClose) {
          onClose(event);
        }
      },
      [onClose],
    );

    const { refs, context } = useFloating({
      open: isOpen,
      onOpenChange,
    });

    const dismiss = useDismiss(context, { outsidePress: false });
    const role = useRole(context, { role: 'dialog' });

    const { getFloatingProps } = useInteractions([dismiss, role]);

    const handleCloseClick = useCallback(
      (e) => {
        onOpenChange(false, e?.nativeEvent, 'close-button');
      },
      [onOpenChange],
    );

    useEffect(() => {
      if (!isOpen || resolvedDurationSeconds == null) {
        return undefined;
      }

      const timeout = setTimeout(() => {
        handleClose();
      }, resolvedDurationSeconds * 1000);

      return () => {
        clearTimeout(timeout);
      };
    }, [isOpen, resolvedDurationSeconds, handleClose]);

    if (!isOpen) {
      return null;
    }

    return (
      <FloatingPortal>
        <FloatingFocusManager context={context} modal={false} returnFocus={false}>
          <div
            className={clsx(s.popup, resolvedPositionVariant && s[resolvedPositionVariant], resolvedVariant && s[resolvedVariant], className, defaultProps?.className)}
            ref={refs.setFloating}
            {...getFloatingProps()} // eslint-disable-line react/jsx-props-no-spreading
          >
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
    );
  });

  ViewportPopup.propTypes = {
    isOpen: PropTypes.bool,
    className: PropTypes.string,
    hideCloseButton: PropTypes.bool,
    closeButtonClassName: PropTypes.string,
    durationSeconds: PropTypes.number,
    positionVariant: PropTypes.oneOf(Object.values(POSITION_VARIANTS)),
    variant: PropTypes.oneOf(['success', 'error']),
    onClose: PropTypes.func,
  };

  ViewportPopup.defaultProps = {
    isOpen: false,
    className: undefined,
    hideCloseButton: false,
    closeButtonClassName: undefined,
    durationSeconds: 5,
    positionVariant: POSITION_VARIANTS.BOTTOM_LEFT,
    variant: undefined,
    onClose: undefined,
  };

  return ViewportPopup;
};
