import React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({ className, type, error, ...props }, ref) => {
  return (
    <div className="relative w-full">
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-md border border-dark-700 bg-dark-800 px-4 py-2 text-sm text-white transition-colors",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-neutral-500",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500 mt-1 absolute -bottom-5 left-0">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
