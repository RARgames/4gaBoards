/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import * as s from './Table.module.scss';

const Wrapper = React.memo(
  React.forwardRef(({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={classNames(s.wrapper, className)} {...props}>
        {children}
      </div>
    );
  }),
);

const Header = React.memo(
  React.forwardRef(({ children, className, ...props }, ref) => {
    return (
      <thead ref={ref} className={classNames(s.header, className)} {...props}>
        {children}
      </thead>
    );
  }),
);

const HeaderRow = React.memo(
  React.forwardRef(({ children, className, ...props }, ref) => {
    return (
      <tr ref={ref} className={classNames(s.headerRow, className)} {...props}>
        {children}
      </tr>
    );
  }),
);

const HeaderCell = React.memo(
  React.forwardRef(({ children, className, ...props }, ref) => {
    return (
      <th ref={ref} className={classNames(s.headerCell, className)} {...props}>
        {children}
      </th>
    );
  }),
);

const Body = React.memo(
  React.forwardRef(({ children, className, ...props }, ref) => {
    // TODO temp removed s.body
    return (
      <tbody ref={ref} className={classNames(className)} {...props}>
        {children}
      </tbody>
    );
  }),
);

const Row = React.memo(
  React.forwardRef(({ children, className, ...props }, ref) => {
    return (
      <tr ref={ref} className={classNames(s.bodyRow, className)} {...props}>
        {children}
      </tr>
    );
  }),
);

const Cell = React.memo(
  React.forwardRef(({ children, className, ...props }, ref) => {
    return (
      <td ref={ref} className={classNames(s.bodyCell, className)} {...props}>
        {children}
      </td>
    );
  }),
);

Wrapper.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

Wrapper.defaultProps = {
  children: undefined,
  className: undefined,
};

Header.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

Header.defaultProps = {
  children: undefined,
  className: undefined,
};

HeaderRow.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

HeaderRow.defaultProps = {
  children: undefined,
  className: undefined,
};

HeaderCell.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

HeaderCell.defaultProps = {
  children: undefined,
  className: undefined,
};

Body.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

Body.defaultProps = {
  children: undefined,
  className: undefined,
};

Row.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

Row.defaultProps = {
  children: undefined,
  className: undefined,
};

Cell.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

Cell.defaultProps = {
  children: undefined,
  className: undefined,
};

export { Wrapper, Header, HeaderRow, HeaderCell, Body, Row, Cell };
