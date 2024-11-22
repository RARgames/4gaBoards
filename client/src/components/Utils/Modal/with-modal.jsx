import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useFloating, useClick, useInteractions, useDismiss, useRole, FloatingFocusManager, FloatingOverlay, FloatingPortal } from '@floating-ui/react';
import classNames from 'classnames';
import { Button, ButtonStyle } from '../Button';
import { Icon, IconType, IconSize } from '../Icon';

import * as styles from './Modal.module.scss';

export default (WrappedComponent, defaultProps) => {
  const Modal = React.memo(({ children, className, hideCloseButton, closeButtonClassName, wrapperClassName, isModalOpen, setIsModalOpen, onClose, ...props }) => {
    const [t] = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const { refs, context } = useFloating({
      open: isOpen || isModalOpen,
      onOpenChange: setIsOpen && setIsModalOpen,
    });

    const click = useClick(context);
    const dismiss = useDismiss(context);
    const role = useRole(context);

    const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

    const handleClose = useCallback(() => {
      setIsOpen(false);
      setIsModalOpen(false);

      if (onClose) {
        onClose();
      }
    }, [onClose, setIsModalOpen]);

    const modalContent = (
      <FloatingPortal>
        <FloatingOverlay lockScroll className={styles.modalOverlay}>
          <FloatingFocusManager context={context} returnFocus={false}>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <div className={classNames(styles.modal, className, defaultProps?.className)} ref={refs.setFloating} {...getFloatingProps()}>
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
          {(isOpen || isModalOpen) && modalContent}
        </>
      );
    }

    return isOpen || isModalOpen ? modalContent : null;
  });

  Modal.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    hideCloseButton: PropTypes.bool,
    closeButtonClassName: PropTypes.string,
    wrapperClassName: PropTypes.string,
    isModalOpen: PropTypes.bool,
    setIsModalOpen: PropTypes.func,
    onClose: PropTypes.func,
  };

  Modal.defaultProps = {
    children: undefined,
    className: undefined,
    hideCloseButton: false,
    closeButtonClassName: undefined,
    wrapperClassName: undefined,
    isModalOpen: false,
    setIsModalOpen: () => {},
    onClose: undefined,
  };

  return Modal;
};
