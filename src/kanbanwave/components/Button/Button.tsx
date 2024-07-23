import { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './Button.module.css';
import React from 'react';

type ButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  variant?: 'text' | 'contained' | 'outlined';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {
    type = 'button',
    className,
    children,
    color = 'primary',
    variant = 'text',
    size = 'sm',
    startIcon,
    endIcon,
    ...rest
  } = props;

  const buttonClass = clsx(
    styles.root,
    styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`],
    styles[`color${color.charAt(0).toUpperCase() + color.slice(1)}`],
    styles[`variant${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    className
  );

  return (
    <button {...rest} ref={ref} className={buttonClass} type={type}>
      {startIcon && <span className={styles.startIcon}>{React.cloneElement(startIcon as React.ReactElement, { size })}</span>}
      {children}
      {endIcon && <span className={styles.endIcon}>{React.cloneElement(endIcon as React.ReactElement, { size })}</span>}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
