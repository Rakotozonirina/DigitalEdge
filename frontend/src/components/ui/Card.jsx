import React from 'react';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

export const Card = React.forwardRef(({ className, children, hoverEffect = false, ...props }, ref) => {
  const Component = hoverEffect ? motion.div : 'div';
  const motionProps = hoverEffect ? { whileHover: { y: -5 } } : {};
  
  return (
    <Component
      ref={ref}
      className={cn(
        "rounded-xl border border-dark-700 bg-dark-800/50 backdrop-blur-sm text-white shadow-sm overflow-hidden",
        className
      )}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
});

Card.displayName = "Card";

export const CardHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
)
export const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("font-semibold leading-none tracking-tight text-xl text-white", className)} {...props} />
))
CardTitle.displayName = "CardTitle"

export const CardContent = ({ className, ...props }) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
)

export const CardFooter = ({ className, ...props }) => (
  <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
)
