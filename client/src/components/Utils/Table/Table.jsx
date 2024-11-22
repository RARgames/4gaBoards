import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import * as styles from './Table.module.scss';

const Table = React.memo(
  React.forwardRef(({ children, className, ...props }, ref) => {
    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <table ref={ref} className={classNames(styles.table, className)} {...props}>
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
