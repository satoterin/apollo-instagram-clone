import { useEffect, useRef } from 'react';
import cn from 'classnames';
import { useField } from 'formik';

type InterfaceProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  name: string;
  label: string;
  error?: string;
  focusOnRender?: boolean;
  inline?: boolean;
  labelClassName?: string;
  helperText?: string;
};

const InputField: React.FC<InterfaceProps> = ({
  label,
  focusOnRender,
  inline,
  labelClassName,
  helperText,
  ref,
  ...props
}) => {
  const [field, { error, touched }] = useField(props);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (focusOnRender) {
      inputRef.current?.focus();
    }
  }, [focusOnRender]);

  return (
    <div
      className={cn('mb-5', {
        'md:grid md:grid-cols-2-form gap-10 ': inline,
      })}
    >
      <label
        className={cn('mb-1 font-bold inline-block', labelClassName, {
          'md:text-right w-full': inline,
        })}
        htmlFor={props.name}
      >
        {label}
      </label>
      <div>
        <input
          {...field}
          className={`w-full px-2 mb-3 py-1 rounded-md border-gray-300 ${
            error && touched
              ? 'border-2 border-red-500 bg-red-100'
              : 'bg-blue-50 border focus:border-gray-500'
          }`}
          {...props}
          ref={inputRef}
          autoComplete=''
        />
        <small className='block leading-4 text-gray-500'>{helperText}</small>
        {touched && error && (
          <small className='my-1 text-red-700'>{error}</small>
        )}
      </div>
    </div>
  );
};

export default InputField;
