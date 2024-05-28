import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Button, ButtonStyle } from '../Button';
import { Icon, IconType, IconSize } from '../Icon';

import styles from './PopupHeader.module.scss';

const PopupHeader = React.memo(({ children, className, onBack, ...props }) => {
  const [t] = useTranslation();
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <div className={classNames(styles.wrapper, className)} {...props}>
      {onBack && (
        <Button style={ButtonStyle.Icon} title={t('common.back')} onClick={onBack} className={styles.backButton}>
          <Icon type={IconType.AngleLeft} size={IconSize.Size14} />
        </Button>
      )}
      <div className={styles.content}>{children}</div>
    </div>
  );
});

PopupHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  onBack: PropTypes.func,
};

PopupHeader.defaultProps = {
  className: undefined,
  onBack: undefined,
};

export default PopupHeader;
