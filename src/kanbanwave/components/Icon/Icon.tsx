import clsx from 'clsx';
import { forwardRef } from 'react';
import styles from './Icon.module.css';

type IconProps = React.ComponentPropsWithoutRef<'span'> & {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
};

const Icon = forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
  const {
    'aria-hidden': hidden,
    'aria-label': label,
    className,
    name,
    size = 'md',
    ...rest
  } = props;

  const iconClass = clsx(
    styles.root,
    styles[`icon${size.charAt(0).toUpperCase() + size.slice(1)}`],
    className
  );

  return (
    <span
      {...rest}
      ref={ref}
      className={iconClass}
      aria-hidden={hidden ?? label ? undefined : true}
      aria-label={label}>
      {name}
    </span>
  );
});

Icon.displayName = 'Icon';
export default Icon;
