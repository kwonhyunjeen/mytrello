import clsx from 'clsx';
import useForkRef from 'kanbanwave/hooks/useForkRef';
import { forwardRef, useEffect, useRef } from 'react';
import styles from './TextArea.module.css';

type TextAreaProps = React.ComponentPropsWithoutRef<'textarea'> & {};

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>((props, ref) => {
  const { className, onChange, value, ...rest } = props;
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const textCallbackRef = useForkRef(textAreaRef, ref);

  const resize = () => {
    if (textAreaRef && textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    resize();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e);
    }
    resize();
  };

  return (
    <textarea
      {...rest}
      ref={textCallbackRef}
      value={value}
      onChange={handleChange}
      className={clsx(styles.root, className)}></textarea>
  );
});

TextArea.displayName = 'TextArea';
export default TextArea;
