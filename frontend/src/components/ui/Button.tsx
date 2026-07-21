import React, { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'light' | 'dark' | 'signal';
  children: ReactNode;
  className?: string;
  id?: string;
  onClick?: (e: any) => void | Promise<void>;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
  variant = 'light',
  children,
  className = '',
  id,
  ...props
}: ButtonProps) {
  let baseStyles = "rounded-full font-sans text-[13px] sm:text-[14px] font-medium tracking-tight px-6 py-2.5 transition-colors duration-200 cursor-pointer text-center select-none inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2";
  
  let variantStyles = "";
  if (variant === 'light') {
    variantStyles = "bg-paper text-ink border border-ink/10 hover:bg-ink hover:text-paper hover:border-ink";
  } else if (variant === 'dark') {
    variantStyles = "bg-ink text-paper border border-hairline-dark hover:bg-paper hover:text-ink hover:border-ink/20";
  } else if (variant === 'signal') {
    variantStyles = "bg-signal text-ink border border-signal hover:bg-ink hover:text-paper hover:border-ink";
  }

  return (
    <button
      id={id}
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
