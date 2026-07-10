import React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import PropTypes from 'prop-types';

import { cn } from '../../lib/utils';

const Separator = React.forwardRef(({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root ref={ref} decorative={decorative} orientation={orientation} className={cn('shrink-0 bg-border', orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', className)} {...props} />
));
Separator.displayName = SeparatorPrimitive.Root.displayName;

Separator.propTypes = {
  className: PropTypes.string,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  decorative: PropTypes.bool,
};
Separator.defaultProps = {
  className: undefined,
  orientation: 'horizontal',
  decorative: true,
};

export { Separator };
