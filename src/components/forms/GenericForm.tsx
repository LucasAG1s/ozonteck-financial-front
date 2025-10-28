import { useForm, Path } from 'react-hook-form';
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
import { FormFieldsRenderer } from './FormFieldsRenderer';

export interface FormFieldConfig<TFieldValues extends z.AnyZodObject> {
  name: Path<z.infer<TFieldValues>>; 
  label: string; 
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'datetime-local' | 'file' | 'email' | 'password' |'month';
  accept?: string;
  placeholder?: string;
  options?: { value: string | number ; label: string }[];
  step?: string; 
  disabled?: boolean; 
  gridCols?: number; 
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  rightIcon?: React.ReactNode;
}

interface GenericFormProps<T extends z.ZodObject<any, any, any>> {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: z.infer<T>) => void;
  isLoading: boolean;
  initialData?: Partial<z.infer<T>> | null;
  fields: FormFieldConfig<T>[] | ((watch: (name: Path<z.infer<T>>) => any, setValue: (name: Path<z.infer<T>>, value: any, config?: Object) => void) => FormFieldConfig<T>[]);
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
    setValue,
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

  const renderedFields = typeof fields === 'function' ? fields(watch, setValue) : fields;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormFieldsRenderer
            fields={renderedFields}
            control={control}
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
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