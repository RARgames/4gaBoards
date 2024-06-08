import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useFloating, useClick, useInteractions, useDismiss, useRole, FloatingFocusManager, FloatingOverlay, FloatingPortal } from '@floating-ui/react';
import classNames from 'classnames';
import { Button, ButtonStyle } from '../Button';
import { Icon, IconType, IconSize } from '../Icon';

import styles from './Modal.module.scss';

export default (WrappedComponent, defaultProps) => {
  const Modal = React.memo(({ children, className, hideCloseButton, closeButtonClassName, wrapperClassName, isModalOpened, setIsModalOpened, onClose, ...props }) => {
    const [t] = useTranslation();
    const [isOpened, setIsOpened] = useState(false);

    const { refs, context } = useFloating({
      open: isOpened || isModalOpened,
      onOpenChange: setIsOpened && setIsModalOpened,
    });

    const click = useClick(context);
    const dismiss = useDismiss(context);
    const role = useRole(context);

    const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

    const handleClose = useCallback(() => {
      setIsOpened(false);
      setIsModalOpened(false);

      if (onClose) {
        onClose();
      }
    }, [onClose, setIsModalOpened]);

    const modalContent = (
      <FloatingPortal>
        <FloatingOverlay lockScroll className={styles.modalOverlay}>
          <FloatingFocusManager context={context} returnFocus={false}>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <div className={classNames(styles.wrapper, className, defaultProps?.className)} ref={refs.setFloating} {...getFloatingProps()}>
              {!(defaultProps?.hideCloseButton || hideCloseButton) && (
                <Button style={ButtonStyle.Icon} title={t('common.close')} onClick={handleClose} className={classNames(styles.closeButton, closeButtonClassName, defaultProps?.closeButtonClassName)}>
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
          {(isOpened || isModalOpened) && modalContent}
        </>
      );
    }

    return isOpened || isModalOpened ? modalContent : null;
  });

  Modal.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    hideCloseButton: PropTypes.bool,
    closeButtonClassName: PropTypes.string,
    wrapperClassName: PropTypes.string,
    isModalOpened: PropTypes.bool,
    setIsModalOpened: PropTypes.func,
    onClose: PropTypes.func,
  };

  Modal.defaultProps = {
    children: undefined,
    className: undefined,
    hideCloseButton: false,
    closeButtonClassName: undefined,
    wrapperClassName: undefined,
    isModalOpened: false,
    setIsModalOpened: () => {},
    onClose: undefined,
  };

  return Modal;
};
