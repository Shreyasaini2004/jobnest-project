import React from 'react';
import { useFormContext, Controller, FieldValues, Path } from 'react-hook-form';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { FormControl, FormDescription, FormField as ShadcnFormField, FormItem, FormLabel, FormMessage } from './ui/form';

type BaseFieldProps<T extends FieldValues> = {
  name: Path<T>;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

type InputFieldProps<T extends FieldValues> = BaseFieldProps<T> & {
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'tel' | 'url';
  placeholder?: string;
};

type TextareaFieldProps<T extends FieldValues> = BaseFieldProps<T> & {
  type: 'textarea';
  placeholder?: string;
  rows?: number;
};

type SelectFieldProps<T extends FieldValues> = BaseFieldProps<T> & {
  type: 'select';
  placeholder?: string;
  options: { value: string; label: string }[];
};

type CheckboxFieldProps<T extends FieldValues> = BaseFieldProps<T> & {
  type: 'checkbox';
  checkboxLabel?: string;
};

type FormFieldProps<T extends FieldValues> =
  | InputFieldProps<T>
  | TextareaFieldProps<T>
  | SelectFieldProps<T>
  | CheckboxFieldProps<T>;

/**
 * A reusable form field component that works with React Hook Form
 * Supports various input types: text, email, password, textarea, select, checkbox
 */
export function FormField<T extends FieldValues>(props: FormFieldProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <ShadcnFormField
      control={control}
      name={props.name}
      render={({ field, fieldState }) => (
        <FormItem className={props.className}>
          {props.label && (
            <FormLabel className={props.required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}>
              {props.label}
            </FormLabel>
          )}
          
          <FormControl>
            {props.type === 'textarea' ? (
              <Textarea
                {...field}
                value={field.value || ''}
                placeholder={props.placeholder}
                rows={props.rows || 3}
                disabled={props.disabled}
                aria-invalid={!!fieldState.error}
                aria-errormessage={fieldState.error ? `${props.name}-error` : undefined}
              />
            ) : props.type === 'select' ? (
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={props.disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder={props.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {props.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : props.type === 'checkbox' ? (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={props.name}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={props.disabled}
                />
                {props.checkboxLabel && (
                  <Label htmlFor={props.name} className="text-sm font-normal">
                    {props.checkboxLabel}
                  </Label>
                )}
              </div>
            ) : (
              <Input
                {...field}
                value={field.value || ''}
                type={props.type}
                placeholder={props.placeholder}
                disabled={props.disabled}
                aria-invalid={!!fieldState.error}
                aria-errormessage={fieldState.error ? `${props.name}-error` : undefined}
              />
            )}
          </FormControl>
          
          {props.description && <FormDescription>{props.description}</FormDescription>}
          <FormMessage id={`${props.name}-error`} />
        </FormItem>
      )}
    />
  );
}