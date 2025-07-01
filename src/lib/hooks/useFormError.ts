import { FieldError, FieldErrors } from 'react-hook-form';

/**
 * A utility hook to handle form errors in a consistent way
 * 
 * @param errors The errors object from react-hook-form
 * @returns An object with utility functions for handling errors
 */
export function useFormError<T extends Record<string, any>>(errors: FieldErrors<T>) {
  /**
   * Get the error message for a specific field
   * 
   * @param name The name of the field
   * @returns The error message or undefined if no error
   */
  const getFieldError = (name: keyof T): string | undefined => {
    const fieldError = errors[name] as FieldError | undefined;
    return fieldError?.message;
  };

  /**
   * Check if a field has an error
   * 
   * @param name The name of the field
   * @returns True if the field has an error, false otherwise
   */
  const hasFieldError = (name: keyof T): boolean => {
    return !!errors[name];
  };

  /**
   * Get the error state for a field (for styling purposes)
   * 
   * @param name The name of the field
   * @returns An object with error state information
   */
  const getFieldState = (name: keyof T) => {
    const hasError = hasFieldError(name);
    return {
      error: hasError,
      errorMessage: hasError ? getFieldError(name) : undefined,
      'aria-invalid': hasError,
      'aria-errormessage': hasError ? `${String(name)}-error` : undefined,
    };
  };

  return {
    getFieldError,
    hasFieldError,
    getFieldState,
    hasErrors: Object.keys(errors).length > 0,
  };
}