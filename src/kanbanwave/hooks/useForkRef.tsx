import { MutableRefObject, RefCallback } from 'react';

function useForkRef<T>(
  ...refs: Array<MutableRefObject<T | null> | RefCallback<T> | null>
): RefCallback<T> {
  return (instance: T | null) => {
    refs.forEach(ref => {
      if (typeof ref === 'function') {
        ref(instance);
      } else if (ref) {
        (ref as MutableRefObject<T | null>).current = instance;
      }
    });
  };
}

export default useForkRef;
