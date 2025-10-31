import { useState } from 'react'
import { Outlet } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'react-toastify';

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { GenericForm, FormFieldConfig } from '../forms/GenericForm';
import { useAuth } from '@/hooks/useAuth';
import { UpdateUserPayload, meUpdate } from '@/lib/services/users.service';

const profileSchema = z.object({
  name: z.string().min(3, 'O nome é obrigatório.'),
  email: z.string().email('O e-mail é inválido.'),
  login: z.string(), // Apenas para exibição, não será editado
  password: z.string().optional().refine(
    (val) => {
      if (!val) return true;
      const hasUpperCase = /[A-Z]/.test(val);
      const hasLowerCase = /[a-z]/.test(val);
      const hasNumber = /[0-9]/.test(val);
      const hasMinLength = val.length >= 8;
      return hasUpperCase && hasLowerCase && hasNumber && hasMinLength;
    },
    { message: "A senha deve ter no mínimo 8 caracteres, com maiúsculas, minúsculas e números." }
  ),
  avatar: z.any().optional().nullable(),
});

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { mutate: updateProfileMutation, isPending: isUpdating } = useMutation({
    mutationFn: (payload: UpdateUserPayload) => meUpdate(payload),
    onSuccess: () => {
      toast.success("Perfil atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsProfileModalOpen(false);
    },
    onError: (error: Error) => toast.error(`Erro ao atualizar perfil: ${error.message}`),
  });

  const handleProfileSubmit = (data: z.infer<typeof profileSchema>) => {
    const { login, ...payload } = data;
    if (!payload.password) {
      delete payload.password;
    }
    updateProfileMutation(payload);
  };

  const profileFormFields: FormFieldConfig<typeof profileSchema>[] = [
    { name: 'name', label: 'Nome Completo', type: 'text', placeholder: 'Seu nome', gridCols: 2, disabled: false },
    { name: 'email', label: 'E-mail', type: 'email', placeholder: 'seu@email.com', gridCols: 2, disabled: false },
    { name: 'login', label: 'Login', type: 'text', placeholder: 'Seu login', gridCols: 2, disabled: true },
    { name: 'password', label: 'Nova Senha (deixe vazio para manter)', type: 'password', placeholder: 'Nova senha', gridCols: 2, disabled: false },
    { name: 'avatar', label: 'Avatar', type: 'file', accept: '.png,.jpg,.jpeg,.webp', gridCols: 2, disabled: false },
  ];

  const handleOpenProfileModal = () => {
    setTimeout(() => setIsProfileModalOpen(true), 100);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} onProfileEditClick={handleOpenProfileModal} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          <Outlet />
        </main>
      </div>

      <GenericForm
        isOpen={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
        onSubmit={handleProfileSubmit}
        isLoading={isUpdating}
        initialData={user}
        fields={profileFormFields}
        schema={profileSchema}
        title="Editar Perfil"
        description="Atualize suas informações pessoais."
      />
    </div>
  )
}