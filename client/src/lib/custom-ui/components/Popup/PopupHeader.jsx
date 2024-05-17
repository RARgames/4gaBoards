import React from 'react';
import PropTypes from 'prop-types';
import { Popup as SemanticUIPopup } from 'semantic-ui-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle } from '../../../../components/Utils/Button'; // TODO temp - change or move PopupHeader to utils
import { Icon, IconType, IconSize } from '../../../../components/Utils/Icon'; // TODO temp - change or move PopupHeader to utils

import styles from './PopupHeader.module.css';

const PopupHeader = React.memo(({ children, onBack }) => {
  const [t] = useTranslation();
  return (
    <SemanticUIPopup.Header className={styles.wrapper}>
      {onBack && (
        <Button style={ButtonStyle.Icon} title={t('common.back')} onClick={onBack} className={styles.backButton}>
          <Icon type={IconType.AngleLeft} size={IconSize.Size14} />
        </Button>
      )}
      <div className={styles.content}>{children}</div>
    </SemanticUIPopup.Header>
  );
});

PopupHeader.propTypes = {
  children: PropTypes.node.isRequired,
  onBack: PropTypes.func,
};

PopupHeader.defaultProps = {
  onBack: undefined,
};

export default PopupHeader;
