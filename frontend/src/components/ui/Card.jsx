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
        "rounded-xl border border-light-700 dark:border-dark-700 bg-light-800/50 dark:bg-dark-800/50 backdrop-blur-sm text-gray-900 dark:text-white shadow-sm overflow-hidden transition-colors duration-300",
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
  <h3 ref={ref} className={cn("font-semibold leading-none tracking-tight text-xl text-gray-900 dark:text-white", className)} {...props} />
))
CardTitle.displayName = "CardTitle"

export const CardContent = ({ className, ...props }) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
)

export const CardFooter = ({ className, ...props }) => (
  <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
)
