import { forwardRef, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Input.module.css';

type InputProps = Omit<React.ComponentPropsWithoutRef<'input'>, 'size'> & {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'standard' | 'outlined' | 'filled';
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  label?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    className,
    size = 'md',
    variant = 'outlined',
    color = 'default',
    label,
    helperText,
    leftIcon,
    rightIcon,
    ...rest
  } = props;

  const wrapperClass = clsx(
    styles.wrapper,
    {
      [styles.hasLeftIcon]: !!leftIcon,
      [styles.hasRightIcon]: !!rightIcon
    }
  );

  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={wrapperClass}>
        {leftIcon && <span className={styles.iconWithLeft}>{leftIcon}</span>}
        <input
          {...rest}
          ref={ref}
          className={clsx(
            styles.input,
            styles[size],
            styles[variant],
            styles[color],
            className
          )}
        />
        {rightIcon && <span className={styles.iconWithRight}>{rightIcon}</span>}
      </div>
      {helperText && <p className={styles.helperText}>{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
