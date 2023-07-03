import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import LabelColors from '../../constants/LabelColors';

import styles from './Label.module.scss';
import globalStyles from '../../styles.module.scss';

const VARIANTS = {
  CARD: 'card',
  CARDMODAL: 'cardModal',
  LABELS: 'labels',
};

const Label = React.memo(({ name, color, variant, isDisabled, onClick }) => {
  const contentNode = (
    <div title={name} className={classNames(styles.wrapper, styles[`wrapper${upperFirst(variant)}`], onClick && styles.wrapperHoverable, globalStyles[`background${upperFirst(camelCase(color))}`])}>
      {name}
    </div>
  );

  return onClick ? (
    <button type="button" disabled={isDisabled} className={styles.button} onClick={onClick}>
      {contentNode}
    </button>
  ) : (
    contentNode
  );
});

Label.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.oneOf(LabelColors).isRequired,
  variant: PropTypes.oneOf(Object.values(VARIANTS)),
  isDisabled: PropTypes.bool,
  onClick: PropTypes.func,
};

Label.defaultProps = {
  variant: VARIANTS.CARDMODAL,
  isDisabled: false,
  onClick: undefined,
};

export default Label;
