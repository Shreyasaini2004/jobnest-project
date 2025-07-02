import { useForm, UseFormProps, SubmitHandler, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

/**
 * A custom hook that integrates React Hook Form with Zod validation.
 * This provides type safety and validation for forms.
 * 
 * @param schema The Zod schema to validate the form against
 * @param options Additional options for useForm
 * @returns A form instance with Zod validation
 */
export function useZodForm<TSchema extends z.ZodType>(
  schema: TSchema,
  options: Omit<UseFormProps<z.infer<TSchema>>, 'resolver'> = {}
): UseFormReturn<z.infer<TSchema>> {
  return useForm<z.infer<TSchema>>({
    ...options,
    resolver: zodResolver(schema),
  });
}

/**
 * A type-safe wrapper for form submission handlers.
 * 
 * @example
 * const onSubmit = createSubmitHandler<LoginSchema>((data) => {
 *   // data is fully typed according to the schema
 *   console.log(data.email, data.password);
 * });
 */
export function createSubmitHandler<TSchema extends z.ZodType>(
  callback: (data: z.infer<TSchema>) => void | Promise<void>
): SubmitHandler<z.infer<TSchema>> {
  return async (data) => {
    await callback(data);
  };
}