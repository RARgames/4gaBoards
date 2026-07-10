import React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import PropTypes from 'prop-types';

import { cn } from '../../lib/utils';

const Avatar = React.forwardRef(({ className, ...props }, ref) => <AvatarPrimitive.Root ref={ref} className={cn('relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full', className)} {...props} />);
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef(({ className, ...props }, ref) => <AvatarPrimitive.Image ref={ref} className={cn('aspect-square h-full w-full object-cover', className)} {...props} />);
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback ref={ref} className={cn('flex h-full w-full items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground', className)} {...props} />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

const sharedPropTypes = { className: PropTypes.string };
const sharedDefaultProps = { className: undefined };
Avatar.propTypes = sharedPropTypes;
Avatar.defaultProps = sharedDefaultProps;
AvatarImage.propTypes = sharedPropTypes;
AvatarImage.defaultProps = sharedDefaultProps;
AvatarFallback.propTypes = sharedPropTypes;
AvatarFallback.defaultProps = sharedDefaultProps;

export { Avatar, AvatarImage, AvatarFallback };
