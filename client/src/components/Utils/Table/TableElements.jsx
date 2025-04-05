/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { Icon, IconSize, IconType } from '../Icon';
import TableStyle from './TableStyle';

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
  React.forwardRef(({ children, className, style, ...props }, ref) => {
    return (
      <thead ref={ref} className={classNames(s.header, className, style && s[`header${style}`])} {...props}>
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

const Resizer = React.memo(
  React.forwardRef(({ className, ...props }, ref) => {
    return <div ref={ref} className={classNames(s.resizer, className)} {...props} />;
  }),
);

const SortingIndicator = React.memo(
  React.forwardRef(({ className, sortedState, sortIndex, ...props }, ref) => {
    return (
      sortedState && (
        <div ref={ref} className={classNames(s.sortingIndicator, className)} {...props}>
          <Icon type={IconType.SortArrowUp} size={IconSize.Size13} className={classNames(sortedState === 'desc' && s.sortingIconRotated)} />
          {sortIndex && <sub className={s.sortingIndex}>({sortIndex})</sub>}
        </div>
      )
    );
  }),
);

const Body = React.memo(
  React.forwardRef(({ children, className, style, ...props }, ref) => {
    return (
      <tbody ref={ref} className={classNames(s.body, className, style && s[`body${style}`])} {...props}>
        {children}
      </tbody>
    );
  }),
);

const Row = React.memo(
  React.forwardRef(({ children, className, selected, ...props }, ref) => {
    return (
      <tr ref={ref} className={classNames(s.bodyRow, className, selected && s.bodyRowSelected)} {...props}>
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
  style: PropTypes.oneOf(Object.values(TableStyle)),
};

Header.defaultProps = {
  children: undefined,
  className: undefined,
  style: TableStyle.Default,
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

Resizer.propTypes = {
  className: PropTypes.string,
};

Resizer.defaultProps = {
  className: undefined,
};

SortingIndicator.propTypes = {
  className: PropTypes.string,
  sortedState: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  sortIndex: PropTypes.number,
};

SortingIndicator.defaultProps = {
  className: undefined,
  sortedState: undefined,
  sortIndex: undefined,
};

Body.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.oneOf(Object.values(TableStyle)),
};

Body.defaultProps = {
  children: undefined,
  className: undefined,
  style: TableStyle.Default,
};

Row.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  selected: PropTypes.bool,
};

Row.defaultProps = {
  children: undefined,
  className: undefined,
  selected: false,
};

Cell.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

Cell.defaultProps = {
  children: undefined,
  className: undefined,
};

export { Wrapper, Header, HeaderRow, HeaderCell, Resizer, SortingIndicator, Body, Row, Cell };
