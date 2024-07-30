import { forwardRef } from 'react';
import clsx from 'clsx';
import Button from '../Button/Button';
import styles from './IconButton.module.css';
import Icon from '../Icon/Icon';

type IconButtonProps = Omit<React.ComponentPropsWithoutRef<typeof Button>, 'size' | 'startIcon' | 'endIcon' | 'children'> & {
  icon: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>((props, ref) => {
  const {
    className,
    color = 'primary',
    icon,
    size = 'sm',
    variant = 'text',
    ...rest
  } = props;

  const buttonClass = clsx(
    styles.root,
    styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`],
    className
  );

  return (
    <Button
      {...rest}
      ref={ref}
      className={buttonClass}
      color={color}
      variant={variant}
      size={size}>
      <Icon name={icon} size={size} />
    </Button>
  );
});

IconButton.displayName = 'IconButton';
export default IconButton;