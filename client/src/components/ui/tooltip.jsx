import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import PropTypes from 'prop-types';

import { cn } from '../../lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-md border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
      className,
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

TooltipContent.propTypes = {
  className: PropTypes.string,
  sideOffset: PropTypes.number,
};
TooltipContent.defaultProps = {
  className: undefined,
  sideOffset: 4,
};

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
