/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './Table.module.scss';

const Table = React.memo(
  React.forwardRef(({ children, className, ...rest }, ref) => {
    return (
      <table ref={ref} className={classNames(styles.table, className)} {...rest}>
        {children}
      </table>
    );
  }),
);

Table.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

Table.defaultProps = {
  children: undefined,
  className: undefined,
};

export default Table;
