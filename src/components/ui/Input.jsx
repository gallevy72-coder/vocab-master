import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    className = '',
    type = 'text',
    dir = 'auto',
    ...props
  },
  ref
) {
  const inputClasses = [
    'block w-full rounded-lg border shadow-sm transition-colors duration-200',
    'focus:ring-2 focus:ring-offset-0',
    error
      ? 'border-error-500 focus:border-error-500 focus:ring-error-200'
      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200',
    'disabled:bg-gray-100 disabled:cursor-not-allowed',
    'px-4 py-2.5',
    className,
  ].join(' ');

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        dir={dir}
        className={inputClasses}
        {...props}
      />
      {(error || helperText) && (
        <p
          className={`mt-1.5 text-sm ${
            error ? 'text-error-500' : 'text-gray-500'
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
});

export default Input;
