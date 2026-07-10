import React from 'react';
import PropTypes from 'prop-types';

import { cn } from '../../lib/utils';

const Card = React.forwardRef(({ className, ...props }, ref) => <div ref={ref} className={cn('rounded-lg border border-border bg-card text-card-foreground shadow-sm', className)} {...props} />);
Card.displayName = 'Card';

const CardHeader = React.forwardRef(({ className, ...props }, ref) => <div ref={ref} className={cn('flex flex-col gap-1.5 p-4', className)} {...props} />);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h3 ref={ref} className={cn('text-sm font-semibold leading-none tracking-tight', className)} {...props}>
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({ className, ...props }, ref) => <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef(({ className, ...props }, ref) => <div ref={ref} className={cn('p-4 pt-0', className)} {...props} />);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef(({ className, ...props }, ref) => <div ref={ref} className={cn('flex items-center p-4 pt-0', className)} {...props} />);
CardFooter.displayName = 'CardFooter';

const sharedPropTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};
const sharedDefaultProps = {
  className: undefined,
  children: undefined,
};

Card.propTypes = sharedPropTypes;
Card.defaultProps = sharedDefaultProps;
CardHeader.propTypes = sharedPropTypes;
CardHeader.defaultProps = sharedDefaultProps;
CardTitle.propTypes = sharedPropTypes;
CardTitle.defaultProps = sharedDefaultProps;
CardDescription.propTypes = sharedPropTypes;
CardDescription.defaultProps = sharedDefaultProps;
CardContent.propTypes = sharedPropTypes;
CardContent.defaultProps = sharedDefaultProps;
CardFooter.propTypes = sharedPropTypes;
CardFooter.defaultProps = sharedDefaultProps;

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
