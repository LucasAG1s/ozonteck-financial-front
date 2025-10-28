import { Control, FieldErrors, Path, UseFormRegister, UseFormWatch } from 'react-hook-form';
import { z } from 'zod';
import { Controller } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PasswordInput } from '../ui/PasswordInput';
import { PasswordStrength } from '../ui/PasswordStrength';

export interface FormFieldConfig<TFieldValues extends z.AnyZodObject> {
  name: Path<z.infer<TFieldValues>>;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'datetime-local' | 'file' | 'email' | 'password' | 'month';
  accept?: string;
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  step?: string;
  disabled?: boolean;
  gridCols?: number;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  rightIcon?: React.ReactNode;
}

interface FormFieldsRendererProps<T extends z.ZodObject<any, any, any>> {
  fields: FormFieldConfig<T>[];
  control: Control<z.infer<T>>;
  register: UseFormRegister<z.infer<T>>;
  errors: FieldErrors<z.infer<T>>;
  watch: UseFormWatch<z.infer<T>>;
  setValue: (name: Path<z.infer<T>>, value: any, config?: Object) => void;
}

export function FormFieldsRenderer<T extends z.ZodObject<any, any, any>>({
  fields,
  control,
  register,
  errors,
  watch,
}: FormFieldsRendererProps<T>) {

  const renderField = (fieldConfig: FormFieldConfig<T>) => {
    const error = errors[fieldConfig.name as string]?.message as string | undefined;
    const colSpanClass = fieldConfig.gridCols ? `md:col-span-${fieldConfig.gridCols}` : 'md:col-span-2';

    const passwordValue = fieldConfig.name === 'password' ? watch('password' as Path<z.infer<T>>) : undefined;

    return (
      <div key={fieldConfig.name} className={colSpanClass}>
        <Label htmlFor={fieldConfig.name}>{fieldConfig.label}</Label>
        {fieldConfig.type === 'select' ? (
          <Controller
            name={fieldConfig.name}
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={String(field.value ?? '')} disabled={fieldConfig.disabled}>
                <SelectTrigger><SelectValue placeholder={fieldConfig.placeholder} /></SelectTrigger>
                <SelectContent>
                  {fieldConfig.options?.map(option => (
                    <SelectItem key={option.value} value={String(option.value)}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        ) : fieldConfig.type === 'textarea' ? (
          <Textarea
            id={fieldConfig.name}
            placeholder={fieldConfig.placeholder}
            {...register(fieldConfig.name)}
          />
        ) : fieldConfig.type === 'password' ? (
          <PasswordInput
            id={fieldConfig.name}
            placeholder={fieldConfig.placeholder}
            {...register(fieldConfig.name)}
          />
        ) : (
          <div className="relative">
            <Input
              id={fieldConfig.name}
              type={fieldConfig.type}
              placeholder={fieldConfig.placeholder}
              step={fieldConfig.type === 'number' ? fieldConfig.step : undefined}
              accept={fieldConfig.type === 'file' ? fieldConfig.accept : undefined}
              {...register(fieldConfig.name, { onBlur: fieldConfig.onBlur })}
            />
            {fieldConfig.rightIcon && <div className="absolute inset-y-0 right-0 flex items-center pr-3">{fieldConfig.rightIcon}</div>}
          </div>
        )}
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        {fieldConfig.name === 'password' && passwordValue && (
          <PasswordStrength password={passwordValue} />
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
      {fields.map(renderField)}
    </div>
  );
}