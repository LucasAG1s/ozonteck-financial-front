import { useForm, Controller } from 'react-hook-form';
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

/**
 * Define a estrutura de um campo de formulário.
 */
export interface FormFieldConfig {
  name: string; // Key of the field in the schema
  label: string; // Label displayed to the user
  type: 'text' | 'number' | 'date' | 'select' | 'textarea'; // Input type
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  step?: string; // Para campos do tipo 'number'
  gridCols?: number; // Para controlar o layout em grid
}

interface GenericFormProps<T extends z.ZodType<any, any>> {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: z.infer<T>) => void;
  isLoading: boolean;
  initialData?: z.infer<T> | null;
  fields: FormFieldConfig[];
  schema: T;
  title: string;
  description: string;
}

export function GenericForm<T extends z.ZodType<any, any>>({
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

  const renderField = (fieldConfig: FormFieldConfig) => {
    const error = errors[fieldConfig.name]?.message as string | undefined;
    const colSpanClass = fieldConfig.gridCols ? `md:col-span-${fieldConfig.gridCols}` : 'md:col-span-2';

    return (
      <div key={fieldConfig.name} className={colSpanClass}>
        <Label htmlFor={fieldConfig.name}>{fieldConfig.label}</Label>
        {fieldConfig.type === 'select' ? (
          <Controller
            name={fieldConfig.name}
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={String(field.value ?? '')}>
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
        ) : (
          <Input
            id={fieldConfig.name}
            type={fieldConfig.type}
            placeholder={fieldConfig.placeholder}
            step={fieldConfig.type === 'number' ? fieldConfig.step : undefined}
            {...register(fieldConfig.name)}
          />
        )}
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
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