import React, { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'paper' | 'warm' | 'ink';
  hoverEffect?: boolean;
  children: ReactNode;
  className?: string;
  id?: string;
}

export default function Card({
  variant = 'paper',
  hoverEffect = false,
  children,
  className = '',
  id,
  ...props
}: CardProps) {
  let baseStyles = "border text-ink font-sans transition-all duration-200";
  
  let variantStyles = "";
  if (variant === 'paper') {
    variantStyles = "bg-paper border-hairline";
  } else if (variant === 'warm') {
    variantStyles = "bg-paper-warm border-hairline";
  } else if (variant === 'ink') {
    variantStyles = "bg-ink text-paper border-hairline-dark";
  }

  let hoverStyles = hoverEffect ? "hover:border-ink/30 dark:hover:border-white/30" : "";

  return (
    <div
      id={id}
      className={`${baseStyles} ${variantStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
