import React from 'react';
import classNames from 'classnames';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import PropTypes from 'prop-types';

import LabelColors from '../../constants/LabelColors';
import { Button } from '../Utils';

import * as globalStyles from '../../styles.module.scss';
import * as s from './Label.module.scss';

const VARIANTS = {
  CARD: 'card',
  CARDMODAL: 'cardModal',
  LABELS: 'labels',
};

const Label = React.memo(({ name, color, variant, isDisabled, isRemovable, className, onClick }) => {
  const contentNode = (
    <div
      title={name}
      className={classNames(
        s.wrapper,
        s[`wrapper${upperFirst(variant)}`],
        onClick && s.wrapperHoverable,
        isRemovable && s.wrapperRemovable,
        globalStyles[`background${upperFirst(camelCase(color))}`],
        className,
      )}
    >
      {name}
    </div>
  );

  return onClick ? (
    <Button onClick={onClick} disabled={isDisabled} className={s.button}>
      {contentNode}
    </Button>
  ) : (
    contentNode
  );
});

Label.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.oneOf(LabelColors).isRequired,
  variant: PropTypes.oneOf(Object.values(VARIANTS)),
  isDisabled: PropTypes.bool,
  isRemovable: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

Label.defaultProps = {
  variant: VARIANTS.CARDMODAL,
  isDisabled: false,
  isRemovable: false,
  className: undefined,
  onClick: undefined,
};

export default Label;
