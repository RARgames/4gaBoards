import React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import PropTypes from 'prop-types';

import { cn } from '../../lib/utils';

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 w-72 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

PopoverContent.propTypes = {
  className: PropTypes.string,
  align: PropTypes.oneOf(['start', 'center', 'end']),
  sideOffset: PropTypes.number,
};
PopoverContent.defaultProps = {
  className: undefined,
  align: 'center',
  sideOffset: 4,
};

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
