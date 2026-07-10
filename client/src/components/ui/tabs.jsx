import React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import PropTypes from 'prop-types';

import { cn } from '../../lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List ref={ref} className={cn('inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground', className)} {...props} />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={cn('mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', className)} {...props} />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

const sharedPropTypes = { className: PropTypes.string };
const sharedDefaultProps = { className: undefined };
TabsList.propTypes = sharedPropTypes;
TabsList.defaultProps = sharedDefaultProps;
TabsTrigger.propTypes = sharedPropTypes;
TabsTrigger.defaultProps = sharedDefaultProps;
TabsContent.propTypes = sharedPropTypes;
TabsContent.defaultProps = sharedDefaultProps;

export { Tabs, TabsList, TabsTrigger, TabsContent };
