import { useForm, Controller, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { PasswordStrength } from '../ui/PasswordStrength';
import { PasswordInput } from '../ui/PasswordInput';


export interface FormFieldConfig<TFieldValues extends z.AnyZodObject> {
  name: Path<z.infer<TFieldValues>>; 
  label: string; 
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'datetime-local' | 'file' | 'email' | 'password';
  accept?: string;
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  step?: string; 
  disabled?: boolean; 
  gridCols?: number; 
}

interface GenericFormProps<T extends z.ZodObject<any, any, any>> {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: z.infer<T>) => void;
  isLoading: boolean;
  initialData?: Partial<z.infer<T>> | null;
  fields: FormFieldConfig<T>[];
  schema: T;
  title: string;
  description: string;
}

export function GenericForm<T extends z.ZodObject<any, any, any>>({
  isOpen,
  onOpenChange,
  onSubmit,
  isLoading,
  initialData,
  fields,
  schema,
  title,
  description,
}: GenericFormProps<T>) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset(initialData);
      } else {
        const defaultValues = Object.keys(schema.shape).reduce((acc, key) => {
          acc[key] = undefined;
          return acc;
        }, {} as any);
        reset(defaultValues);
      }
    }
  }, [isOpen, initialData, reset, schema]);

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
          <Input
            id={fieldConfig.name}
            type={fieldConfig.type}
            placeholder={fieldConfig.placeholder}
            step={fieldConfig.type === 'number' ? fieldConfig.step : undefined}
            accept={fieldConfig.type === 'file' ? fieldConfig.accept : undefined}
            {...register(fieldConfig.name)}
          />
        )}
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        {fieldConfig.name === 'password' && passwordValue && (
          <PasswordStrength password={passwordValue} />
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {fields.map(renderField)}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : (initialData ? 'Salvar Alterações' : 'Criar')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}